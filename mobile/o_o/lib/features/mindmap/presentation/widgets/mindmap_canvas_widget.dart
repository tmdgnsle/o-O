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

  /// 모든 노드를 포함하고 화면을 충분히 커버하는 캔버스 크기 계산
  Size _calculateCanvasSize(BuildContext context) {
    if (mindmap.nodes.isEmpty) {
      return const Size(2000, 2000);
    }

    // 화면 크기 가져오기
    final screenSize = MediaQuery.of(context).size;

    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = double.negativeInfinity;
    double maxY = double.negativeInfinity;

    // 모든 노드를 포함하는 영역 계산
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
    final padding = 200.0;
    final contentWidth = maxX - minX + padding * 2;
    final contentHeight = maxY - minY + padding * 2;

    // 최소한 화면 크기의 2배는 되도록 설정
    final width = contentWidth > screenSize.width * 2
        ? contentWidth
        : screenSize.width * 2;
    final height = contentHeight > screenSize.height * 2
        ? contentHeight
        : screenSize.height * 2;

    return Size(width, height);
  }
}
