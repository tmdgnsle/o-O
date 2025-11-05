package com.ssafy.userservice.service;

import com.ssafy.userservice.domain.RefreshToken;
import com.ssafy.userservice.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

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

    public Optional<RefreshToken> findRefreshToken(Long userId, String platform) {
        String refreshTokenId = userId + "_" + platform;
        return refreshTokenRepository.findById(refreshTokenId);
    }

    @Transactional
    public void deleteRefreshToken(Long userId, String platform) {
        String refreshTokenId = userId + "_" + platform;
        refreshTokenRepository.deleteById(refreshTokenId);
        log.info("Deleted refresh token for userId: {}, platform: {}", userId, platform);
    }
}
