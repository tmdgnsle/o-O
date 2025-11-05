package com.ssafy.gatewayservice.filter;

import com.ssafy.gatewayservice.jwt.JwtException;
import com.ssafy.gatewayservice.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    // 인증이 필요 없는 경로
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/auth/app/google-login",
            "/oauth2/authorization/google",
            "/auth/reissue",
            "/actuator",
            "/health"
    );

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 인증이 필요 없는 경로는 필터 통과
        if (isExcludedPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Authorization 헤더에서 JWT 토큰 추출
            String token = resolveToken(request);

            if (token == null) {
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.");
                return;
            }

            // JWT 토큰 검증 (만료시간 포함)
            jwtTokenProvider.validateToken(token);

            // userId 추출
            String userId = jwtTokenProvider.getUserId(token);

            if (userId == null) {
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
                return;
            }

            // X-USER-ID 헤더에 userId 추가하여 프록시 요청 전달
            HttpServletRequest wrappedRequest = new UserIdHeaderRequestWrapper(request, userId);
            filterChain.doFilter(wrappedRequest, response);

        } catch (JwtException e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, e.getMessage());
        } catch (Exception e) {
            sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "인증 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * 인증이 필요 없는 경로인지 확인
     */
    private boolean isExcludedPath(String path) {
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    /**
     * 에러 응답 전송
     */
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(String.format(
                "{\"success\":false,\"message\":\"%s\",\"data\":null}", message
        ));
    }
}
