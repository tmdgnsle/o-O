package com.ssafy.gatewayservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Value("${services.ai.host}")
    private String aiServiceHost;

    @Value("${services.ai.port}")
    private int aiServicePort;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        // AI 서버 동적 라우팅
        String aiUrl = String.format("http://%s:%d", aiServiceHost, aiServicePort);
        return builder.routes()
                .route("ai-service", r -> r.path("/ai/**")
                        .uri(aiUrl))
                .build();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
