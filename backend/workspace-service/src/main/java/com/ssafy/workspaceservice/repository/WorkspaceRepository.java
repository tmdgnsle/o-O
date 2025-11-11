package com.ssafy.workspaceservice.repository;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    Optional<Workspace> findByToken(String token);

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

    // 내가 속한 워크스페이스 전체 (cursor 없을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesInitial(
            @Param("userId") Long userId,
            Pageable pageable
    );

    // 내가 속한 워크스페이스 전체 (cursor 있을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "AND w.id < :cursor " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesWithCursor(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            Pageable pageable
    );

    // 내가 속한 워크스페이스 (타입 필터, cursor 없을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "AND w.type = :type " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesByTypeInitial(
            @Param("userId") Long userId,
            @Param("type") WorkspaceType type,
            Pageable pageable
    );

    // 내가 속한 워크스페이스 (타입 필터, cursor 있을 때)
    @Query("SELECT DISTINCT w FROM Workspace w " +
           "JOIN WorkspaceMember wm ON wm.workspace.id = w.id " +
           "WHERE wm.userId = :userId " +
           "AND w.type = :type " +
           "AND w.id < :cursor " +
           "ORDER BY w.createdAt DESC, w.id DESC")
    List<Workspace> findMyWorkspacesByTypeWithCursor(
            @Param("userId") Long userId,
            @Param("type") WorkspaceType type,
            @Param("cursor") Long cursor,
            Pageable pageable
    );
}