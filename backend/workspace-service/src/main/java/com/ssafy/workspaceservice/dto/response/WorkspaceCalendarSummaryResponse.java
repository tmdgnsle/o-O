package com.ssafy.workspaceservice.dto.response;

import java.time.LocalDate;
import java.util.Map;

public record WorkspaceCalendarSummaryResponse(
        LocalDate from,
        LocalDate to,
        Map<String, Integer> stats // 예: {"records":0, "maps":0, "members":0}
) {}
// 월/기간 집계 응답 모델