package com.ssafy.gatewayservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Gateway 에러 응답 유틸리티 클래스
 */
public class GatewayResponseUtil {

    /**
     * JSON 형식의 에러 응답 전송
     *
     * @param exchange ServerWebExchange
     * @param status HTTP 상태 코드
     * @param message 에러 메시지
     * @param objectMapper JSON 변환용 ObjectMapper
     * @return Mono<Void>
     */
    public static Mono<Void> sendErrorResponse(
            ServerWebExchange exchange,
            HttpStatus status,
            String message,
            ObjectMapper objectMapper
    ) {
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
            // ObjectMapper 실패 시 fallback
            byte[] bytes = String.format(
                    "{\"success\":false,\"message\":\"%s\",\"data\":null}", message
            ).getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        }
    }
}
