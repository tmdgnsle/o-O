// DTO 바인딩하고 검증함. 서비스를 호출하고, HTTP 응답을 생성.

package com.ssafy.workspaceservice.controller;

import com.ssafy.workspaceservice.dto.request.*;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/workspace")
@RequiredArgsConstructor
@Validated
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    /** 새 워크스페이스 생성: POST /workspace */
    // 기존: @RequestParam("ownerUserId") → 변경: 게이트웨이에서 넘겨주는 헤더 사용
    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @RequestHeader("X-USER-ID") Long ownerUserId,
            @RequestBody @Valid WorkspaceCreateRequest request
    ) {
        return ResponseEntity.ok(workspaceService.create(ownerUserId, request));
    }

    /** 상세 + 멤버 역할 포함(입장 판단): GET /workspace/{workspaceId} */
    // 기존: @RequestParam(name = "userId", required = false) → 변경: 헤더 사용
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDetailResponse> detail(
            @PathVariable Long workspaceId,
            @RequestHeader(value = "X-USER-ID", required = false) Long requesterUserId
    ) {
        return ResponseEntity.ok(workspaceService.getDetail(workspaceId, requesterUserId));
    }

    /** 멤버 직접 추가: POST /workspace/{workspaceId}/member/add */
    @PostMapping("/{workspaceId}/member/add")
    public ResponseEntity<Void> addMember(
            @PathVariable Long workspaceId,
            @RequestBody @Valid MemberAddRequest request
    ) {
        workspaceService.addMember(workspaceId, request);
        return ResponseEntity.ok().build();
    }

    /** 멤버 권한 변경: PATCH /workspace/{workspaceId}/member/{memberId} */
    @PatchMapping("/{workspaceId}/member/{memberId}")
    public ResponseEntity<Void> changeMemberRole(
            @PathVariable Long workspaceId,
            @PathVariable Long memberId,
            @RequestBody @Valid MemberRoleChangeRequest request
    ) {
        workspaceService.changeMemberRole(workspaceId, memberId, request.role());
        return ResponseEntity.ok().build();
    }

    /** 멤버 초대(링크/메일): POST /workspace/{workspaceId}/member */
    @PostMapping("/{workspaceId}/member")
    public ResponseEntity<Void> inviteMember(
            @PathVariable Long workspaceId,
            @RequestBody @Valid MemberInviteRequest request
    ) {
        workspaceService.inviteMember(workspaceId, request.email());
        return ResponseEntity.accepted().build(); // 202
    }

    /** 공개/비공개 전환: PATCH /workspace/{workspaceId}/visibility */
    @PatchMapping("/{workspaceId}/visibility")
    public ResponseEntity<Void> changeVisibility(
            @PathVariable Long workspaceId,
            @RequestBody @Valid VisibilityChangeRequest request
    ) {
        workspaceService.changeVisibility(workspaceId, request);
        return ResponseEntity.ok().build();
    }

    /** 최신순 조회: GET /workspace */
    @GetMapping
    public ResponseEntity<List<WorkspaceSimpleResponse>> listLatest() {
        return ResponseEntity.ok(workspaceService.listLatest());
    }

    /** 월/기간 활동 요약: GET /workspace/calendar?from=yyyy-MM-dd&to=yyyy-MM-dd */
    @GetMapping("/calendar")
    public ResponseEntity<WorkspaceCalendarSummaryResponse> calendar(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return ResponseEntity.ok(workspaceService.calendar(from, to));
    }

    /** 삭제: DELETE /workspace/{workspaceId} */
    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> delete(@PathVariable Long workspaceId) {
        workspaceService.delete(workspaceId);
        return ResponseEntity.noContent().build();
    }
}
