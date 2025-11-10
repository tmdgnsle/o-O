package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findAllByOrderByCreatedAtDesc();
}