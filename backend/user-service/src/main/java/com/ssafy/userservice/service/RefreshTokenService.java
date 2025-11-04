package com.ssafy.userservice.service;

import com.ssafy.userservice.entity.RefreshToken;
import com.ssafy.userservice.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Refresh Token의 저장, 조회, 삭제를 담당하는 서비스
 * Redis를 사용한 토큰 관리 로직을 캡슐화합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Refresh Token을 Redis에 저장합니다.
     * 기존 토큰이 있으면 삭제 후 새로 저장합니다.
     *
     * @param userId 사용자 ID
     * @param platform 플랫폼 (web/app)
     * @param token Refresh Token 값
     * @param ttlSeconds TTL (초 단위)
     */
    @Transactional
    public void saveRefreshToken(Long userId, String platform, String token, Long ttlSeconds) {
        String refreshTokenId = userId + "_" + platform;

        // 기존 토큰 삭제
        refreshTokenRepository.deleteById(refreshTokenId);

        // 새 토큰 저장
        RefreshToken refreshTokenEntity = new RefreshToken(
                refreshTokenId,
                token,
                ttlSeconds
        );
        refreshTokenRepository.save(refreshTokenEntity);

        log.info("Saved refresh token for userId: {}, platform: {}, TTL: {} seconds",
                userId, platform, ttlSeconds);
    }

    /**
     * Refresh Token을 조회합니다.
     *
     * @param userId 사용자 ID
     * @param platform 플랫폼 (web/app)
     * @return RefreshToken (없으면 Optional.empty())
     */
    public Optional<RefreshToken> findRefreshToken(Long userId, String platform) {
        String refreshTokenId = userId + "_" + platform;
        return refreshTokenRepository.findById(refreshTokenId);
    }

    /**
     * Refresh Token을 삭제합니다.
     *
     * @param userId 사용자 ID
     * @param platform 플랫폼 (web/app)
     */
    @Transactional
    public void deleteRefreshToken(Long userId, String platform) {
        String refreshTokenId = userId + "_" + platform;
        refreshTokenRepository.deleteById(refreshTokenId);
        log.info("Deleted refresh token for userId: {}, platform: {}", userId, platform);
    }
}
