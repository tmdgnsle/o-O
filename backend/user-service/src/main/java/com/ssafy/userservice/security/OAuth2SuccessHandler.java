package com.ssafy.userservice.security;

import com.ssafy.userservice.entity.RefreshToken;
import com.ssafy.userservice.jwt.JwtUtil;
import com.ssafy.userservice.repository.RefreshTokenRepository;
import com.ssafy.userservice.util.CookieUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Long userId = oAuth2User.getUserId();
        String role = oAuth2User.getRole();

        log.info("OAuth2 login success - userId: {}, role: {}", userId, role);

        // Access Token 생성
        String accessToken = jwtUtil.generateToken("access", userId, role, accessTokenExpiration);

        // Refresh Token 생성
        String refreshToken = jwtUtil.generateToken("refresh", userId, role, refreshTokenExpiration);

        // Refresh Token을 Redis에 저장
        RefreshToken refreshTokenEntity = new RefreshToken(
                userId,
                refreshToken,
                refreshTokenExpiration / 1000  // 밀리초를 초로 변환 (TTL은 초 단위)
        );
        refreshTokenRepository.deleteById(userId);  // 기존 토큰 삭제
        refreshTokenRepository.save(refreshTokenEntity);

        // Access Token은 헤더로 전달
        response.setHeader("Authorization", "Bearer " + accessToken);

        // Refresh Token은 HttpOnly Cookie로 전달
        ResponseCookie refreshCookie = CookieUtil.createRefreshTokenCookie(refreshToken, 7 * 24 * 60 * 60);
        response.addHeader("Set-Cookie", refreshCookie.toString());

        // 응답
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"login success\", \"userId\": " + userId + "}");

        log.info("JWT tokens issued for userId: {}", userId);
    }
}
