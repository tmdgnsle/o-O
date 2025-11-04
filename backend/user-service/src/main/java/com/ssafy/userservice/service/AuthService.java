package com.ssafy.userservice.service;

import com.ssafy.userservice.entity.RefreshToken;
import com.ssafy.userservice.entity.User;
import com.ssafy.userservice.exception.InvalidTokenException;
import com.ssafy.userservice.exception.TokenExpiredException;
import com.ssafy.userservice.exception.TokenNotFoundException;
import com.ssafy.userservice.jwt.JwtUtil;
import com.ssafy.userservice.repository.RefreshTokenRepository;
import com.ssafy.userservice.repository.UserRepository;
import com.ssafy.userservice.util.GoogleTokenVerifier;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    /**
     * RTR(Refresh Token Rotation) 방식으로 토큰을 재발급합니다.
     * Access Token과 Refresh Token을 모두 새로 발급하고, 기존 Refresh Token은 무효화됩니다.
     *
     * @param refreshToken 기존 Refresh Token
     * @return Map containing newAccessToken, newRefreshToken
     * @throws TokenExpiredException Refresh Token 만료
     * @throws InvalidTokenException 유효하지 않은 Refresh Token
     * @throws TokenNotFoundException Redis에 저장된 토큰 없음
     */
    @Transactional
    public Map<String, String> reissueTokens(String refreshToken) {
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

        // RTR: 새로운 Access Token과 Refresh Token 모두 발급
        String newAccessToken = jwtUtil.generateToken("access", userId, role, platform, accessTokenExpiration);
        String newRefreshToken = jwtUtil.generateToken("refresh", userId, role, platform, refreshTokenExpiration);

        // 기존 Refresh Token 삭제 후 새 토큰 저장
        refreshTokenRepository.deleteById(refreshTokenId);
        Long ttlSeconds = refreshTokenExpiration / 1000;  // milliseconds to seconds
        RefreshToken newRefreshTokenEntity = new RefreshToken(
                refreshTokenId,
                newRefreshToken,
                ttlSeconds
        );
        refreshTokenRepository.save(newRefreshTokenEntity);

        log.info("Tokens reissued with RTR for userId: {}, platform: {}, TTL: {} seconds", userId, platform, ttlSeconds);

        return Map.of(
                "accessToken", newAccessToken,
                "refreshToken", newRefreshToken
        );
    }

    @Transactional
    public void logout(Long userId, String platform) {
        // Null 체크
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        validatePlatform(platform);

        // Redis에서 Refresh Token 삭제 (userId_platform 형태로)
        String refreshTokenId = userId + "_" + platform;
        refreshTokenRepository.deleteById(refreshTokenId);
        log.info("User logged out - userId: {}, platform: {}", userId, platform);
    }

    /**
     * 플랫폼 값을 검증합니다.
     *
     * @param platform "web" 또는 "app"
     * @throws IllegalArgumentException 유효하지 않은 플랫폼 값
     */
    private void validatePlatform(String platform) {
        if (platform == null || platform.isBlank()) {
            throw new IllegalArgumentException("Platform is required");
        }
        if (!"web".equals(platform) && !"app".equals(platform)) {
            throw new IllegalArgumentException("Invalid platform: " + platform + ". Allowed values are: web, app");
        }
    }

    /**
     * Google ID Token을 검증하고 로그인 처리합니다.
     *
     * @param idToken Google ID Token
     * @param platform 플랫폼 (app)
     * @return Map containing accessToken, refreshToken, userId
     * @throws GeneralSecurityException ID Token 검증 실패
     * @throws IOException 네트워크 오류
     */
    @Transactional
    public Map<String, Object> loginWithGoogleIdToken(String idToken, String platform)
            throws GeneralSecurityException, IOException {
        // Null 체크 및 플랫폼 검증
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("ID token is required");
        }
        validatePlatform(platform);

        // Google ID Token 검증 및 사용자 정보 추출
        Map<String, Object> userInfo = googleTokenVerifier.verifyAndExtract(idToken);

        // 필수 정보 추출 및 NULL 체크
        String providerId = (String) userInfo.get("sub");
        if (providerId == null || providerId.isBlank()) {
            throw new IllegalArgumentException("Provider ID (sub) not found in ID token");
        }

        String email = (String) userInfo.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email not found in ID token");
        }

        // 선택적 정보 (NULL 허용)
        String name = (String) userInfo.get("name");
        String picture = (String) userInfo.get("picture");

        // 사용자 조회 또는 생성
        User user = userRepository.findByProviderId(providerId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .nickname(name != null ? name : email.split("@")[0])  // name이 없으면 이메일 앞부분 사용
                            .profileImage(picture)
                            .providerId(providerId)
                            .role(User.Role.USER)
                            .build();
                    User savedUser = userRepository.save(newUser);
                    log.info("Created new user with providerId: {}", providerId);
                    return savedUser;
                });

        Long userId = user.getId();
        String role = user.getRole().name();

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateToken("access", userId, role, platform, accessTokenExpiration);
        String refreshToken = jwtUtil.generateToken("refresh", userId, role, platform, refreshTokenExpiration);

        // Refresh Token Redis 저장
        String refreshTokenId = userId + "_" + platform;
        // 기존 토큰 삭제 (동일 플랫폼)
        refreshTokenRepository.deleteById(refreshTokenId);
        // 새 토큰 저장
        Long ttlSeconds = refreshTokenExpiration / 1000;  // milliseconds to seconds
        RefreshToken refreshTokenEntity = new RefreshToken(
                refreshTokenId,
                refreshToken,
                ttlSeconds
        );
        refreshTokenRepository.save(refreshTokenEntity);

        log.info("User logged in with Google ID Token - userId: {}, platform: {}, TTL: {} seconds", userId, platform, ttlSeconds);

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "userId", userId
        );
    }
}
