package com.ssafy.userservice.jwt;

import com.ssafy.userservice.enums.Platform;
import com.ssafy.userservice.enums.TokenCategory;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                Jwts.SIG.HS256.key().build().getAlgorithm()
        );
    }

    public String getCategory(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("category", String.class);
    }

    public Long getUserId(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("userId", Long.class);
    }

    public String getRole(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }

    public String getPlatform(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("platform", String.class);
    }

    /**
     * JWT 토큰의 만료 여부를 확인합니다.
     * Gateway에서도 검증하지만, 방어적 프로그래밍을 위해 User Service에서도 검증합니다.
     *
     * @param token JWT 토큰
     * @return 만료되었으면 true, 유효하면 false
     */
    public Boolean isExpired(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }

        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration()
                    .before(new Date());
        } catch (ExpiredJwtException e) {
            // 토큰이 이미 만료된 경우
            return true;
        }
    }

    /**
     * JWT 토큰을 생성합니다.
     *
     * @param category 토큰 카테고리 (ACCESS/REFRESH)
     * @param userId 사용자 ID
     * @param role 사용자 역할
     * @param platform 플랫폼 (WEB/APP)
     * @param expiredMs 만료 시간 (밀리초)
     * @return JWT 토큰 문자열
     */
    public String generateToken(TokenCategory category, Long userId, String role, Platform platform, Long expiredMs) {
        return Jwts.builder()
                .claim("category", category.getValue())
                .claim("userId", userId)
                .claim("role", role)
                .claim("platform", platform.getValue())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                .signWith(secretKey)
                .compact();
    }
}
