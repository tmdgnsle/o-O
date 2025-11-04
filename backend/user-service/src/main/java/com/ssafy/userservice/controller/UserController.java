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
     * 현재 로그인한 사용자의 정보를 조회합니다.
     * Gateway에서 X-USER-ID 헤더로 userId를 전달받습니다.
     *
     * @param userId X-USER-ID 헤더에서 전달받은 사용자 ID
     * @return UserResponse
     */
    @GetMapping("")
    public ResponseEntity<UserResponse> getUser(@RequestHeader("X-USER-ID") Long userId) {
        log.info("GET /users - Retrieving user information for userId: {}", userId);
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 현재 로그인한 사용자의 정보를 수정합니다.
     * Gateway에서 X-USER-ID 헤더로 userId를 전달받습니다.
     *
     * @param userId X-USER-ID 헤더에서 전달받은 사용자 ID
     * @param request 수정할 정보
     * @return UserResponse 수정된 사용자 정보
     */
    @PutMapping("")
    public ResponseEntity<UserResponse> updateUser(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody UserUpdateRequest request) {
        log.info("PUT /users - Updating user information for userId: {}", userId);
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }
}
