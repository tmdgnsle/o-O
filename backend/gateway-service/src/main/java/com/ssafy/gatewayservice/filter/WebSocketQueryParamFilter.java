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
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 웹소켓 연결 시 쿼리 파라미터를 헤더로 변환하는 필터
 * 예: ws://host:3000/ws?workspace=123&token=xxx
 * -> 헤더에 X-Workspace-ID: 123, X-USER-ID: userId 추가
 */
@Slf4j
@Component
public class WebSocketQueryParamFilter implements GlobalFilter, Ordered {

    private final JwtTokenValidator jwtTokenValidator;
    private final ObjectMapper objectMapper;

    public WebSocketQueryParamFilter(JwtTokenValidator jwtTokenValidator, ObjectMapper objectMapper) {
        this.jwtTokenValidator = jwtTokenValidator;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 웹소켓 경로가 아니면 필터 통과
        if (!isWebSocketPath(path)) {
            return chain.filter(exchange);
        }

        try {
            MultiValueMap<String, String> queryParams = request.getQueryParams();
            ServerHttpRequest.Builder mutatedRequest = request.mutate();

            // workspace 파라미터를 X-Workspace-ID 헤더로 변환
            String workspace = queryParams.getFirst("workspace");
            if (workspace != null) {
                mutatedRequest.header("X-Workspace-ID", workspace);
                log.debug("[WebSocket Filter] Added X-Workspace-ID header: {}", workspace);
            }

            // token 파라미터에서 userId 추출하여 X-USER-ID 헤더로 변환
            String token = queryParams.getFirst("token");
            if (token == null) {
                return GatewayResponseUtil.sendErrorResponse(
                        exchange, HttpStatus.UNAUTHORIZED, "토큰이 필요합니다.", objectMapper
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

            mutatedRequest.header("X-USER-ID", userId);
            log.debug("[WebSocket Filter] Added X-USER-ID header: {}", userId);

            return chain.filter(exchange.mutate().request(mutatedRequest.build()).build());

        } catch (JwtException e) {
            log.error("[WebSocket Filter] JWT Exception - Path: {}, Error: {}", path, e.getMessage());
            return GatewayResponseUtil.sendErrorResponse(
                    exchange, HttpStatus.UNAUTHORIZED, e.getMessage(), objectMapper
            );
        } catch (Exception e) {
            log.error("[WebSocket Filter] Unexpected Exception - Path: {}, Type: {}, Message: {}",
                    path, e.getClass().getName(), e.getMessage(), e);
            return GatewayResponseUtil.sendErrorResponse(
                    exchange, HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.", objectMapper
            );
        }
    }

    /**
     * 웹소켓 경로인지 확인
     */
    private boolean isWebSocketPath(String path) {
        return path.startsWith("/mindmap/ws") || path.startsWith("/ws");
    }

    @Override
    public int getOrder() {
        return -200; // JWT 필터보다 먼저 실행되도록 설정
    }
}
