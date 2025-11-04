package com.ssafy.workspaceservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record WorkspaceCreateRequest(
        @NotBlank String mode,        // TEAM, PERSONAL ...
        @NotBlank String visibility,  // PUBLIC, PRIVATE ...
        @NotBlank String subject,
        String thumbnail
) { }
// 워크스페이스 생성 바디
