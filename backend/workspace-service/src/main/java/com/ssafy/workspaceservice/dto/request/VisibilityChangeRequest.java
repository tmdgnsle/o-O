package com.ssafy.workspaceservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record VisibilityChangeRequest(
        @NotBlank String visibility
) { }
// public/private 등 공개 여부 전환