package com.ssafy.userservice.repository;

import com.ssafy.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByProviderId(String providerId);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
