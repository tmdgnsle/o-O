package com.ssafy.trendservice.service;

import com.ssafy.trendservice.dto.response.TrendItem;
import com.ssafy.trendservice.dto.response.TrendResponse;
import com.ssafy.trendservice.repository.TrendDbRepository;
import com.ssafy.trendservice.repository.TrendRedisRepository;
import com.ssafy.trendservice.util.RedisKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 트렌드 조회 서비스
 * - ZSET 캐시 우선 조회
 * - 캐시 미스 시 DB 조회 후 캐시 구성
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrendQueryService {

    private final TrendRedisRepository redisRepository;
    private final TrendDbRepository dbRepository;

    @Value("${trend.query.default-limit}")
    private int defaultLimit;

    @Value("${trend.query.max-limit}")
    private int maxLimit;

    @Value("${trend.redis.ttl.zset-cache}")
    private long zsetCacheTtl;

    // ================== 글로벌 트렌드 조회 ==================

    /**
     * 글로벌 TOP 트렌드 조회
     */
    public TrendResponse getGlobalTop(String period, Integer limit) {
        int actualLimit = validateLimit(limit);
        String key = RedisKeyUtil.zsetGlobalKey(period);

        // 1. 캐시 조회
        if (redisRepository.zsetExists(key)) {
            List<TrendItem> items = queryFromZset(key, actualLimit);
            return buildResponse(period, null, items);
        }

        // 2. 캐시 미스: DB 조회 후 캐시 구성
        Map<String, Double> dbResults = "7d".equals(period)
                ? dbRepository.getGlobalTrend7d(actualLimit)
                : dbRepository.getGlobalTrend30d(actualLimit);

        redisRepository.zsetRebuild(key, dbResults, zsetCacheTtl);

        List<TrendItem> items = convertMapToItems(dbResults);
        return buildResponse(period, null, items);
    }

    // ================== 부모별 트렌드 조회 ==================

    /**
     * 특정 부모의 자식 트렌드 조회
     */
    public TrendResponse getParentTrend(String parentKw, String period, Integer limit) {
        int actualLimit = validateLimit(limit);
        String key = RedisKeyUtil.zsetParentKey(parentKw, period);

        // 1. 캐시 조회
        if (redisRepository.zsetExists(key)) {
            List<TrendItem> items = queryFromZset(key, actualLimit);
            return buildResponse(period, parentKw, items);
        }

        // 2. 캐시 미스: DB 조회 후 캐시 구성
        Map<String, Double> dbResults = "7d".equals(period)
                ? dbRepository.getParentTrend7d(parentKw, actualLimit)
                : dbRepository.getParentTrend30d(parentKw, actualLimit);

        redisRepository.zsetRebuild(key, dbResults, zsetCacheTtl);

        List<TrendItem> items = convertMapToItems(dbResults);
        return buildResponse(period, parentKw, items);
    }

    // ================== 키워드 검색 ==================

    /**
     * 키워드 검색 (LIKE 검색)
     * 검색은 캐시 없이 직접 DB 조회
     */
    public TrendResponse searchTrend(String keyword, String period, Integer limit) {
        int actualLimit = validateLimit(limit);

        Map<String, Double> dbResults =
                dbRepository.searchTrend(keyword, period, actualLimit);

        List<TrendItem> items = convertMapToItems(dbResults);
        return buildResponse(period, null, items);
    }

    // ================== Helpers ==================

    /**
     * ZSET에서 TOP N 조회 후 TrendItem 변환
     */
    private List<TrendItem> queryFromZset(String key, int limit) {
        Set<ZSetOperations.TypedTuple<String>> results =
                redisRepository.zsetRangeWithScores(key, limit);

        List<TrendItem> items = new ArrayList<>();
        AtomicInteger rank = new AtomicInteger(1);

        for (ZSetOperations.TypedTuple<String> tuple : results) {
            items.add(TrendItem.builder()
                    .keyword(tuple.getValue())
                    .score(tuple.getScore() != null ? tuple.getScore().longValue() : 0L)
                    .rank(rank.getAndIncrement())
                    .build());
        }

        return items;
    }

    /**
     * Map을 TrendItem 리스트로 변환
     */
    private List<TrendItem> convertMapToItems(Map<String, Double> map) {
        List<TrendItem> items = new ArrayList<>();
        AtomicInteger rank = new AtomicInteger(1);

        // Map은 이미 정렬되어 있다고 가정 (DB 쿼리 ORDER BY)
        for (Map.Entry<String, Double> entry : map.entrySet()) {
            items.add(TrendItem.builder()
                    .keyword(entry.getKey())
                    .score(entry.getValue().longValue())
                    .rank(rank.getAndIncrement())
                    .build());
        }

        return items;
    }

    /**
     * TrendResponse 빌드
     */
    private TrendResponse buildResponse(String period, String parentKw, List<TrendItem> items) {
        return TrendResponse.builder()
                .period(period)
                .parentKeyword(parentKw)
                .totalCount(items.size())
                .items(items)
                .build();
    }

    /**
     * limit 값 검증
     */
    private int validateLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return defaultLimit;
        }
        return Math.min(limit, maxLimit);
    }
}