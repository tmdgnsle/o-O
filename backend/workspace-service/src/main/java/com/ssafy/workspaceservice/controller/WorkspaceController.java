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
    // 쿼리 ownerUserId, 바디 WorkspaceCreateRequest
    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @RequestParam("ownerUserId") Long ownerUserId, // 추후 JWT로 대체 예정? HTTP 쿼리 파라미터. URL의 ? 뒤에 붙는 key-value들
            // POST /workspace?ownerUserId=1
            @RequestBody @Valid WorkspaceCreateRequest request
    ) {
        return ResponseEntity.ok(workspaceService.create(ownerUserId, request));
    }

    /** 상세 + 멤버 역할 포함(입장 판단): GET /workspace/{workspaceId}?userId= */
    // 입장판단을 포함하는 상세 내용ㅇㅇㅇ
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDetailResponse> detail(
            @PathVariable Long workspaceId,
            @RequestParam(name = "userId", required = false) Long requesterUserId
    ) {
        return ResponseEntity.ok(workspaceService.getDetail(workspaceId, requesterUserId));
    }

    /** 멤버 직접 추가: POST /workspace/{workspaceId}/member/add */
    // 멤버를 직접 추가함
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
    // 역할 수정
    public ResponseEntity<Void> changeMemberRole(
            @PathVariable Long workspaceId,
            @PathVariable Long memberId,
            @RequestBody @Valid MemberRoleChangeRequest request
    ) {
        workspaceService.changeMemberRole(workspaceId, memberId, request.role());
        return ResponseEntity.ok().build();
    }

    /** 멤버 초대(링크/메일): POST /workspace/{workspaceId}/member */
    // 초대
    @PostMapping("/{workspaceId}/member")
    public ResponseEntity<Void> inviteMember(
            @PathVariable Long workspaceId,
            @RequestBody @Valid MemberInviteRequest request
    ) {
        workspaceService.inviteMember(workspaceId, request.email());
        return ResponseEntity.accepted().build(); // 202
    }

    /** 공개/비공개 전환: PATCH /workspace/{workspaceId}/visibility */
    // 공개여부를 바꾸는
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
    // 월/기간을 요약함
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
