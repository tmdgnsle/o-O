import 'package:flutter/material.dart';
import '../../domain/entities/mindmap.dart';
import 'mindmap_edge_painter.dart';
import 'mindmap_node_widget.dart';

/// 마인드맵 캔버스 위젯
///
/// 마인드맵의 노드와 엣지를 모두 렌더링합니다.
class MindmapCanvasWidget extends StatelessWidget {
  final Mindmap mindmap;

  const MindmapCanvasWidget({
    super.key,
    required this.mindmap,
  });

  @override
  Widget build(BuildContext context) {
    // 캔버스 크기를 계산
    final canvasSize = _calculateCanvasSize(context);

    return SizedBox(
      width: canvasSize.width,
      height: canvasSize.height,
      child: Stack(
        children: [
          // 엣지(연결선) 그리기
          CustomPaint(
            size: canvasSize,
            painter: MindmapEdgePainter(mindmap: mindmap),
          ),
          // 노드들 배치
          ...mindmap.nodes.map(
            (node) => MindmapNodeWidget(
              node: node,
              onTap: () {
                // TODO: 노드 클릭 이벤트 처리
                debugPrint('Node tapped: ${node.text}');
              },
            ),
          ),
        ],
      ),
    );
  }

  /// 캔버스 크기 계산
  Size _calculateCanvasSize(BuildContext context) {
    if (mindmap.nodes.isEmpty) {
      return const Size(10000, 10000);
    }

    // 모든 노드를 포함하는 bounding box 계산
    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = double.negativeInfinity;
    double maxY = double.negativeInfinity;

    for (final node in mindmap.nodes) {
      final nodeLeft = node.position.dx - node.width / 2;
      final nodeTop = node.position.dy - node.height / 2;
      final nodeRight = node.position.dx + node.width / 2;
      final nodeBottom = node.position.dy + node.height / 2;

      if (nodeLeft < minX) minX = nodeLeft;
      if (nodeTop < minY) minY = nodeTop;
      if (nodeRight > maxX) maxX = nodeRight;
      if (nodeBottom > maxY) maxY = nodeBottom;
    }

    // 여유 공간 추가
    final padding = 2000.0;
    final width = maxX - minX + padding * 2;
    final height = maxY - minY + padding * 2;

    // 최소 크기 보장
    final minSize = 5000.0;
    return Size(
      width < minSize ? minSize : width,
      height < minSize ? minSize : height,
    );
  }
}
