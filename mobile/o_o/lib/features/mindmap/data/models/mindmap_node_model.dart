import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/mindmap_node.dart';

part 'mindmap_node_model.freezed.dart';
part 'mindmap_node_model.g.dart';

/// Mindmap Node Model (API Response)
@freezed
class MindmapNodeModel with _$MindmapNodeModel {
  const factory MindmapNodeModel({
    required String id,
    required int nodeId,
    required int workspaceId,
    int? parentId,
    required String type,
    required String keyword,
    String? memo,
    required String analysisStatus,
    double? x,
    double? y,
    required String color,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _MindmapNodeModel;

  factory MindmapNodeModel.fromJson(Map<String, dynamic> json) =>
      _$MindmapNodeModelFromJson(json);

  const MindmapNodeModel._();

  /// Entity로 변환 (레벨 정보 필요)
  MindmapNode toEntity({
    required int level,
    required Offset position,
  }) {
    final contentType = _parseContentType(type);
    final contentUrl = _extractUrl(keyword, contentType);

    return MindmapNode(
      id: id,
      nodeId: nodeId,
      workspaceId: workspaceId,
      parentId: parentId,
      text: keyword,
      position: position,
      color: _parseColor(color),
      width: 120,
      height: 60,
      level: level,
      contentType: contentType,
      contentUrl: contentUrl,
      description: memo,
      analysisStatus: analysisStatus,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Color 파싱 (hex → Color)
  Color _parseColor(String hexColor) {
    try {
      final hex = hexColor.replaceFirst('#', '');
      if (hex.length == 6) {
        return Color(int.parse('0xFF$hex'));
      } else if (hex.length == 8) {
        return Color(int.parse('0x$hex'));
      }
      return Colors.blue; // 기본 색상
    } catch (e) {
      return Colors.blue; // 파싱 실패 시 기본 색상
    }
  }

  /// ContentType 파싱
  NodeContentType _parseContentType(String type) {
    switch (type.toLowerCase()) {
      case 'video':
        return NodeContentType.video;
      case 'image':
        return NodeContentType.image;
      case 'text':
      default:
        return NodeContentType.text;
    }
  }

  /// keyword에서 URL 추출
  String? _extractUrl(String keyword, NodeContentType type) {
    if (type == NodeContentType.text) return null;

    // URL 패턴 찾기
    final urlPattern = RegExp(
      r'https?://[^\s]+',
      caseSensitive: false,
    );
    final match = urlPattern.firstMatch(keyword);
    return match?.group(0);
  }
}
