package com.ssafy.trendservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 트렌드 검색 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendSearchRequest {

    private String keyword;
    private String period;  // "7d" or "30d"
    private Integer limit;
}