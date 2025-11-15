// MindmapPublicSearchClient.java
package com.ssafy.trendservice.client;

import com.ssafy.trendservice.dto.response.KeywordListResponse;
import com.ssafy.trendservice.dto.response.KeywordNodeSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MindmapPublicSearchClient {

    private final MindmapPublicSearchFeign feignClient;

    public List<String> searchPublicKeywords(String keyword, int limit) {
        try {
            KeywordListResponse resp = feignClient.getPublicKeywords(keyword, limit);

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
            KeywordNodeSearchResponse resp = feignClient.getChildrenByParent(parentKeyword, limit);

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
