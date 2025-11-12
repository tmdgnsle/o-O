package com.ssafy.gatewayservice.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.gatewayservice.jwt.JwtException;
import com.ssafy.gatewayservice.jwt.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    // 인증이 필요 없는 경로
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/auth/app/google-login",
            "/oauth2/authorization/google",
            "/auth/issue-token",
            "/login/oauth2/",
            "/auth/reissue",
            "/actuator",
            "/health",
            "/swagger-ui",
            "/v3/api-docs",
            "/user-service/v3/api-docs",
            "/workspace-service/v3/api-docs",
            "/mindmap-service/v3/api-docs",
            "/trend-service/v3/api-docs",
            "/webjars"
    );

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, ObjectMapper objectMapper) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 인증이 필요 없는 경로는 필터 통과
        if (isExcludedPath(path)) {
            return chain.filter(exchange);
        }

        try {
            // Authorization 헤더에서 JWT 토큰 추출
            String token = resolveToken(request);

            if (token == null) {
                return sendErrorResponse(exchange, HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.");
            }

            // JWT 토큰 검증 (만료시간 포함)
            jwtTokenProvider.validateToken(token);

            // userId 추출
            String userId = jwtTokenProvider.getUserId(token);

            if (userId == null) {
                return sendErrorResponse(exchange, HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
            }

            // X-USER-ID 헤더에 userId 추가하여 프록시 요청 전달
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-USER-ID", userId)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JwtException e) {
            log.error("[JWT Filter] JWT Exception - Path: {}, Error: {}", path, e.getMessage());
            return sendErrorResponse(exchange, HttpStatus.UNAUTHORIZED, e.getMessage());
        } catch (Exception e) {
            log.error("[JWT Filter] Unexpected Exception - Path: {}, Type: {}, Message: {}",
                    path, e.getClass().getName(), e.getMessage(), e);
            return sendErrorResponse(exchange, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     */
    private String resolveToken(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst("Authorization");
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
    private Mono<Void> sendErrorResponse(ServerWebExchange exchange, HttpStatus status, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        errorResponse.put("data", null);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            byte[] bytes = String.format(
                    "{\"success\":false,\"message\":\"%s\",\"data\":null}", message
            ).getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        }
    }

    @Override
    public int getOrder() {
        return -100; // 높은 우선순위로 먼저 실행
    }
}
