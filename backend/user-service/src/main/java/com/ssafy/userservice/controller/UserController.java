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

    @GetMapping("")
    public ResponseEntity<UserResponse> getUser(@RequestHeader("X-USER-ID") Long userId) {
        log.info("GET /users - Retrieving user information for userId: {}", userId);
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("")
    public ResponseEntity<UserResponse> updateUser(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody UserUpdateRequest request) {
        log.info("PUT /users - Updating user information for userId: {}", userId);
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }
}
