package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    Long countByWorkspaceId(Long workspaceId);
    void deleteByWorkspaceId(Long workspaceId);
}