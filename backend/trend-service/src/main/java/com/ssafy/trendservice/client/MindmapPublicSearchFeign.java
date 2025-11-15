// MindmapPublicSearchFeign.java
package com.ssafy.trendservice.client;

import com.ssafy.trendservice.dto.response.KeywordListResponse;
import com.ssafy.trendservice.dto.response.KeywordNodeSearchResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "mindmapPublicSearchFeign",
        url = "${mindmap.service.url}"
)
public interface MindmapPublicSearchFeign {

    @GetMapping("/api/public/search/keywords")
    KeywordListResponse getPublicKeywords(
            @RequestParam("keyword") String keyword,
            @RequestParam("limit") int limit
    );

    @GetMapping("/api/public/search/children")
    KeywordNodeSearchResponse getChildrenByParent(
            @RequestParam("parentKeyword") String parentKeyword,
            @RequestParam("limit") int limit
    );
}
