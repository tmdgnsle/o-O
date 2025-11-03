package com.ssafy.userservice.service;

import com.ssafy.userservice.entity.RefreshToken;
import com.ssafy.userservice.exception.InvalidTokenException;
import com.ssafy.userservice.exception.TokenExpiredException;
import com.ssafy.userservice.exception.TokenNotFoundException;
import com.ssafy.userservice.jwt.JwtUtil;
import com.ssafy.userservice.repository.RefreshTokenRepository;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Transactional
    public String reissueAccessToken(String refreshToken) {
        // Null 체크
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        // Refresh Token 만료 확인
        if (jwtUtil.isExpired(refreshToken)) {
            throw new TokenExpiredException("Refresh token expired");
        }

        // category 확인
        String category = jwtUtil.getCategory(refreshToken);
        if (!"refresh".equals(category)) {
            throw new InvalidTokenException("Invalid refresh token category");
        }

        // userId, role, platform 추출
        Long userId = jwtUtil.getUserId(refreshToken);
        String role = jwtUtil.getRole(refreshToken);
        String platform = jwtUtil.getPlatform(refreshToken);

        // Redis에 저장된 토큰과 비교 (userId_platform 형태로 조회)
        String refreshTokenId = userId + "_" + platform;
        RefreshToken storedToken = refreshTokenRepository.findById(refreshTokenId)
                .orElseThrow(() -> new TokenNotFoundException("Refresh token not found in storage"));

        if (!storedToken.getToken().equals(refreshToken)) {
            throw new InvalidTokenException("Refresh token mismatch");
        }

        // 새로운 Access Token 발급 (platform 정보 포함)
        String newAccessToken = jwtUtil.generateToken("access", userId, role, platform, accessTokenExpiration);
        log.info("Access token reissued for userId: {}, platform: {}", userId, platform);

        return newAccessToken;
    }

    @Transactional
    public void logout(Long userId, String platform) {
        // Null 체크
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (platform == null || platform.trim().isEmpty()) {
            throw new IllegalArgumentException("Platform is required");
        }

        // Redis에서 Refresh Token 삭제 (userId_platform 형태로)
        String refreshTokenId = userId + "_" + platform;
        refreshTokenRepository.deleteById(refreshTokenId);
        log.info("User logged out - userId: {}, platform: {}", userId, platform);
    }
}
