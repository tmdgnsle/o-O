package com.ssafy.gatewayservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.to;

@Configuration
public class GatewayConfig {

    @Value("${services.ai.host}")
    private String aiServiceHost;

    @Value("${services.ai.port}")
    private int aiServicePort;

    @Bean
    public RouterFunction<ServerResponse> gatewayRoutes() {
        // AI 서버 동적 라우팅
        URI aiServiceUri = URI.create(String.format("http://%s:%d", aiServiceHost, aiServicePort));

        return route("ai-service")
                .route(req -> req.path().startsWith("/ai"), to(aiServiceUri))
                .build();
    }
}
