package com.ssafy.gatewayservice.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.reactivestreams.Publisher;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Swagger OpenAPI 문서의 서버 URL을 Gateway URL로 변경하는 필터
 *
 * 각 마이크로서비스의 OpenAPI 문서에는 내부 서비스 이름(예: user-svc)이 포함되어 있어
 * 브라우저에서 직접 호출할 수 없습니다. 이 필터는 서버 URL을 Gateway URL로 변경하여
 * Swagger UI에서 정상적으로 API를 테스트할 수 있게 합니다.
 */
@Component
public class SwaggerServerUrlFilter implements GlobalFilter, Ordered {

    private final ObjectMapper objectMapper;
    private final String gatewayUrl;

    public SwaggerServerUrlFilter(ObjectMapper objectMapper,
                                   @org.springframework.beans.factory.annotation.Value("${gateway.url:http://localhost:8080}") String gatewayUrl) {
        this.objectMapper = objectMapper;
        this.gatewayUrl = gatewayUrl;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // OpenAPI 문서 요청이 아니면 그냥 통과
        if (!path.contains("/v3/api-docs")) {
            return chain.filter(exchange);
        }

        ServerHttpResponse originalResponse = exchange.getResponse();
        DataBufferFactory bufferFactory = originalResponse.bufferFactory();

        // Response를 가로채서 수정
        ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
            @Override
            public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                if (body instanceof Flux) {
                    Flux<? extends DataBuffer> fluxBody = (Flux<? extends DataBuffer>) body;

                    return super.writeWith(fluxBody.buffer().map(dataBuffers -> {
                        // DataBuffer들을 하나로 합치기
                        DataBuffer joinedBuffer = bufferFactory.join(dataBuffers);
                        byte[] content = new byte[joinedBuffer.readableByteCount()];
                        joinedBuffer.read(content);
                        DataBufferUtils.release(joinedBuffer);

                        // JSON 파싱 및 수정
                        String modifiedJson = modifyOpenApiServers(new String(content, StandardCharsets.UTF_8), path);

                        // 수정된 JSON을 DataBuffer로 변환
                        byte[] modifiedBytes = modifiedJson.getBytes(StandardCharsets.UTF_8);
                        return bufferFactory.wrap(modifiedBytes);
                    }));
                }
                return super.writeWith(body);
            }
        };

        return chain.filter(exchange.mutate().response(decoratedResponse).build());
    }

    /**
     * OpenAPI JSON의 servers 배열을 Gateway URL로 변경
     */
    private String modifyOpenApiServers(String originalJson, String path) {
        try {
            JsonNode rootNode = objectMapper.readTree(originalJson);

            if (rootNode instanceof ObjectNode) {
                ObjectNode root = (ObjectNode) rootNode;

                // servers 배열 생성 또는 수정
                ArrayNode serversArray = objectMapper.createArrayNode();
                ObjectNode serverNode = objectMapper.createObjectNode();

                // Gateway URL 설정 (환경에 따라 변경 가능)
                // localhost 또는 실제 도메인
                String gatewayUrl = determineGatewayUrl();
                serverNode.put("url", gatewayUrl);
                serverNode.put("description", "Gateway Server");

                serversArray.add(serverNode);
                root.set("servers", serversArray);

                return objectMapper.writeValueAsString(root);
            }
        } catch (Exception e) {
            // JSON 파싱 실패 시 원본 그대로 반환
            return originalJson;
        }

        return originalJson;
    }

    /**
     * Gateway URL 결정
     * application.yml의 gateway.url 설정 사용
     */
    private String determineGatewayUrl() {
        return gatewayUrl;
    }

    @Override
    public int getOrder() {
        return -50; // JWT 필터(-100) 다음에 실행
    }
}