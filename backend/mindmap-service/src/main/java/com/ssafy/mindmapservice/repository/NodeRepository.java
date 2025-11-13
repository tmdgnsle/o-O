package com.ssafy.mindmapservice.repository;

import com.ssafy.mindmapservice.domain.MindmapNode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 마인드맵 노드 Repository
 */
@Repository
public interface NodeRepository extends MongoRepository<MindmapNode, String> {

    // 워크스페이스 ID로 모든 노드 조회
    List<MindmapNode> findByWorkspaceId(Long workspaceId);


     // 워크스페이스 ID와 노드 ID로 단일 노드 조회
    Optional<MindmapNode> findByWorkspaceIdAndNodeId(Long workspaceId, Long nodeId);


    // 워크스페이스 ID와 노드 ID로 노드 삭제
    void deleteByWorkspaceIdAndNodeId(Long workspaceId, Long nodeId);


    // 워크스페이스 ID로 모든 노드 삭제
    // 워크스페이스 삭제 시 사용
    void deleteByWorkspaceId(Long workspaceId);

    //워크스페이스의 노드 개수 조회
    long countByWorkspaceId(Long workspaceId);

    // 여러 워크스페이스 ID로 모든 노드 조회 (일괄 조회)
    List<MindmapNode> findByWorkspaceIdIn(List<Long> workspaceIds);
}
