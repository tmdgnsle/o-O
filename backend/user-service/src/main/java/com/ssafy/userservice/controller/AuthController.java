package com.ssafy.userservice.controller;

import com.ssafy.userservice.dto.GoogleIdTokenRequest;
import com.ssafy.userservice.service.AuthService;
import com.ssafy.userservice.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

@Tag(name = "인증 API", description = "로그인, 로그아웃, 토큰 재발급 API")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "토큰 재발급", description = "Refresh Token을 이용하여 Access Token과 Refresh Token을 재발급합니다 (RTR 방식)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 재발급 성공 (Authorization 헤더에 새 Access Token, Set-Cookie 헤더에 새 Refresh Token 반환)"),
            @ApiResponse(responseCode = "401", description = "유효하지 않거나 만료된 Refresh Token", content = @Content)
    })
    @PostMapping("/reissue")
    public ResponseEntity<Void> reissue(@CookieValue("refreshToken") String refreshToken) {
        Map<String, String> tokens = authService.reissueTokens(refreshToken);

        String newAccessToken = tokens.get("accessToken");
        String newRefreshToken = tokens.get("refreshToken");

        // Access Token: Authorization 헤더
        // Refresh Token: HttpOnly 쿠키 (RTR 적용)
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken)
                .header(HttpHeaders.SET_COOKIE, CookieUtil.createRefreshTokenCookie(newRefreshToken).toString())
                .build();
    }

    @Operation(summary = "로그아웃", description = "사용자를 로그아웃하고 Refresh Token을 무효화합니다")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그아웃 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("Client-Type") String platform) {
        authService.logout(userId, platform);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, CookieUtil.deleteRefreshTokenCookie().toString())
                .build();
    }

    @Operation(summary = "모바일 구글 로그인", description = "Google ID Token을 이용한 모바일 로그인 (앱 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공 (Authorization 헤더에 Access Token, Set-Cookie 헤더에 Refresh Token, Body에 userId 반환)",
                    content = @Content(examples = @ExampleObject(value = "{\"userId\": 1}"))),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 ID Token", content = @Content)
    })
    @SecurityRequirement(name = "")
    @PostMapping("/app/google-login")
    public ResponseEntity<Map<String, Object>> googleLogin(@Valid @RequestBody GoogleIdTokenRequest request)
            throws GeneralSecurityException, IOException {
        Map<String, Object> result = authService.loginWithGoogleIdToken(
                request.idToken(),
                request.platform()
        );

        String accessToken = (String) result.get("accessToken");
        String refreshToken = (String) result.get("refreshToken");
        Long userId = (Long) result.get("userId");

        // Access Token: Authorization 헤더
        // Refresh Token: HttpOnly 쿠키
        // Response Body: userId만 반환
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.SET_COOKIE, CookieUtil.createRefreshTokenCookie(refreshToken).toString())
                .body(Map.of("userId", userId));
    }
}
