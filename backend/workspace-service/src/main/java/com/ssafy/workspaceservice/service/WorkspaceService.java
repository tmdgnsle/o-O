package com.ssafy.workspaceservice.service;

import com.ssafy.workspaceservice.dto.request.*;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.entity.WorkspaceMember;
import com.ssafy.workspaceservice.enums.*;
import com.ssafy.workspaceservice.exception.BadRequestException;
import com.ssafy.workspaceservice.exception.ErrorCode;
import com.ssafy.workspaceservice.exception.ForbiddenException;
import com.ssafy.workspaceservice.exception.ResourceNotFoundException;
import com.ssafy.workspaceservice.repository.WorkspaceMemberRepository;
import com.ssafy.workspaceservice.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceResponse create(Long userId) {
        String INITIAL_TITLE = "제목 없음";

        Workspace workspace = Workspace.builder()
                .theme(WorkspaceTheme.PASTEL)
                .type(WorkspaceType.PERSONAL)
                .visibility(WorkspaceVisibility.PRIVATE)
                .title(INITIAL_TITLE)
                .thumbnail("")
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
        Workspace w = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found: " + workspaceId));

        Optional<WorkspaceMember> mine = Optional.empty();
        if (requesterUserId != null) {
            mine = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, requesterUserId);
        }

        boolean isMember = mine.isPresent();
        String myRole = String.valueOf(mine.map(WorkspaceMember::getRole).orElse(null));
        Long memberCount = workspaceMemberRepository.countByWorkspaceId(workspaceId);

        return WorkspaceDetailResponse.of(w, isMember, myRole, memberCount);
    }

    // 존재/중복 가입 검증. 멤버 생성/저장
    public void addMember(Long workspaceId, MemberAddRequest req) {
        Workspace w = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found: " + workspaceId));

        workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, req.userId())
                .ifPresent(m -> { throw new IllegalStateException("Already a member"); });

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(w)
                .userId(req.userId())
                .role(WorkspaceRole.valueOf(req.role().toUpperCase()))
                .pointerColor(PointerColor.valueOf(req.pointerColor()))
                .build();
        workspaceMemberRepository.save(member);
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

    // 존재만 확인함.
    //TODO: 초대했을 때 플로우가 어떻게 되는건지?
    public void inviteMember(Long workspaceId, String email) {
        // 스텁: 존재 확인만. 실제로는 초대 토큰 생성/저장/메일 발송 등을 구현.
        workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found: " + workspaceId));
        // no-op
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

    // 최신순 목록. WorkspaceSimpleResponse 리스트
    @Transactional(readOnly = true)
    public List<WorkspaceSimpleResponse> listLatest() {
        return workspaceRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(WorkspaceSimpleResponse::from).toList();
    }

    // 날짜별 사용자 워크스페이스 조회
    @Transactional(readOnly = true)
    public List<WorkspaceCalendarDailyResponse> calendar(Long userId, LocalDate from, LocalDate to) {
        // LocalDate를 LocalDateTime으로 변환 (from 00:00:00 ~ to+1 00:00:00)
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.plusDays(1).atStartOfDay();

        // 사용자의 워크스페이스 조회
        List<Workspace> workspaces = workspaceRepository.findByUserIdAndDateRange(userId, fromDateTime, toDateTime);

        // 날짜별로 그룹핑
        Map<LocalDate, List<Workspace>> groupedByDate = workspaces.stream()
                .collect(Collectors.groupingBy(w -> w.getCreatedAt().toLocalDate()));

        // DTO로 변환
        return groupedByDate.entrySet().stream()
                .map(entry -> WorkspaceCalendarDailyResponse.of(
                        entry.getKey(),
                        entry.getValue().stream()
                                .map(WorkspaceCalendarItemResponse::from)
                                .toList()
                ))
                .sorted((a, b) -> b.date().compareTo(a.date())) // 최신순 정렬
                .toList();
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
}
