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
    private static final int MAX_TOTAL_NODES = 10;  // 캘린더에서 반환할 총 노드 수
    private static final int MIN_NODES_PER_WORKSPACE = 1;
    private static final int MAX_NODES_PER_WORKSPACE = 3;

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

    // 날짜별 사용자 워크스페이스 조회
    @Transactional(readOnly = true)
    public List<WorkspaceCalendarItemResponse> calendar(Long userId, LocalDate from, LocalDate to) {
        // LocalDate를 LocalDateTime으로 변환 (from 00:00:00 ~ to+1 00:00:00)
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.plusDays(1).atStartOfDay();

        // 사용자의 워크스페이스 조회
        List<Workspace> workspaces = workspaceRepository.findByUserIdAndDateRange(userId, fromDateTime, toDateTime);

        // 랜덤으로 워크스페이스와 노드 선택
        List<Workspace> randomWorkspaces = selectRandomWorkspaces(new ArrayList<>(workspaces));
        Map<Long, List<MindmapNodeDto>> workspaceNodesMap = fetchAndDistributeRandomNodes(randomWorkspaces);

        // 평면 구조로 DTO 변환 (노드가 있는 워크스페이스만 반환)
        return randomWorkspaces.stream()
                .map(workspace -> {
                    List<MindmapNodeDto> nodes = workspaceNodesMap.getOrDefault(workspace.getId(), List.of());
                    return WorkspaceCalendarItemResponse.of(workspace, nodes);
                })
                .toList();
    }

    /**
     * 워크스페이스 목록에서 랜덤으로 선택 (총 노드 수가 10개를 초과하지 않도록)
     */
    private List<Workspace> selectRandomWorkspaces(List<Workspace> workspaces) {
        if (workspaces.isEmpty()) {
            return List.of();
        }

        Collections.shuffle(workspaces);
        Random random = new Random();
        List<Workspace> selected = new ArrayList<>();
        int remainingNodes = MAX_TOTAL_NODES;

        for (Workspace workspace : workspaces) {
            if (remainingNodes <= 0) {
                break;
            }

            // 이 워크스페이스에서 선택할 노드 수 (1~3개 랜덤, 남은 개수 고려)
            int nodesToSelect = random.nextInt(
                    Math.min(MAX_NODES_PER_WORKSPACE, remainingNodes) - MIN_NODES_PER_WORKSPACE + 1
            ) + MIN_NODES_PER_WORKSPACE;

            selected.add(workspace);
            remainingNodes -= nodesToSelect;
        }

        return selected;
    }

    /**
     * 선택된 워크스페이스들에 대해 랜덤 노드를 조회하고 분배 (단일 API 호출로 최적화)
     */
    private Map<Long, List<MindmapNodeDto>> fetchAndDistributeRandomNodes(List<Workspace> workspaces) {
        if (workspaces.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<MindmapNodeDto>> result = new HashMap<>();
        Random random = new Random();

        try {
            // 모든 워크스페이스 ID를 한 번에 조회 (N+1 문제 해결)
            List<Long> workspaceIds = workspaces.stream()
                    .map(Workspace::getId)
                    .toList();

            log.debug("Fetching nodes for {} workspaces in batch", workspaceIds.size());
            Map<Long, List<MindmapNodeDto>> allNodesMap = mindmapClient.getNodesByWorkspaceIds(workspaceIds);

            // 각 워크스페이스별로 랜덤 노드 선택
            int remainingNodes = MAX_TOTAL_NODES;

            for (Workspace workspace : workspaces) {
                if (remainingNodes <= 0) {
                    break;
                }

                Long workspaceId = workspace.getId();
                List<MindmapNodeDto> allNodes = allNodesMap.getOrDefault(workspaceId, List.of());

                if (allNodes.isEmpty()) {
                    result.put(workspaceId, List.of());
                    continue;
                }

                // 이 워크스페이스에 할당할 노드 수 결정 (1~3개 랜덤, 남은 개수와 실제 노드 수 고려)
                int maxPossible = Math.min(Math.min(MAX_NODES_PER_WORKSPACE, remainingNodes), allNodes.size());
                int nodesToSelect = maxPossible > MIN_NODES_PER_WORKSPACE
                        ? random.nextInt(maxPossible - MIN_NODES_PER_WORKSPACE + 1) + MIN_NODES_PER_WORKSPACE
                        : maxPossible;

                // 랜덤으로 노드 선택
                List<MindmapNodeDto> shuffled = new ArrayList<>(allNodes);
                Collections.shuffle(shuffled);
                List<MindmapNodeDto> selectedNodes = shuffled.stream()
                        .limit(nodesToSelect)
                        .toList();

                result.put(workspaceId, selectedNodes);
                remainingNodes -= selectedNodes.size();

                log.debug("Workspace {}: selected {} nodes out of {}", workspaceId, selectedNodes.size(), allNodes.size());
            }

        } catch (Exception e) {
            log.error("Failed to fetch nodes in batch: {}", e.getMessage());
            // 실패 시 빈 맵 반환
            workspaces.forEach(w -> result.put(w.getId(), List.of()));
        }

        return result;
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
}