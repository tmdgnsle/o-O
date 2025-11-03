package com.ssafy.userservice.controller;

import com.ssafy.userservice.dto.GoogleIdTokenRequest;
import com.ssafy.userservice.service.AuthService;
import com.ssafy.userservice.util.CookieUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/reissue")
    public ResponseEntity<Void> reissue(@CookieValue("refreshToken") String refreshToken) {
        String newAccessToken = authService.reissueAccessToken(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken)
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("Client-Type") String platform) {
        authService.logout(userId, platform);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, CookieUtil.deleteRefreshTokenCookie().toString())
                .build();
    }

    @PostMapping("/app/google-login")
    public ResponseEntity<Map<String, Object>> googleLogin(@Valid @RequestBody GoogleIdTokenRequest request)
            throws GeneralSecurityException, IOException {
        Map<String, Object> result = authService.loginWithGoogleIdToken(
                request.getIdToken(),
                request.getPlatform()
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
