package com.ssafy.userservice.controller;

import com.ssafy.userservice.dto.UserResponse;
import com.ssafy.userservice.dto.UserUpdateRequest;
import com.ssafy.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * 사용자 정보를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return UserResponse
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        log.info("GET /users/{} - Retrieving user information", userId);
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 정보를 수정합니다.
     *
     * @param userId 사용자 ID
     * @param request 수정할 정보
     * @return UserResponse 수정된 사용자 정보
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequest request) {
        log.info("PATCH /users/{} - Updating user information", userId);
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }
}
