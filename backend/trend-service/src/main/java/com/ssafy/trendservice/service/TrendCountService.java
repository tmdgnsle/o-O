package com.ssafy.trendservice.service;

import com.ssafy.trendservice.dto.event.EventType;
import com.ssafy.trendservice.dto.event.RelationEvent;
import com.ssafy.trendservice.repository.TrendRedisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 트렌드 카운트 적재 서비스
 * - Kafka 이벤트를 받아 Redis에 카운트 저장
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrendCountService {

    private final TrendRedisRepository redisRepository;

    @Value("${trend.redis.ttl.daily-hash}")
    private long dailyHashTtl;

    /**
     * 이벤트 처리 및 Redis 카운트 증가
     */
    public void processEvent(RelationEvent event) {
        try {
            String parentKw = sanitizeKeyword(event.getParentKeyword());
            String childKw = sanitizeKeyword(event.getChildKeyword());
            LocalDateTime timestamp = event.getTimestamp() != null
                    ? event.getTimestamp()
                    : LocalDateTime.now();

            if (event.getEventType() == EventType.RELATION_ADD) {
                redisRepository.incrementAddCount(parentKw, childKw, timestamp, dailyHashTtl);
                log.debug("Incremented ADD count: parent={}, child={}", parentKw, childKw);

            } else if (event.getEventType() == EventType.RELATION_VIEW) {
                redisRepository.incrementViewCount(parentKw, childKw, timestamp, dailyHashTtl);
                log.debug("Incremented VIEW count: parent={}, child={}", parentKw, childKw);
            }

        } catch (Exception e) {
            log.error("Error processing event: {}", event, e);
            throw e;
        }
    }

    /**
     * 키워드 정규화 (공백 제거, 소문자 변환 등)
     */
    private String sanitizeKeyword(String keyword) {
        if (keyword == null) {
            return "";
        }
        return keyword.trim().toLowerCase();
    }
}