package com.ssafy.trendservice.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class KeywordListResponse {
    private List<String> keywords;
    private Integer totalCount;
}