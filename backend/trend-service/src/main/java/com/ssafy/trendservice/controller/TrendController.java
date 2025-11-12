package com.ssafy.trendservice.controller;

import com.ssafy.trendservice.dto.response.TrendResponse;
import com.ssafy.trendservice.service.TrendQueryService;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

/**
 * 트렌드 REST API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/trend")
@RequiredArgsConstructor
@Validated
public class TrendController {

    private final TrendQueryService queryService;

    /**
     * 글로벌 트렌드 조회
     * GET /api/v1/trend/top?period=7d&limit=20
     */
    @GetMapping("/top")
    @Timed(value = "trend.query.global", description = "Global trend query time")
    public ResponseEntity<TrendResponse> getGlobalTop(
            @RequestParam(defaultValue = "7d")
            @Pattern(regexp = "^(7d|30d)$", message = "Period must be either '7d' or '30d'")
            String period,

            @RequestParam(required = false)
            @Min(1) @Max(100)
            Integer limit
    ) {
        log.info("GET /trend/top - period: {}, limit: {}", period, limit);
        TrendResponse response = queryService.getGlobalTop(period, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * 부모 키워드의 자식 트렌드 조회
     * GET /api/v1/trend/{parentKeyword}?period=7d&limit=20
     */
    @GetMapping("/{parentKeyword}")
    @Timed(value = "trend.query.parent", description = "Parent trend query time")
    public ResponseEntity<TrendResponse> getParentTrend(
            @PathVariable String parentKeyword,

            @RequestParam(defaultValue = "7d")
            @Pattern(regexp = "^(7d|30d)$", message = "Period must be either '7d' or '30d'")
            String period,

            @RequestParam(required = false)
            @Min(1) @Max(100)
            Integer limit
    ) {
        log.info("GET /trend/{} - period: {}, limit: {}", parentKeyword, period, limit);
        TrendResponse response = queryService.getParentTrend(parentKeyword, period, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * 키워드 검색
     * GET /api/v1/trend/search?keyword=java&period=7d&limit=20
     */
    @GetMapping("/search")
    @Timed(value = "trend.query.search", description = "Trend search query time")
    public ResponseEntity<TrendResponse> searchTrend(
            @RequestParam String keyword,

            @RequestParam(defaultValue = "7d")
            @Pattern(regexp = "^(7d|30d)$", message = "Period must be either '7d' or '30d'")
            String period,

            @RequestParam(required = false)
            @Min(1) @Max(100)
            Integer limit
    ) {
        log.info("GET /trend/search - keyword: {}, period: {}, limit: {}",
                keyword, period, limit);
        TrendResponse response = queryService.searchTrend(keyword, period, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * Health Check
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}