package com.ssafy.userservice.service;

import com.ssafy.userservice.dto.UserResponse;
import com.ssafy.userservice.dto.UserUpdateRequest;
import com.ssafy.userservice.entity.User;
import com.ssafy.userservice.exception.UserNotFoundException;
import com.ssafy.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * 사용자 ID로 사용자 정보를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return UserResponse
     * @throws UserNotFoundException 사용자를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        return UserResponse.from(user);
    }

    /**
     * 사용자 정보를 수정합니다.
     *
     * @param userId 사용자 ID
     * @param request 수정할 정보
     * @return UserResponse 수정된 사용자 정보
     * @throws UserNotFoundException 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // nickname이 null이 아닌 경우에만 업데이트
        if (request.nickname() != null) {
            user.updateNickname(request.nickname());
        }

        // profileImage가 null이 아닌 경우에만 업데이트
        if (request.profileImage() != null) {
            user.updateProfileImage(request.profileImage());
        }

        log.info("User updated - userId: {}", userId);

        return UserResponse.from(user);
    }
}
