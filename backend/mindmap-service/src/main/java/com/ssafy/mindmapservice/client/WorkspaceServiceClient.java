package com.ssafy.mindmapservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkspaceServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${workspace.service.url:http://localhost:8082}")
    private String workspaceServiceUrl;

    public Long createWorkspace(String name, String description) {
        log.info("Creating workspace via REST API: name={}", name);

        try {
            Map<String, Object> request = Map.of(
                    "name", name,
                    "description", description != null ? description : ""
            );

            Map<String, Object> response = webClientBuilder.build()
                    .post()
                    .uri(workspaceServiceUrl + "/workspace")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("workspaceId")) {
                Object workspaceIdObj = response.get("workspaceId");
                Long workspaceId = workspaceIdObj instanceof Integer
                        ? ((Integer) workspaceIdObj).longValue()
                        : (Long) workspaceIdObj;

                log.info("Workspace created successfully: workspaceId={}", workspaceId);
                return workspaceId;
            }

            throw new RuntimeException("Failed to create workspace: Invalid response");

        } catch (Exception e) {
            log.error("Failed to create workspace via REST API", e);
            throw new RuntimeException("Failed to create workspace: " + e.getMessage(), e);
        }
    }
}
