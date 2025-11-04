package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findAllByOrderByCreatedAtDesc();
}
// Workspace CRUD랑 커스텀 메서드. findAllByOrderByCreatedAtDesc 이걸로 최신순 목록.
// 데이터 접근을 JPA에게 위임.