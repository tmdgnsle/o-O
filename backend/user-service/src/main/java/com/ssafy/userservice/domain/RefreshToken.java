package com.ssafy.userservice.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@RedisHash("refreshToken")
@AllArgsConstructor
@Getter
public class RefreshToken {
    @Id
    private String id;  // userId_platform 형태 (예: "1_web")

    private String token;

    @TimeToLive
    private Long expiration;  // TTL (초 단위)
}
