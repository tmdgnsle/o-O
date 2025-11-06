package com.ssafy.mindmapservice.dto;

public record WorkspaceCloneRequest(
        String workspaceName,
        String workspaceDescription
) {}
