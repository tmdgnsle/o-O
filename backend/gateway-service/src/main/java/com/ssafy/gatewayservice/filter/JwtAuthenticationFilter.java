package com.ssafy.gatewayservice.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.gatewayservice.jwt.JwtException;
import com.ssafy.gatewayservice.jwt.JwtTokenValidator;
import com.ssafy.gatewayservice.util.GatewayResponseUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtTokenValidator jwtTokenValidator;
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
            "/webjars",
            "/mindmap/ws"  // WebSocket 경로 (WebSocketQueryParamFilter에서 처리)
    );

    public JwtAuthenticationFilter(JwtTokenValidator jwtTokenValidator, ObjectMapper objectMapper) {
        this.jwtTokenValidator = jwtTokenValidator;
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
                return GatewayResponseUtil.sendErrorResponse(
                        exchange, HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.", objectMapper
                );
            }

            // JWT 토큰 검증 (만료시간 포함)
            jwtTokenValidator.validateToken(token);

            // userId 추출
            String userId = jwtTokenValidator.getUserId(token);

            if (userId == null) {
                return GatewayResponseUtil.sendErrorResponse(
                        exchange, HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", objectMapper
                );
            }

            // X-USER-ID 헤더에 userId 추가하여 프록시 요청 전달
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-USER-ID", userId)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JwtException e) {
            log.error("[JWT Filter] JWT Exception - Path: {}, Error: {}", path, e.getMessage());
            return GatewayResponseUtil.sendErrorResponse(
                    exchange, HttpStatus.UNAUTHORIZED, e.getMessage(), objectMapper
            );
        } catch (Exception e) {
            log.error("[JWT Filter] Unexpected Exception - Path: {}, Type: {}, Message: {}",
                    path, e.getClass().getName(), e.getMessage(), e);
            return GatewayResponseUtil.sendErrorResponse(
                    exchange, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), objectMapper
            );
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

    @Override
    public int getOrder() {
        return -100; // 높은 우선순위로 먼저 실행
    }
}
