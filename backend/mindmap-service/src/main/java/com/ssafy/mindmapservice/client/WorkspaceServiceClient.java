package com.ssafy.mindmapservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
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

    private WebClient getClient() {
        return webClientBuilder.baseUrl(workspaceServiceUrl).build();
    }

    /**
     * 워크스페이스 가시성 조회 (PUBLIC/PRIVATE)
     */
    public String getVisibility(Long workspaceId) {
        String url = "/workspace/" + workspaceId + "/visibility";

        try {
            Map<String, Object> result = getClient()
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // 동기 방식 유지

            if (result == null) return "PRIVATE";

            String visibility = (String) result.get("visibility");

            log.debug("Workspace {} visibility: {}", workspaceId, visibility);
            return visibility != null ? visibility : "PRIVATE";

        } catch (Exception e) {
            log.error("Failed to check workspace visibility: workspaceId={}", workspaceId, e);
            return "PRIVATE";
        }
    }

    /**
     * 🆕 모든 Public 워크스페이스 ID 목록 조회
     */
    public List<Long> getPublicWorkspaceIds() {
        String url = "/workspace/workspace-ids";

        try {
            Map<String, List<Integer>> result = getClient()
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, List<Integer>>>() {})
                    .block();

            if (result == null) return List.of();

            List<Integer> ids = result.get("workspaceIds");

            List<Long> longIds = ids.stream()
                    .map(Integer::longValue)
                    .toList();

            log.debug("Retrieved {} public workspace IDs", longIds.size());

            return longIds;

        } catch (Exception e) {
            log.error("Failed to fetch public workspace IDs", e);
            return List.of();
        }
    }
}
