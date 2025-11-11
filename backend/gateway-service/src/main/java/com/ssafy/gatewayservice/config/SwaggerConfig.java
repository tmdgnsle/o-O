package com.ssafy.gatewayservice.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Gateway에서 여러 마이크로서비스의 Swagger UI를 통합
 *
 * 각 서비스의 API 문서를 드롭다운으로 선택하여 확인 가능
 * URL: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class SwaggerConfig {

    @Value("${USER_SERVICE_URL:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${WORKSPACE_SERVICE_URL:http://localhost:8082}")
    private String workspaceServiceUrl;

    @Value("${MINDMAP_SERVICE_URL:http://localhost:8083}")
    private String mindmapServiceUrl;

    /**
     * User Service API 그룹
     */
    @Bean
    public GroupedOpenApi userServiceApi() {
        return GroupedOpenApi.builder()
                .group("user-service")
                .pathsToMatch("/auth/**", "/oauth2/**", "/users/**")
                .build();
    }

    /**
     * Workspace Service API 그룹
     */
    @Bean
    public GroupedOpenApi workspaceServiceApi() {
        return GroupedOpenApi.builder()
                .group("workspace-service")
                .pathsToMatch("/workspace/**")
                .build();
    }

    /**
     * Mindmap Service API 그룹
     */
    @Bean
    public GroupedOpenApi mindmapServiceApi() {
        return GroupedOpenApi.builder()
                .group("mindmap-service")
                .pathsToMatch("/mindmap/**")
                .build();
    }
}