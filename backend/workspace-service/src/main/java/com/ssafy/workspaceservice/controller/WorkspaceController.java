package com.ssafy.workspaceservice.controller;

import com.ssafy.workspaceservice.dto.request.*;
import com.ssafy.workspaceservice.dto.response.*;
import com.ssafy.workspaceservice.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Workspace API", description = "워크스페이스 관리 및 멤버 협업 API")
@RestController
@RequestMapping("/workspace")
@RequiredArgsConstructor
@Validated
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @Operation(
            summary = "워크스페이스 생성",
            description = "새로운 워크스페이스를 생성합니다. 생성자는 자동으로 MAINTAINER 권한을 부여받습니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "생성 성공"),
            @ApiResponse(responseCode = "400", content = @Content,  description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", content = @Content, description = "인증 실패")
    })
    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @Parameter(hidden = true)
            @RequestHeader("X-USER-ID") Long userId) {
        return ResponseEntity.ok(workspaceService.create(userId));
    }

    @Operation(
            summary = "워크스페이스 상세 조회",
            description = "워크스페이스 상세 정보 및 멤버 목록을 조회합니다. 공개 워크스페이스는 누구나 조회 가능하며, 비공개는 멤버만 접근 가능합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDetailResponse> detail(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(hidden = true)
            @RequestHeader(value = "X-USER-ID", required = false) Long requesterUserId
    ) {
        return ResponseEntity.ok(workspaceService.getDetail(workspaceId, requesterUserId));
    }

    @Operation(
            summary = "멤버 직접 추가",
            description = "워크스페이스에 사용자를 직접 추가합니다. MAINTAINER 또는 EDIT 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "멤버 추가 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (중복 등)"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PostMapping("/{workspaceId}/member/add")
    public ResponseEntity<Void> addMember(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "추가할 멤버 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = MemberAddRequest.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "userId": 42,
                                              "role": "EDITOR"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody @Valid MemberAddRequest request
    ) {
        workspaceService.addMember(workspaceId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "멤버 권한 변경",
            description = "멤버의 역할(MAINTAINER, EDIT, VIEW)을 변경합니다. MAINTAINER 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "권한 변경 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "멤버를 찾을 수 없음")
    })
    @PatchMapping("/{workspaceId}/member/{memberId}")
    public ResponseEntity<Void> changeMemberRole(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(description = "멤버 ID", required = true, example = "5")
            @PathVariable Long memberId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "변경할 권한 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = MemberRoleChangeRequest.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "role": "VIEWER"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody @Valid MemberRoleChangeRequest request
    ) {
        workspaceService.changeMemberRole(workspaceId, memberId, request.role());
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "멤버 초대 (이메일)",
            description = "이메일을 통해 워크스페이스에 멤버를 초대합니다. 초대 메일은 비동기로 발송됩니다. MAINTAINER 또는 EDIT 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "초대 요청 접수"),
            @ApiResponse(responseCode = "400", description = "잘못된 이메일 형식"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PostMapping("/{workspaceId}/member")
    public ResponseEntity<Void> inviteMember(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "초대할 사용자의 이메일 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = MemberInviteRequest.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "email": "user@example.com"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody @Valid MemberInviteRequest request
    ) {
        workspaceService.inviteMember(workspaceId, request.email());
        return ResponseEntity.accepted().build(); // 202
    }

    @Operation(
            summary = "워크스페이스 공개 설정 변경",
            description = "워크스페이스의 공개/비공개 상태를 변경합니다. 공개 시 누구나 조회 가능하며, 비공개 시 멤버만 접근 가능합니다. MAINTAINER 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PatchMapping("/{workspaceId}/visibility")
    public ResponseEntity<Void> changeVisibility(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "변경할 공개 설정 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = VisibilityChangeRequest.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "isPublic": true
                                            }
                                            """
                            )
                    )
            )
            @RequestBody @Valid VisibilityChangeRequest request
    ) {
        workspaceService.changeVisibility(workspaceId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "워크스페이스 목록 조회 (최신순)",
            description = "접근 가능한 워크스페이스 목록을 최신순으로 조회합니다. 공개 워크스페이스와 사용자가 멤버로 참여 중인 워크스페이스를 포함합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping
    public ResponseEntity<List<WorkspaceSimpleResponse>> listLatest() {
        return ResponseEntity.ok(workspaceService.listLatest());
    }

    @Operation(
            summary = "워크스페이스 활동 캘린더 조회",
            description = "지정된 기간 동안의 워크스페이스 활동 내역을 조회합니다. 날짜 형식은 yyyy-MM-dd입니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 날짜 형식 또는 범위")
    })
    @GetMapping("/calendar")
    public ResponseEntity<WorkspaceCalendarSummaryResponse> calendar(
            @Parameter(description = "조회 시작일 (yyyy-MM-dd)", required = true, example = "2025-01-01")
            @RequestParam LocalDate from,

            @Parameter(description = "조회 종료일 (yyyy-MM-dd)", required = true, example = "2025-01-31")
            @RequestParam LocalDate to
    ) {
        return ResponseEntity.ok(workspaceService.calendar(from, to));
    }

    @Operation(
            summary = "워크스페이스 삭제",
            description = "워크스페이스와 관련된 모든 데이터를 영구 삭제합니다. 복구가 불가능하며, MAINTAINER 권한이 필요합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "삭제할 워크스페이스 ID", required = true)
            @PathVariable Long workspaceId,

            @Parameter(hidden = true)
            @RequestHeader(value = "X-USER-ID", required = false) Long userId
    ) {
        workspaceService.delete(workspaceId, userId);
        return ResponseEntity.noContent().build();
    }
}
