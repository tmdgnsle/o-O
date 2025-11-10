// DTO 바인딩하고 검증함. 서비스를 호출하고, HTTP 응답을 생성.

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
            description = """
                    ## 새로운 워크스페이스 생성

                    사용자가 새 워크스페이스를 생성합니다.

                    ### 📌 처리 흐름
                    1. **소유자 인증**: X-USER-ID 헤더를 통해 생성자 식별
                    2. **워크스페이스 생성**: 제목, 설명, 공개 여부 설정
                    3. **멤버 추가**: 생성자를 OWNER 권한으로 자동 추가

                    ### ⚠️ 주의사항
                    - X-USER-ID 헤더는 API Gateway에서 자동으로 주입됩니다
                    - isPublic이 true면 누구나 조회 가능, false면 멤버만 접근 가능
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워크스페이스 생성 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = WorkspaceResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 필드 누락 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 (X-USER-ID 헤더 누락)",
                    content = @Content
            )
    })
    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @Parameter(description = "생성자 사용자 ID (API Gateway에서 주입)", required = true, example = "1")
            @RequestHeader("X-USER-ID") Long userId) {
        return ResponseEntity.ok(workspaceService.create(userId));
    }

    @Operation(
            summary = "워크스페이스 상세 조회",
            description = """
                    ## 워크스페이스 상세 정보 및 멤버 역할 조회

                    워크스페이스의 상세 정보와 요청자의 멤버 권한을 함께 조회합니다.

                    ### 📌 반환 정보
                    - 워크스페이스 기본 정보 (이름, 설명, 공개 여부)
                    - 멤버 목록 및 각 멤버의 역할
                    - 요청자의 역할 (OWNER, EDITOR, VIEWER 또는 null)

                    ### 🔐 권한 확인
                    - 공개 워크스페이스: 누구나 조회 가능
                    - 비공개 워크스페이스: 멤버만 조회 가능

                    ### ⚠️ 주의사항
                    - X-USER-ID 헤더가 없으면 비회원 조회로 처리됩니다
                    - 비회원은 공개 워크스페이스만 조회 가능합니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워크스페이스 조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = WorkspaceDetailResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "접근 권한 없음 (비공개 워크스페이스)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "워크스페이스를 찾을 수 없음",
                    content = @Content
            )
    })
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDetailResponse> detail(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(description = "요청자 사용자 ID (API Gateway에서 주입, 비회원은 null)", required = false, example = "1")
            @RequestHeader(value = "X-USER-ID", required = false) Long requesterUserId
    ) {
        return ResponseEntity.ok(workspaceService.getDetail(workspaceId, requesterUserId));
    }

    @Operation(
            summary = "멤버 직접 추가",
            description = """
                    ## 워크스페이스에 멤버 직접 추가

                    관리자가 특정 사용자를 워크스페이스 멤버로 직접 추가합니다.

                    ### 📌 처리 흐름
                    1. **권한 확인**: 요청자가 OWNER 또는 EDITOR 권한 보유 여부 확인
                    2. **멤버 추가**: userId와 role을 지정하여 멤버 추가

                    ### 🔐 필요 권한
                    - OWNER 또는 EDITOR 권한 필요

                    ### ⚠️ 주의사항
                    - 이미 멤버인 경우 중복 추가 불가
                    - role은 OWNER, EDITOR, VIEWER 중 하나
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "멤버 추가 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (이미 멤버인 경우 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음 (OWNER/EDITOR 권한 필요)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "워크스페이스 또는 사용자를 찾을 수 없음",
                    content = @Content
            )
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
            description = """
                    ## 워크스페이스 멤버의 권한 변경

                    기존 멤버의 역할(role)을 변경합니다.

                    ### 📌 처리 흐름
                    1. **권한 확인**: 요청자가 OWNER 권한 보유 여부 확인
                    2. **역할 변경**: 대상 멤버의 role 업데이트

                    ### 🔐 필요 권한
                    - OWNER 권한 필요

                    ### ⚠️ 주의사항
                    - OWNER만 다른 멤버의 권한을 변경할 수 있습니다
                    - role은 OWNER, EDITOR, VIEWER 중 하나
                    - 자기 자신의 권한도 변경 가능 (신중하게!)
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "권한 변경 성공"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음 (OWNER 권한 필요)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "워크스페이스 또는 멤버를 찾을 수 없음",
                    content = @Content
            )
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
            description = """
                    ## 이메일로 워크스페이스 멤버 초대

                    이메일 주소를 통해 사용자를 워크스페이스에 초대합니다.

                    ### 📌 처리 흐름
                    1. **권한 확인**: 요청자가 OWNER 또는 EDITOR 권한 보유 여부 확인
                    2. **초대 메일 발송**: 해당 이메일로 초대 링크 전송 (비동기)
                    3. **즉시 응답**: 202 Accepted 반환

                    ### 🔐 필요 권한
                    - OWNER 또는 EDITOR 권한 필요

                    ### ⚠️ 주의사항
                    - 이메일 발송은 비동기로 처리됩니다
                    - 이미 멤버인 사용자에게도 초대 메일 발송 가능 (재초대)
                    - 초대받은 사용자는 링크를 통해 워크스페이스에 참여할 수 있습니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "초대 메일 발송 요청 접수됨 (비동기 처리)"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 이메일 형식",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음 (OWNER/EDITOR 권한 필요)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "워크스페이스를 찾을 수 없음",
                    content = @Content
            )
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
            description = """
                    ## 워크스페이스의 공개/비공개 설정 변경

                    워크스페이스의 isPublic 값을 변경하여 접근 권한을 조정합니다.

                    ### 📌 처리 흐름
                    1. **권한 확인**: 요청자가 OWNER 권한 보유 여부 확인
                    2. **공개 설정 변경**: isPublic 값 업데이트

                    ### 🔐 필요 권한
                    - OWNER 권한 필요

                    ### 🔍 공개 설정의 의미
                    - **isPublic = true**: 누구나 워크스페이스 조회 가능 (단, 편집은 멤버만)
                    - **isPublic = false**: 멤버만 조회 및 작업 가능

                    ### ⚠️ 주의사항
                    - OWNER만 공개 설정을 변경할 수 있습니다
                    - 공개 설정 변경 시 기존 멤버의 권한은 유지됩니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공개 설정 변경 성공"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음 (OWNER 권한 필요)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "워크스페이스를 찾을 수 없음",
                    content = @Content
            )
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
            description = """
                    ## 워크스페이스 목록을 최신순으로 조회

                    사용자가 접근 가능한 워크스페이스 목록을 최신순으로 반환합니다.

                    ### 📌 조회 대상
                    - 공개 워크스페이스 (isPublic = true)
                    - 사용자가 멤버로 참여 중인 비공개 워크스페이스

                    ### 🔍 반환 정보
                    - 워크스페이스 기본 정보 (ID, 이름, 설명)
                    - 생성일시 기준 최신순 정렬
                    - 간략한 정보만 포함 (WorkspaceSimpleResponse)

                    ### ⚠️ 주의사항
                    - 인증되지 않은 사용자는 공개 워크스페이스만 조회 가능
                    - 멤버 정보는 포함되지 않음 (상세 조회 API 사용)
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워크스페이스 목록 조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = WorkspaceSimpleResponse.class)
                    )
            )
    })
    @GetMapping
    public ResponseEntity<List<WorkspaceSimpleResponse>> listLatest() {
        return ResponseEntity.ok(workspaceService.listLatest());
    }

    @Operation(
            summary = "워크스페이스 활동 캘린더 조회",
            description = """
                    ## 특정 기간 동안의 워크스페이스 활동 요약 조회

                    지정된 날짜 범위 내에서 워크스페이스의 활동 내역을 요약하여 반환합니다.

                    ### 📌 활용 사례
                    - 월별 활동 현황 확인
                    - 특정 기간 동안의 작업 통계
                    - 캘린더 UI에 활동 표시

                    ### 🔍 반환 정보
                    - 날짜별 워크스페이스 생성/수정 이력
                    - 기간 내 활동 요약 통계

                    ### ⚠️ 주의사항
                    - from과 to 파라미터는 필수입니다
                    - 날짜 형식: yyyy-MM-dd (예: 2025-01-01)
                    - from은 to보다 이전 날짜여야 합니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "캘린더 조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = WorkspaceCalendarSummaryResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 날짜 형식 또는 범위",
                    content = @Content
            )
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
            description = """
                    ## 워크스페이스 영구 삭제

                    워크스페이스와 관련된 모든 데이터를 삭제합니다.

                    ### 📌 처리 흐름
                    1. **권한 확인**: 요청자가 OWNER 권한 보유 여부 확인
                    2. **연관 데이터 삭제**: 워크스페이스에 속한 모든 노드 삭제
                    3. **워크스페이스 삭제**: 워크스페이스 및 멤버 정보 삭제

                    ### 🔐 필요 권한
                    - OWNER 권한 필요

                    ### ⚠️ 주의사항
                    - **복구 불가능**: 삭제된 데이터는 복구할 수 없습니다
                    - 모든 멤버가 접근 불가능해집니다
                    - 연관된 마인드맵 노드도 모두 삭제됩니다
                    - 삭제 전 사용자 확인 필수!
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "워크스페이스 삭제 성공"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "권한 없음 (OWNER 권한 필요)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "워크스페이스를 찾을 수 없음",
                    content = @Content
            )
    })
    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "삭제할 워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId
    ) {
        workspaceService.delete(workspaceId);
        return ResponseEntity.noContent().build();
    }
}
