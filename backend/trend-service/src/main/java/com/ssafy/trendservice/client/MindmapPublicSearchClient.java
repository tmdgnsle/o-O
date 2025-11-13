// MindmapPublicSearchClient.java
package com.ssafy.trendservice.client;

import com.ssafy.trendservice.dto.response.KeywordListResponse;
import com.ssafy.trendservice.dto.response.KeywordNodeSearchResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MindmapPublicSearchClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${mindmap.service.url}")
    private String mindmapBaseUrl;

    private WebClient client() {
        return webClientBuilder.baseUrl(mindmapBaseUrl).build();
    }

    public List<String> searchPublicKeywords(String keyword, int limit) {
        try {
            KeywordListResponse resp = client()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/public/search/keywords")
                            .queryParam("keyword", keyword)
                            .queryParam("limit", limit)
                            .build())
                    .retrieve()
                    .bodyToMono(KeywordListResponse.class)
                    .block();

            if (resp == null || resp.getKeywords() == null) {
                return Collections.emptyList();
            }
            log.debug("Mindmap public keywords size={}", resp.getKeywords().size());
            return resp.getKeywords();
        } catch (Exception e) {
            log.error("Failed to call mindmap public keywords API", e);
            return Collections.emptyList();
        }
    }

    // ========== /children ==========

    public KeywordNodeSearchResponse searchChildrenByParent(String parentKeyword, int limit) {
        try {
            KeywordNodeSearchResponse resp = client()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/public/search/children")
                            .queryParam("parentKeyword", parentKeyword)
                            .queryParam("limit", limit)
                            .build())
                    .retrieve()
                    .bodyToMono(KeywordNodeSearchResponse.class)
                    .block();

            if (resp == null || resp.getNodes() == null) {
                log.debug("Mindmap /children empty for parent={}", parentKeyword);
                return new KeywordNodeSearchResponse(); // nodes=null 이어도 상관없도록
            }
            log.debug("Mindmap /children size={} for parent={}",
                    resp.getNodes().size(), parentKeyword);
            return resp;
        } catch (Exception e) {
            log.error("Failed to call mindmap public /children API", e);
            KeywordNodeSearchResponse fallback = new KeywordNodeSearchResponse();
            fallback.setNodes(Collections.emptyList());
            fallback.setTotalCount(0);
            return fallback;
        }
    }
}
