package com.ssafy.mindmapservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatCompletionRequest {
    private String model;              // "gpt-5" 등
    private List<ChatMessage> messages;
    // 필요하면 temperature, max_tokens 등 나중에 추가
}