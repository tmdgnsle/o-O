package com.ssafy.userservice.controller;

import com.ssafy.userservice.service.AuthService;
import com.ssafy.userservice.util.CookieUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
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
}
