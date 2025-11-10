package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "AND w.createdAt >= :fromDateTime AND w.createdAt < :toDateTime " +
           "ORDER BY w.createdAt DESC")
    List<Workspace> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime
    );
}