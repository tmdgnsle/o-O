package com.ssafy.userservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Void> handleInvalidToken(InvalidTokenException e) {
        log.error("Invalid token: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<Void> handleTokenExpired(TokenExpiredException e) {
        log.error("Token expired: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @ExceptionHandler(TokenNotFoundException.class)
    public ResponseEntity<Void> handleTokenNotFound(TokenNotFoundException e) {
        log.error("Token not found: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Void> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Bad request: {}", e.getMessage());
        return ResponseEntity.badRequest().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Void> handleException(Exception e) {
        log.error("Internal server error: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
