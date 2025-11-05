package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    Long countByWorkspaceId(Long workspaceId);
}
// WorkspaceMember CRUD + 조회 보조함.
// 컨트롤러/서비스에서 필요한 조회 기능 최소 제공.
