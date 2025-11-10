package com.ssafy.workspaceservice.service;

import com.ssafy.workspaceservice.dto.request.*;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.entity.WorkspaceMember;
import com.ssafy.workspaceservice.enums.WorkspaceRole;
import com.ssafy.workspaceservice.enums.WorkspaceTheme;
import com.ssafy.workspaceservice.enums.WorkspaceType;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;
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

    // 문자열 normalize(대문자) -> Workspace 저장
    // Owner 멤버 자동 등록
    // WorkspaceResponse 반환
    public WorkspaceResponse create(Long userId) {
        Workspace workspace = Workspace.builder()
                .theme(WorkspaceTheme.PASTEL)
                .type(WorkspaceType.PERSONAL)
                .visibility(WorkspaceVisibility.PRIVATE)
                .subject("")
                .thumbnail("")
                .build();
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(saved)
                .userId(userId)
                .role(WorkspaceRole.MAINTAINER)
                .pointerColor(null)
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
        String myRole = mine.map(WorkspaceMember::getRole).orElse(null);
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
                .role(req.role().toUpperCase())
                .pointerColor(req.pointerColor())
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
        m.changeRole(newRole.toUpperCase());
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
        w.changeVisibility(req.visibility().toUpperCase());
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

    // 워크스페이스 삭제(사전에 cascade/제약 고려)
    public void delete(Long workspaceId) {
        workspaceRepository.deleteById(workspaceId);
    }
}
