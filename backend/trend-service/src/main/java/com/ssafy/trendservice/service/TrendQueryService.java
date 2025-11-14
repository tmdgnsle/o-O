package com.ssafy.trendservice.service;

import com.ssafy.trendservice.client.MindmapPublicSearchClient;
import com.ssafy.trendservice.dto.response.KeywordNodeSearchResponse;
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

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

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
    private final MindmapPublicSearchClient mindmapClient;

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
     * 부모 키워드의 자식 트렌드 조회
     * - 1) Mindmap Public /children 으로 "실제 존재하는 자식 키워드 목록" 가져오고
     * - 2) Trend DB의 점수를 child 기준으로 붙여서
     * - 3) 점수 없으면 0점으로 채우고, 내림차순 정렬해서 반환
     */
    public TrendResponse getParentTrend(String parentKeyword, String period, Integer limit) {
        int actualLimit = validateLimit(limit);

        String normalizedParent = sanitizeKeyword(parentKeyword);

        // 1. Mindmap 쪽에서 public 자식들 가져오기
        KeywordNodeSearchResponse childrenResp =
                mindmapClient.searchChildrenByParent(parentKeyword, 500);

        if (childrenResp == null ||
                childrenResp.getNodes() == null ||
                childrenResp.getNodes().isEmpty()) {

            log.info("No public children found for parentKeyword='{}'", parentKeyword);
            return buildResponse(period, normalizedParent, List.of());
        }

        // 2. 자식 키워드만 뽑아서 중복 제거
        List<String> publicChildKeywords = childrenResp.getNodes().stream()
                .map(node -> node.getKeyword())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();

        if (publicChildKeywords.isEmpty()) {
            log.info("Public children exist but all childKeyword blank for parent='{}'", parentKeyword);
            return buildResponse(period, normalizedParent, List.of());
        }

        // 3. DB에서 부모 기준 점수 맵 가져오기 (key = child_kw, value = Double)
        Map<String, Double> dbScores =
                "7d".equals(period)
                        ? dbRepository.getParentTrend7d(normalizedParent, 1000)
                        : dbRepository.getParentTrend30d(normalizedParent, 1000);

        // 4. public 자식 기준으로 점수 붙이기 (없으면 0점)
        AtomicInteger rankCounter = new AtomicInteger(1);

        List<TrendItem> merged = publicChildKeywords.stream()
                .map(child -> {
                    String normalizedChild = sanitizeKeyword(child);
                    double scoreDouble = dbScores.getOrDefault(normalizedChild, 0.0);
                    long score = (long) scoreDouble;  // 필요하면 Math.round(scoreDouble) 써도 됨

                    return TrendItem.builder()
                            .keyword(child)   // 원본 문자열
                            .score(score)     // Long 타입
                            .build();
                })
                // 점수 내림차순 정렬
                .sorted(Comparator.comparingLong(TrendItem::getScore).reversed())
                .limit(actualLimit)
                // rank 채워넣기
                .map(item -> {
                    item.setRank(rankCounter.getAndIncrement());
                    return item;
                })
                .toList();

        return buildResponse(period, normalizedParent, merged);
    }


    // ================== 키워드 검색 ==================

    /**
     * 키워드 검색 (LIKE 검색)
     * 검색은 캐시 없이 직접 DB 조회
     */
    public TrendResponse searchTrend(String keyword, String period, Integer limit) {
        int actualLimit = validateLimit(limit);

        // 1) Trend DB LIKE 검색
        Map<String, Double> dbResults =
                dbRepository.searchTrend(keyword, period, actualLimit);

        // 2) Mindmap Public 키워드 LIKE 검색
        List<String> publicKeywords =
                mindmapClient.searchPublicKeywords(keyword, actualLimit);

        // 3) 결과 병합 (Trend DB 점수 우선, 없으면 0점)
        Map<String, Double> merged = new LinkedHashMap<>();

        // DB 결과 먼저 넣고
        merged.putAll(dbResults);

        // Mindmap 키워드는 없으면 0점으로 추가
        for (String k : publicKeywords) {
            merged.putIfAbsent(k, 0.0);
        }

        // 4) VIEW 포인트 증가
        //  - 네가 말한대로:
        //    - LIKE 결과 있으면: 그 결과들만 +1
        //    - LIKE 결과 없으면: 아무 것도 증가 X
        if (!merged.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            long ttl = 86400L * 7;

            for (String k : merged.keySet()) {
                redisRepository.incrementViewCount(
                        "__view__",
                        k,
                        now,
                        ttl
                );
            }
        }

        // 5) limit 다시 한 번 잘라주기 (혹시 병합으로 초과했을 수 있으니까)
        Map<String, Double> limited = merged.entrySet().stream()
                .limit(actualLimit)
                .collect(LinkedHashMap::new,
                        (m, e) -> m.put(e.getKey(), e.getValue()),
                        Map::putAll);

        List<TrendItem> items = convertMapToItems(limited);
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

    private String sanitizeKeyword(String keyword) {
        if (keyword == null) return "";
        return keyword.trim().toLowerCase();
    }
}