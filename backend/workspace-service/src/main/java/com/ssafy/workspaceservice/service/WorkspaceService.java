package com.ssafy.workspaceservice.service;

import com.ssafy.workspaceservice.dto.request.*;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.entity.WorkspaceMember;
import com.ssafy.workspaceservice.enums.*;
import com.ssafy.workspaceservice.exception.ErrorCode;
import com.ssafy.workspaceservice.exception.ForbiddenException;
import com.ssafy.workspaceservice.exception.ResourceNotFoundException;
import com.ssafy.workspaceservice.repository.WorkspaceMemberRepository;
import com.ssafy.workspaceservice.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    // 멤버 존재/소속 검증 -> 역할 변경
    public void changeMemberRole(Long workspaceId, Long memberId, String newRole) {
        WorkspaceMember m = workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));
        if (!m.getWorkspace().getId().equals(workspaceId)) {
            throw new IllegalArgumentException("Member does not belong to workspace");
        }
        m.changeRole(WorkspaceRole.valueOf(newRole.toUpperCase()));
    }

    // 존재만 확인함.
    public void inviteMember(Long workspaceId, String email) {
        // 스텁: 존재 확인만. 실제로는 초대 토큰 생성/저장/메일 발송 등을 구현.
        workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found: " + workspaceId));
        // no-op
    }

    // 워크스페이스 존재 확인하고 그 뒤에 공개 여부를 변경
    public void changeVisibility(Long workspaceId, VisibilityChangeRequest req) {
        Workspace w = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found: " + workspaceId));
        w.changeVisibility(WorkspaceVisibility.valueOf(req.visibility().toUpperCase()));
    }

    // 최신순 목록. WorkspaceSimpleResponse 리스트
    @Transactional(readOnly = true)
    public List<WorkspaceSimpleResponse> listLatest() {
        return workspaceRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(WorkspaceSimpleResponse::from).toList();
    }

    // 간단한 통계인 Map(0 값)으로 응답. 추후 실제 집계 로직에 삽입
    @Transactional(readOnly = true)
    public WorkspaceCalendarSummaryResponse calendar(LocalDate from, LocalDate to) {
        // 스텁: 실제 통계 집계 로직으로 대체 가능
        Map<String, Integer> stats = Map.of(
                "records", 0,
                "maps", 0,
                "members", 0
        );
        return new WorkspaceCalendarSummaryResponse(from, to, stats);
    }

    // 워크스페이스 삭제
    @Transactional
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
