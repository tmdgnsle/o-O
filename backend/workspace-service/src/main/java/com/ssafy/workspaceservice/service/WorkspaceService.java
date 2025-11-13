package com.ssafy.workspaceservice.service;

import com.ssafy.workspaceservice.client.MindmapClient;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.entity.WorkspaceMember;
import com.ssafy.workspaceservice.enums.*;
import com.ssafy.workspaceservice.exception.*;
import com.ssafy.workspaceservice.repository.WorkspaceMemberRepository;
import com.ssafy.workspaceservice.repository.WorkspaceRepository;
import com.ssafy.workspaceservice.repository.WorkspaceVisibilityView;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final MindmapClient mindmapClient;

    private static final int MAX_MEMBERS = 6;
    private static final int DEFAULT_PAGE_SIZE = 20;

    public WorkspaceResponse create(Long userId) {
        String INITIAL_TITLE = "제목 없음";

        Workspace workspace = Workspace.builder()
                .theme(WorkspaceTheme.PASTEL)
                .type(WorkspaceType.PERSONAL)
                .visibility(WorkspaceVisibility.PRIVATE)
                .title(INITIAL_TITLE)
                .token(UUID.randomUUID().toString())
                .build();
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(saved)
                .userId(userId)
                .role(WorkspaceRole.MAINTAINER)
                .pointerColor(PointerColor.randomColor())
                .build();
        workspaceMemberRepository.save(member);

        return WorkspaceResponse.from(saved);
    }

    // 워크스페이스 조회
    // 요청자 멤버 여부/역할 조회
    // 멤버 수 집계
    // WorkspaceDetailResponse 반환
     @Transactional(readOnly = true)
    public WorkspaceDetailResponse getDetail(Long workspaceId, Long requesterUserId) {
        // 1. 워크스페이스 존재 확인
        Workspace w = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 2. 요청자가 멤버인지 확인
        Optional<WorkspaceMember> mine = Optional.empty();
        if (requesterUserId != null) {
            mine = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, requesterUserId);
        }

        boolean isMember = mine.isPresent();

        // 3. 접근 권한 확인: 비공개 워크스페이스는 멤버만 조회 가능
        if (w.getVisibility() == WorkspaceVisibility.PRIVATE && !isMember) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MEMBER);
        }

        // 4. 응답 생성
        String myRole = String.valueOf(mine.map(WorkspaceMember::getRole).orElse(null));
        Long memberCount = workspaceMemberRepository.countByWorkspaceId(workspaceId);

        return WorkspaceDetailResponse.of(w, isMember, myRole, memberCount);
    }

    // 멤버 권한 변경
    public void changeMemberRole(Long workspaceId, Long requestUserId, Long targetUserId, WorkspaceRole newRole) {
        // 1. 요청자 권한 확인
        WorkspaceMember requestMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, requestUserId)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MEMBER));

        if (requestMember.getRole() != WorkspaceRole.MAINTAINER) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MAINTAINER);
        }

        // 2. 대상 멤버 확인
        WorkspaceMember targetMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 3. 역할 변경
        targetMember.changeRole(newRole);  // 더티 체킹으로 자동 업데이트
    }

    // 워크스페이스 공개/비공개 토글
    //TODO: 트렌드 반영할 때마다 퍼블릭인 것만 대상으로 할 거라 회수할 수 없다는 메시지 안 띄워도 될 거 같은데..
    public void changeVisibility(Long workspaceId) {
        Workspace w = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 토글: PUBLIC ↔ PRIVATE
        WorkspaceVisibility newVisibility = (w.getVisibility() == WorkspaceVisibility.PUBLIC)
                ? WorkspaceVisibility.PRIVATE
                : WorkspaceVisibility.PUBLIC;

        w.changeVisibility(newVisibility); // @Transaction 어노테이션으로 더티 체킹을 통해 자동 업데이트
    }

    // 내가 속한 워크스페이스 조회 (커서 기반 페이징)
    @Transactional(readOnly = true)
    public WorkspaceCursorResponse getMyWorkspaces(Long userId, String category, Long cursor) {
        // size+1개 조회하여 hasNext 판단
        Pageable pageable = PageRequest.of(0, DEFAULT_PAGE_SIZE + 1);
        List<Workspace> workspaces;

        // category에 따라 쿼리 분기
        switch (category.toLowerCase()) {
            case "recent":
                // 전체 워크스페이스
                if (cursor == null) {
                    workspaces = workspaceRepository.findMyWorkspacesInitial(userId, pageable);
                } else {
                    workspaces = workspaceRepository.findMyWorkspacesWithCursor(userId, cursor, pageable);
                }
                break;

            case "team":
                // TEAM 타입만
                if (cursor == null) {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeInitial(userId, WorkspaceType.TEAM, pageable);
                } else {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeWithCursor(userId, WorkspaceType.TEAM, cursor, pageable);
                }
                break;

            case "personal":
                // PERSONAL 타입만
                if (cursor == null) {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeInitial(userId, WorkspaceType.PERSONAL, pageable);
                } else {
                    workspaces = workspaceRepository.findMyWorkspacesByTypeWithCursor(userId, WorkspaceType.PERSONAL, cursor, pageable);
                }
                break;

            default:
                throw new BadRequestException(ErrorCode.INVALID_INPUT_VALUE);
        }

        // hasNext 확인 (size+1개 조회했으므로)
        boolean hasNext = workspaces.size() > DEFAULT_PAGE_SIZE;

        // 실제 반환할 데이터 (size개만)
        List<WorkspaceSimpleResponse> content = workspaces.stream()
                .limit(DEFAULT_PAGE_SIZE)
                .map(WorkspaceSimpleResponse::from)
                .toList();

        // nextCursor는 마지막 항목의 id
        Long nextCursor = hasNext && !content.isEmpty()
                ? content.getLast().id()
                : null;

        return WorkspaceCursorResponse.of(content, nextCursor, hasNext);
    }


    // 워크스페이스 삭제
    public void delete(Long workspaceId, Long userId) {
        // 1. 워크스페이스 존재 확인
        workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 2. 멤버 여부 확인
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MEMBER));

        // 3. MAINTAINER 권한 확인
        if (member.getRole() != WorkspaceRole.MAINTAINER) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_NOT_MAINTAINER);
        }

        // 4. Cascade 삭제: WorkspaceMember 먼저 삭제
        workspaceMemberRepository.deleteByWorkspaceId(workspaceId);

        // 5. TODO: Mindmap-Service에 workspaceId의 모든 마인드맵 노드 삭제 요청
        // mindmapClient.deleteAllNodesByWorkspaceId(workspaceId);

        // 6. 워크스페이스 삭제
        workspaceRepository.deleteById(workspaceId);
    }

    // 토큰으로 워크스페이스 참여
    public void joinByToken(String token, Long userId) {
        // 1. 토큰으로 워크스페이스 찾기
        Workspace workspace = workspaceRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.INVALID_INVITE_TOKEN));

        // 2. 이미 멤버인지 확인
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userId)) {
            throw new BadRequestException(ErrorCode.WORKSPACE_ALREADY_MEMBER);
        }

        // 3. 최대 인원 체크
        long currentMemberCount = workspaceMemberRepository.countByWorkspaceId(workspace.getId());
        if (currentMemberCount >= MAX_MEMBERS) {
            throw new BadRequestException(ErrorCode.WORKSPACE_FULL);
        }

        // 4. 멤버 추가 (기본 권한: VIEW)
        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .userId(userId)
                .role(WorkspaceRole.VIEW)
                .pointerColor(PointerColor.randomColor())
                .build();

        workspaceMemberRepository.save(newMember);
    }

    public List<WorkspaceSimpleResponse> getAllMyWorkspacesForMobile(Long userId) {
        List<Workspace> workspaces = workspaceRepository.findAllMyRecentWorkspaces(userId);
        return workspaces.stream()
                .map(WorkspaceSimpleResponse::from)
                .toList();
    }

    /**
     * Public 워크스페이스 ID 목록 조회
     */
    public List<Long> getPublicWorkspaceIds() {
        log.debug("[WorkspacePublicService] Fetching public workspace IDs");

        List<Long> ids = workspaceRepository.findIdsByVisibility(WorkspaceVisibility.PUBLIC);

        log.debug("[WorkspacePublicService] Found {} public workspaces", ids.size());

        return ids;
    }

    @Transactional(readOnly = true)
    public String getVisibilityOnly(Long workspaceId) {
        return workspaceRepository.findVisibilityById(workspaceId)
                .map(WorkspaceVisibilityView::getVisibility)
                .orElseThrow(() -> new WorkspaceNotFoundException(workspaceId));
    }

    /**
     * 월별 활성 날짜 조회 (웹 전용)
     * 내가 멤버인 워크스페이스들이 생성된 날짜만 반환
     */
    @Transactional(readOnly = true)
    public List<String> getActivityDays(Long userId, String month) {
        // month 형식: "2025-11"
        String[] parts = month.split("-");
        if (parts.length != 2) {
            throw new BadRequestException(ErrorCode.INVALID_INPUT_VALUE);
        }

        int year = Integer.parseInt(parts[0]);
        int monthValue = Integer.parseInt(parts[1]);

        if (monthValue < 1 || monthValue > 12) {
            throw new BadRequestException(ErrorCode.INVALID_INPUT_VALUE);
        }

        log.debug("Fetching activity days for userId={}, year={}, month={}", userId, year, monthValue);
        List<Integer> days = workspaceRepository.findActiveDaysByUserAndMonth(userId, year, monthValue);

        // Integer 일자를 yyyy-MM-dd 형식으로 변환
        return days.stream()
                .map(day -> String.format("%04d-%02d-%02d", year, monthValue, day))
                .toList();
    }

    /**
     * 특정 날짜의 나의 키워드 Top 10 조회 (모바일/웹 공통)
     * 해당 날짜에 생성된 워크스페이스들의 노드 키워드를 랜덤으로 최대 10개 반환
     */
    @Transactional(readOnly = true)
    public List<String> getActivityKeywords(Long userId, LocalDate date) {
        // LocalDate를 LocalDateTime으로 변환 (해당 날짜 00:00:00)
        LocalDateTime dateTime = date.atStartOfDay();

        log.debug("Fetching activity keywords for userId={}, date={}", userId, date);

        // 1. 해당 날짜에 생성된 내 워크스페이스 ID 목록 조회
        List<Long> workspaceIds = workspaceRepository.findWorkspaceIdsByUserAndDate(userId, dateTime);

        if (workspaceIds.isEmpty()) {
            log.debug("No workspaces found for userId={} on date={}", userId, date);
            return List.of();
        }

        log.debug("Found {} workspaces for userId={} on date={}", workspaceIds.size(), userId, date);

        try {
            // 2. Mindmap Service에서 해당 워크스페이스들의 모든 키워드 조회
            List<String> allKeywords = mindmapClient.getKeywordsByWorkspaceIds(workspaceIds);

            if (allKeywords.isEmpty()) {
                log.debug("No keywords found for workspaces: {}", workspaceIds);
                return List.of();
            }

            // 3. 랜덤으로 섞은 후 최대 10개만 선택
            List<String> shuffled = new ArrayList<>(allKeywords);
            Collections.shuffle(shuffled);
            List<String> result = shuffled.stream()
                    .limit(10)
                    .toList();

            log.debug("Returning {} keywords out of {} total", result.size(), allKeywords.size());
            return result;

        } catch (Exception e) {
            log.error("Failed to fetch keywords from mindmap-service: {}", e.getMessage());
            return List.of();
        }
    }
}