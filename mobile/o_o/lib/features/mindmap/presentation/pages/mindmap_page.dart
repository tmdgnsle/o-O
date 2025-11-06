import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../domain/entities/dummy_mindmap_data.dart';
import '../../domain/entities/mindmap.dart';
import '../widgets/mindmap_canvas_widget.dart';

/// 점박이 배경 Painter
class _DottedBackgroundPainter extends CustomPainter {
  final Color dotColor;
  final double dotRadius;
  final double spacing;

  _DottedBackgroundPainter({
    required this.dotColor,
    required this.dotRadius,
    required this.spacing,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = dotColor
      ..style = PaintingStyle.fill;

    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), dotRadius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DottedBackgroundPainter oldDelegate) {
    return oldDelegate.dotColor != dotColor ||
        oldDelegate.dotRadius != dotRadius ||
        oldDelegate.spacing != spacing;
  }
}

/// 마인드맵 상세 페이지
///
/// 마인드맵을 인터랙티브한 캔버스로 확대/축소하며 볼 수 있는 페이지입니다.
class MindmapPage extends StatefulWidget {
  /// 마인드맵 제목
  final String title;

  /// 마인드맵 이미지 경로 (assets 또는 네트워크 URL)
  final String imagePath;

  /// 마인드맵 ID (optional, 추후 API 연동 시 사용)
  final String? mindmapId;

  const MindmapPage({
    super.key,
    required this.title,
    required this.imagePath,
    this.mindmapId,
  });

  @override
  State<MindmapPage> createState() => _MindmapPageState();
}

class _MindmapPageState extends State<MindmapPage> {
  final TransformationController _transformationController =
      TransformationController();

  Mindmap? _mindmap;

  @override
  void initState() {
    super.initState();
    _loadMindmap();
  }

  void _loadMindmap() {
    if (widget.mindmapId != null) {
      _mindmap = DummyMindmapData.getMindmapById(widget.mindmapId!);
    }
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  void _resetZoom() {
    _transformationController.value = Matrix4.identity();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // 상단 헤더
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 20.0,
                vertical: 16.0,
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // 제목 (중앙)
                  Center(
                    child: Text(
                      widget.title,
                      style: AppTextStyles.semiBold20.copyWith(
                        color: AppColors.semi_black,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  // X 버튼 (오른쪽)
                  Positioned(
                    right: 0,
                    child: GestureDetector(
                      onTap: () => context.pop(),
                      child: const Icon(
                        Icons.close,
                        size: 24,
                        color: AppColors.semi_black,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 마인드맵 캔버스 영역 (확대/축소 가능)
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return Stack(
                    children: [
                      // 전체 화면을 덮는 점박이 배경
                      CustomPaint(
                        size: Size(constraints.maxWidth, constraints.maxHeight),
                        painter: _DottedBackgroundPainter(
                          dotColor: Colors.grey.withOpacity(0.3),
                          dotRadius: 1.5,
                          spacing: 20.0,
                        ),
                      ),
                      // InteractiveViewer
                      InteractiveViewer(
                        transformationController: _transformationController,
                        minScale: 0.5,
                        maxScale: 3.0,
                        boundaryMargin: const EdgeInsets.all(80),
                        panEnabled: true,
                        scaleEnabled: true,
                        constrained: false,
                        child: Center(
                          child: _buildMindmapContent(),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 마인드맵 컨텐츠를 빌드합니다
  ///
  /// mindmapId가 있으면 캔버스로, 없으면 이미지로 표시합니다.
  Widget _buildMindmapContent() {
    // 마인드맵 데이터가 있으면 캔버스로 렌더링
    if (_mindmap != null) {
      return MindmapCanvasWidget(mindmap: _mindmap!);
    }

    // 폴백: 이미지로 표시
    return _buildMindmapImage();
  }

  /// 마인드맵 이미지를 빌드합니다 (폴백용)
  ///
  /// assets 이미지와 네트워크 이미지를 모두 지원합니다.
  Widget _buildMindmapImage() {
    if (widget.imagePath.isEmpty) {
      return _buildErrorWidget();
    }

    final isNetworkImage = widget.imagePath.startsWith('http://') ||
        widget.imagePath.startsWith('https://');

    if (isNetworkImage) {
      return Image.network(
        widget.imagePath,
        fit: BoxFit.contain,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Center(
            child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded /
                      loadingProgress.expectedTotalBytes!
                  : null,
              color: AppColors.deep_blue,
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) {
          return _buildErrorWidget();
        },
      );
    } else {
      return Image.asset(
        widget.imagePath,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          return _buildErrorWidget();
        },
      );
    }
  }

  /// 에러 위젯
  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            '마인드맵을 불러올 수 없습니다',
            style: AppTextStyles.regular16.copyWith(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
