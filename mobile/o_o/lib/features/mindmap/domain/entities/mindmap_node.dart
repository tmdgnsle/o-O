import 'package:flutter/material.dart';

/// 마인드맵 노드
///
/// 마인드맵의 각 노드를 나타냅니다.
class MindmapNode {
  /// 노드 ID
  final String id;

  /// 노드 텍스트
  final String text;

  /// 노드 위치 (노드 중심의 캔버스 좌표)
  final Offset position;

  /// 노드 배경 색상
  final Color color;

  /// 노드 너비
  final double width;

  /// 노드 높이
  final double height;

  /// 노드 레벨 (0: 중심, 1: 1차 자식, 2: 2차 자식...)
  final int level;

  const MindmapNode({
    required this.id,
    required this.text,
    required this.position,
    required this.color,
    this.width = 120,
    this.height = 60,
    this.level = 0,
  });

  /// 노드의 중심점을 반환합니다
  /// position이 이미 노드의 중심 좌표입니다
  Offset get center => position;

  MindmapNode copyWith({
    String? id,
    String? text,
    Offset? position,
    Color? color,
    double? width,
    double? height,
    int? level,
  }) {
    return MindmapNode(
      id: id ?? this.id,
      text: text ?? this.text,
      position: position ?? this.position,
      color: color ?? this.color,
      width: width ?? this.width,
      height: height ?? this.height,
      level: level ?? this.level,
    );
  }
}
