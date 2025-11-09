package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.client.WorkspaceServiceClient;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.AiAnalysisRequest;
import com.ssafy.mindmapservice.kafka.AiAnalysisProducer;
import com.ssafy.mindmapservice.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;
    private final WorkspaceServiceClient workspaceServiceClient;
    private final AiAnalysisProducer aiAnalysisProducer;
    private final SequenceGeneratorService sequenceGeneratorService;

    public List<MindmapNode> getNodesByWorkspace(Long workspaceId) {
        log.debug("Getting all nodes for workspace: {}", workspaceId);
        return nodeRepository.findByWorkspaceId(workspaceId);
    }

    public MindmapNode getNode(Long workspaceId, Long nodeId) {
        log.debug("Getting node: workspaceId={}, nodeId={}", workspaceId, nodeId);
        return nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));
    }

    public MindmapNode createNode(MindmapNode node) {
        log.debug("Creating node: workspaceId={}", node.getWorkspaceId());

        // nodeId 자동 생성 (워크스페이스별로 1부터 증가)
        Long nextNodeId = sequenceGeneratorService.generateNextNodeId(node.getWorkspaceId());
        node.setNodeId(nextNodeId);

        node.setCreatedAt(LocalDateTime.now());
        node.setUpdatedAt(LocalDateTime.now());

        if (node.getAnalysisStatus() == null) {
            node.setAnalysisStatus(MindmapNode.AnalysisStatus.NONE);
        }

        log.info("Created node with auto-generated nodeId: workspaceId={}, nodeId={}",
                node.getWorkspaceId(), node.getNodeId());
        return nodeRepository.save(node);
    }

    public MindmapNode updateNode(Long workspaceId, Long nodeId, MindmapNode updates) {
        log.debug("Updating node: workspaceId={}, nodeId={}", workspaceId, nodeId);

        MindmapNode existingNode = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        if (updates.getKeyword() != null) {
            existingNode.setKeyword(updates.getKeyword());
        }
        if (updates.getMemo() != null) {
            existingNode.setMemo(updates.getMemo());
        }
        if (updates.getX() != null) {
            existingNode.setX(updates.getX());
        }
        if (updates.getY() != null) {
            existingNode.setY(updates.getY());
        }
        if (updates.getColor() != null) {
            existingNode.setColor(updates.getColor());
        }
        if (updates.getParentId() != null) {
            existingNode.setParentId(updates.getParentId());
        }
        if (updates.getContentUrl() != null) {
            existingNode.setContentUrl(updates.getContentUrl());
        }
        if (updates.getAiSummary() != null) {
            existingNode.setAiSummary(updates.getAiSummary());
        }
        if (updates.getAnalysisStatus() != null) {
            existingNode.setAnalysisStatus(updates.getAnalysisStatus());
        }

        existingNode.setUpdatedAt(LocalDateTime.now());

        return nodeRepository.save(existingNode);
    }

    @Transactional
    public void deleteNode(Long workspaceId, Long nodeId) {
        log.debug("Deleting node: workspaceId={}, nodeId={}", workspaceId, nodeId);
        nodeRepository.deleteByWorkspaceIdAndNodeId(workspaceId, nodeId);
    }

    @Transactional
    public void deleteAllNodes(Long workspaceId) {
        log.debug("Deleting all nodes for workspace: {}", workspaceId);
        nodeRepository.deleteByWorkspaceId(workspaceId);
    }

    public long countNodes(Long workspaceId) {
        return nodeRepository.countByWorkspaceId(workspaceId);
    }

    public MindmapNode updateNodePosition(Long workspaceId, Long nodeId, Double x, Double y) {
        log.debug("Updating node position: workspaceId={}, nodeId={}, x={}, y={}", workspaceId, nodeId, x, y);

        MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        node.setX(x);
        node.setY(y);
        node.setUpdatedAt(LocalDateTime.now());

        return nodeRepository.save(node);
    }

    public MindmapNode updateNodeColor(Long workspaceId, Long nodeId, String color) {
        log.debug("Updating node color: workspaceId={}, nodeId={}, color={}", workspaceId, nodeId, color);

        MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        node.setColor(color);
        node.setUpdatedAt(LocalDateTime.now());

        return nodeRepository.save(node);
    }

    @Transactional
    public List<MindmapNode> cloneWorkspace(Long sourceWorkspaceId, String newWorkspaceName, String newWorkspaceDescription) {
        log.info("Cloning workspace: source={}, newName={}", sourceWorkspaceId, newWorkspaceName);

        List<MindmapNode> sourceNodes = nodeRepository.findByWorkspaceId(sourceWorkspaceId);

        if (sourceNodes.isEmpty()) {
            throw new IllegalArgumentException("Source workspace is empty: " + sourceWorkspaceId);
        }

        Long newWorkspaceId = workspaceServiceClient.createWorkspace(newWorkspaceName, newWorkspaceDescription);
        log.info("Created new workspace with ID: {}", newWorkspaceId);

        List<MindmapNode> clonedNodes = sourceNodes.stream()
                .map(node -> MindmapNode.builder()
                        .nodeId(node.getNodeId())
                        .workspaceId(newWorkspaceId)
                        .parentId(node.getParentId())
                        .type(node.getType())
                        .keyword(node.getKeyword())
                        .memo(node.getMemo())
                        .contentUrl(node.getContentUrl())
                        .aiSummary(node.getAiSummary())
                        .analysisStatus(node.getAnalysisStatus())
                        .x(node.getX())
                        .y(node.getY())
                        .color(node.getColor())
                        .createdBy(node.getCreatedBy())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
                .toList();

        List<MindmapNode> savedNodes = nodeRepository.saveAll(clonedNodes);
        log.info("Cloned {} nodes to workspace {}", savedNodes.size(), newWorkspaceId);

        return savedNodes;
    }

    /**
     * AI 분석을 요청합니다.
     * 1. 노드의 분석 상태를 PENDING으로 변경
     * 2. Kafka를 통해 AI 서버로 분석 요청 전송
     */
    public void requestAiAnalysis(Long workspaceId, Long nodeId, String contentUrl,
                                  String contentType, String prompt, String userId) {
        log.info("Requesting AI analysis: workspaceId={}, nodeId={}, contentType={}",
                workspaceId, nodeId, contentType);

        // 1. 노드 존재 확인
        MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        // 2. 분석 상태를 PENDING으로 변경
        node.setAnalysisStatus(MindmapNode.AnalysisStatus.PENDING);
        node.setContentUrl(contentUrl);
        node.setUpdatedAt(LocalDateTime.now());
        nodeRepository.save(node);

        // 3. Kafka를 통해 AI 서버로 분석 요청 전송
        AiAnalysisRequest request = new AiAnalysisRequest(
                workspaceId,
                nodeId,
                contentUrl,
                contentType,
                prompt,
                userId
        );

        aiAnalysisProducer.sendAnalysisRequest(request);

        log.info("AI analysis request sent successfully: nodeId={}", nodeId);
    }
}
