import 'dart:math' as math;

import 'package:dartz/dartz.dart';
import 'package:flutter/material.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/mindmap.dart';
import '../../domain/entities/mindmap_edge.dart';
import '../../domain/entities/mindmap_node.dart';
import '../../domain/repositories/mindmap_repository.dart';
import '../datasources/mindmap_api_data_source.dart';
import '../models/mindmap_creation_response.dart';
import '../models/mindmap_node_model.dart';

/// Mindmap Repository Implementation
class MindmapRepositoryImpl implements MindmapRepository {
  final MindmapApiDataSource apiDataSource;

  MindmapRepositoryImpl({
    required this.apiDataSource,
  });

  @override
  Future<Either<Failure, Mindmap>> getMindmapByWorkspaceId(int workspaceId) async {
    try {
      logger.i('🔄 MindmapRepositoryImpl: Fetching mindmap for workspace $workspaceId');

      // 1. API에서 노드 데이터 가져오기
      final nodeModels = await apiDataSource.getMindmapNodes(workspaceId);

      if (nodeModels.isEmpty) {
        logger.w('⚠️ No nodes found for workspace $workspaceId');
        return Left(ServerFailure('마인드맵 노드가 없습니다'));
      }

      // 2. 레벨 계산 (parentId 기반 BFS)
      final levels = _calculateLevels(nodeModels);
      logger.d('📊 Calculated levels: $levels');

      // 3. 좌표 할당 (x, y가 null인 경우 자동 배치)
      final positions = _calculatePositions(nodeModels, levels);
      logger.d('📍 Calculated positions for ${positions.length} nodes');

      // 4. Entity 변환
      final nodes = nodeModels.map((model) {
        final level = levels[model.id] ?? 0;
        final position = positions[model.id] ?? const Offset(0, 0);

        return model.toEntity(
          level: level,
          position: position,
        );
      }).toList();

      // 5. Edge 자동 생성 (parentId 기반)
      final edges = _generateEdges(nodeModels);
      logger.d('🔗 Generated ${edges.length} edges');

      // 6. Mindmap 생성
      final mindmap = Mindmap(
        id: workspaceId.toString(),
        title: 'Workspace $workspaceId Mindmap',
        nodes: nodes,
        edges: edges,
        createdAt: DateTime.now(),
      );

      logger.i('✅ MindmapRepositoryImpl: Successfully created mindmap with ${nodes.length} nodes and ${edges.length} edges');

      return Right(mindmap);
    } on ServerException catch (e) {
      logger.e('❌ MindmapRepositoryImpl: ServerException - ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e, stackTrace) {
      logger.e('❌ MindmapRepositoryImpl: Unexpected error - $e');
      logger.e('📍 StackTrace: $stackTrace');
      return Left(ServerFailure('마인드맵 로드 실패: $e'));
    }
  }

  /// 레벨 계산 (BFS)
  Map<String, int> _calculateLevels(List<MindmapNodeModel> nodes) {
    final levels = <String, int>{};

    // 1. 루트 노드 찾기 (parentId == null)
    for (var node in nodes) {
      if (node.parentId == null) {
        levels[node.id] = 0;
      }
    }

    if (levels.isEmpty) {
      logger.w('⚠️ No root node found, using first node as root');
      if (nodes.isNotEmpty) {
        levels[nodes.first.id] = 0;
      }
    }

    // 2. BFS로 자식 노드들의 레벨 계산
    bool changed = true;
    int maxIterations = 100; // 무한 루프 방지
    int iteration = 0;

    while (changed && iteration < maxIterations) {
      changed = false;
      iteration++;

      for (var node in nodes) {
        if (!levels.containsKey(node.id) && node.parentId != null) {
          // parentId를 가진 노드 찾기
          final parent = nodes.firstWhere(
            (n) => n.nodeId == node.parentId,
            orElse: () => nodes.first,
          );

          if (levels.containsKey(parent.id)) {
            levels[node.id] = levels[parent.id]! + 1;
            changed = true;
          }
        }
      }
    }

    // 3. 레벨이 할당되지 않은 노드는 레벨 0으로
    for (var node in nodes) {
      levels.putIfAbsent(node.id, () => 0);
    }

    return levels;
  }

  /// 좌표 계산 (x, y가 null인 경우 자동 배치)
  Map<String, Offset> _calculatePositions(
    List<MindmapNodeModel> nodes,
    Map<String, int> levels,
  ) {
    final positions = <String, Offset>{};

    // 1. API에서 제공한 좌표가 있는지 확인
    final nodesWithPos = nodes.where((n) => n.x != null && n.y != null).toList();
    final nodesWithoutPos = nodes.where((n) => n.x == null || n.y == null).toList();

    // 2. 모든 노드에 좌표가 있는 경우: 루트를 캔버스 중앙으로 이동 + 스케일링
    if (nodesWithoutPos.isEmpty) {
      logger.i('✅ All nodes have API positions - centering root node with scaling');

      // 루트 노드 찾기
      final rootNode = nodes.firstWhere(
        (n) => levels[n.id] == 0,
        orElse: () => nodes.first,
      );

      // 루트 노드의 원래 위치
      final rootOriginalPos = Offset(rootNode.x!, rootNode.y!);
      logger.d('  📍 Root original position: (${rootOriginalPos.dx}, ${rootOriginalPos.dy})');

      // 스케일 팩터 (노드 간 거리를 늘리기 위한 배율)
      // 1.0 = 원본 크기, 1.5 = 1.5배 확대, 2.0 = 2배 확대
      const scaleFactor = 2.0;
      logger.d('  🔍 Scale factor: $scaleFactor');

      // 모든 노드를 루트 노드 기준으로 스케일링
      final scaledPositions = <String, Offset>{};
      for (var node in nodes) {
        if (node.x != null && node.y != null) {
          // 루트로부터의 상대 위치 계산
          final relativeX = node.x! - rootOriginalPos.dx;
          final relativeY = node.y! - rootOriginalPos.dy;

          // 스케일 적용
          final scaledRelativeX = relativeX * scaleFactor;
          final scaledRelativeY = relativeY * scaleFactor;

          // 스케일된 절대 좌표
          final scaledX = rootOriginalPos.dx + scaledRelativeX;
          final scaledY = rootOriginalPos.dy + scaledRelativeY;

          scaledPositions[node.id] = Offset(scaledX, scaledY);
        }
      }

      // 스케일된 좌표의 bounding box 계산
      double minX = double.infinity;
      double minY = double.infinity;
      double maxX = double.negativeInfinity;
      double maxY = double.negativeInfinity;

      for (var pos in scaledPositions.values) {
        if (pos.dx < minX) minX = pos.dx;
        if (pos.dy < minY) minY = pos.dy;
        if (pos.dx > maxX) maxX = pos.dx;
        if (pos.dy > maxY) maxY = pos.dy;
      }

      final contentWidth = maxX - minX;
      final contentHeight = maxY - minY;
      final padding = 2000.0; // 여유 공간

      final canvasWidth = contentWidth + padding * 2;
      final canvasHeight = contentHeight + padding * 2;
      final canvasCenterX = canvasWidth / 2;
      final canvasCenterY = canvasHeight / 2;

      logger.d('  📐 Canvas size: ${canvasWidth.toStringAsFixed(0)} x ${canvasHeight.toStringAsFixed(0)}');
      logger.d('  🎯 Canvas center: (${canvasCenterX.toStringAsFixed(1)}, ${canvasCenterY.toStringAsFixed(1)})');

      // 스케일된 루트 위치
      final scaledRootPos = scaledPositions[rootNode.id]!;

      // 루트를 캔버스 중앙으로 이동시키는 offset 계산
      final translateX = canvasCenterX - scaledRootPos.dx;
      final translateY = canvasCenterY - scaledRootPos.dy;

      logger.d('  ↔️ Translation: (${translateX.toStringAsFixed(1)}, ${translateY.toStringAsFixed(1)})');

      // 모든 노드를 translate
      for (var entry in scaledPositions.entries) {
        positions[entry.key] = Offset(
          entry.value.dx + translateX,
          entry.value.dy + translateY,
        );
      }

      return positions;
    }

    logger.i('📍 Auto-positioning ${nodesWithoutPos.length} nodes');

    // 레벨별 그룹화
    final nodesByLevel = <int, List<MindmapNodeModel>>{};
    for (var node in nodesWithoutPos) {
      final level = levels[node.id] ?? 0;
      nodesByLevel.putIfAbsent(level, () => []).add(node);
    }

    // 레벨 0 (루트 노드): 캔버스 중앙 기준 배치
    // 캔버스 크기가 10000 x 10000이므로 중앙은 (5000, 5000)
    final rootNodes = nodesByLevel[0] ?? [];
    const centerX = 5000.0;
    const centerY = 5000.0;
    for (var i = 0; i < rootNodes.length; i++) {
      // 루트가 여러 개면 중앙 기준으로 가로로 나열
      final offsetX = (i - rootNodes.length / 2) * 300.0;
      final rootPosition = Offset(centerX + offsetX, centerY);
      positions[rootNodes[i].id] = rootPosition;
      logger.d('  🎯 Root node ${i + 1}: positioned at (${rootPosition.dx}, ${rootPosition.dy})');
    }

    // 각 노드의 섹터(각도 범위) 저장: nodeId -> (startAngle, endAngle)
    final nodeSectors = <String, (double, double)>{};

    // 레벨 1 이상: 섹터 기반 배치
    for (var level = 1; level <= nodesByLevel.keys.reduce(math.max); level++) {
      final levelNodes = nodesByLevel[level] ?? [];

      for (var node in levelNodes) {
        if (positions.containsKey(node.id)) continue;

        // 부모 노드 찾기
        final parent = nodes.firstWhere(
          (n) => n.nodeId == node.parentId,
          orElse: () => nodes.first,
        );

        final parentPos = positions[parent.id] ?? const Offset(0, 0);

        // 형제 노드들 찾기
        final siblings = levelNodes.where((n) => n.parentId == node.parentId).toList();
        final siblingIndex = siblings.indexOf(node);
        final siblingCount = siblings.length;

        // 거리를 자식 개수에 따라 동적으로 계산
        // 기본 거리 + (자식 개수에 따른 추가 거리)
        final baseRadius = level * 150.0; // 기본 레벨별 거리
        final childCountBonus = (siblingCount - 1) * 20.0; // 자식 1개당 20px 추가
        final radius = baseRadius + childCountBonus;

        // 섹터 계산
        double startAngle, endAngle, angle;

        if (level == 1) {
          // 레벨 1: 루트의 직접 자식들 - 360도를 균등 분할
          final sectorSize = (2 * math.pi) / siblingCount;
          startAngle = siblingIndex * sectorSize;
          endAngle = startAngle + sectorSize;
          angle = (startAngle + endAngle) / 2; // 섹터 중앙
        } else {
          // 레벨 2 이상: 부모의 섹터 내에서 분할
          final parentSector = nodeSectors[parent.id];
          if (parentSector != null) {
            final parentStartAngle = parentSector.$1;
            final parentEndAngle = parentSector.$2;
            final parentSectorSize = parentEndAngle - parentStartAngle;
            final sectorSize = parentSectorSize / siblingCount;

            startAngle = parentStartAngle + (siblingIndex * sectorSize);
            endAngle = startAngle + sectorSize;
            angle = (startAngle + endAngle) / 2; // 섹터 중앙
          } else {
            // 부모 섹터 정보 없으면 기본값 사용
            final sectorSize = (2 * math.pi) / siblingCount;
            startAngle = siblingIndex * sectorSize;
            endAngle = startAngle + sectorSize;
            angle = (startAngle + endAngle) / 2;
          }
        }

        // 현재 노드의 섹터 저장 (자식들이 사용)
        nodeSectors[node.id] = (startAngle, endAngle);

        // 좌표 계산
        final x = parentPos.dx + radius * math.cos(angle);
        final y = parentPos.dy + radius * math.sin(angle);

        positions[node.id] = Offset(x, y);
      }
    }

    return positions;
  }

  /// Edge 생성 (parentId 기반)
  List<MindmapEdge> _generateEdges(List<MindmapNodeModel> nodes) {
    final edges = <MindmapEdge>[];

    for (var node in nodes) {
      if (node.parentId != null) {
        // parentId로 부모 노드 찾기
        final parent = nodes.firstWhere(
          (n) => n.nodeId == node.parentId,
          orElse: () => nodes.first,
        );

        edges.add(MindmapEdge(
          id: 'edge_${node.id}',
          fromNodeId: parent.id,
          toNodeId: node.id,
          color: Colors.grey.withOpacity(0.5),
          strokeWidth: 2.0,
        ));
      }
    }

    return edges;
  }

  @override
  Future<Either<Failure, MindmapCreationResponse>> createMindmapFromText(String text) async {
    try {
      logger.i('🔄 MindmapRepositoryImpl: Creating mindmap from text');

      final response = await apiDataSource.createMindmapFromText(text);

      logger.i('✅ MindmapRepositoryImpl: Successfully created mindmap - workspaceId: ${response.workspaceId}');

      return Right(response);
    } on ServerException catch (e) {
      logger.e('❌ MindmapRepositoryImpl: ServerException - ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e, stackTrace) {
      logger.e('❌ MindmapRepositoryImpl: Unexpected error - $e');
      logger.e('📍 StackTrace: $stackTrace');
      return Left(ServerFailure('마인드맵 생성 실패: $e'));
    }
  }
}
