import 'package:flutter/material.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../domain/entities/mindmap_node.dart';

/// 마인드맵 노드 위젯
class MindmapNodeWidget extends StatelessWidget {
  final MindmapNode node;
  final VoidCallback? onTap;

  const MindmapNodeWidget({
    super.key,
    required this.node,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // 노드 크기 (원형이므로 width == height)
    final size = node.width;
    final glowSize = size * 1.5;

    return Positioned(
      // position은 노드의 중심 좌표이므로, 왼쪽 상단 모서리는 중심에서 glow 크기의 절반만큼 뺀 위치
      left: node.position.dx - glowSize / 2,
      top: node.position.dy - glowSize / 2,
      child: GestureDetector(
        onTap: onTap,
        child: SizedBox(
          width: glowSize,
          height: glowSize,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Radial gradient (Figma 설정: 0% ~ 68% 같은 색, 100% 투명)
              Container(
                width: glowSize,
                height: glowSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      node.color,
                      node.color,
                      node.color.withOpacity(0.0),
                    ],
                    stops: const [0.0, 0.68, 1.0],
                  ),
                ),
              ),
              // 실제 노드 (원형)
              Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: node.color,
                ),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text(
                      node.text,
                      style: _getTextStyle(node.level),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// 레벨에 따라 텍스트 스타일 반환
  TextStyle _getTextStyle(int level) {
    switch (level) {
      case 0:
        // 중심 노드
        return AppTextStyles.semiBold18.copyWith(
          color: Colors.black87,
          fontWeight: FontWeight.w700,
        );
      case 1:
        // 1차 노드
        return AppTextStyles.semiBold16.copyWith(
          color: Colors.black87,
        );
      default:
        // 2차 이상 노드
        return AppTextStyles.medium14.copyWith(
          color: Colors.black87,
        );
    }
  }
}
