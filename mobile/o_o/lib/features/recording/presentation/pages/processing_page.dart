import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

/// 녹음 후 마인드맵 생성 중 로딩 화면
class ProcessingPage extends StatefulWidget {
  /// 녹음 파일 경로 (추후 API 연동 시 사용)
  final String? recordingPath;

  const ProcessingPage({super.key, this.recordingPath});

  @override
  State<ProcessingPage> createState() => _ProcessingPageState();
}

class _ProcessingPageState extends State<ProcessingPage>
    with TickerProviderStateMixin {
  late AnimationController _rotationController; // fur_zip 회전용
  late AnimationController _floatingController; // popo_loading 왔다갔다용
  late Animation<double> _pulseAnimation;
  late Animation<double> _rotationAnimation;
  late Animation<double> _floatingY;

  int _currentMessageIndex = 0;
  Timer? _messageTimer;
  Timer? _processingTimer;

  final List<String> _loadingMessages = [
    '아이디어를 구슬에 담는 중...',
    '흩어진 아이디어 구슬을 모으는 중...',
    '아이디어 구슬을 가지런히 놓는 중...',
  ];

  @override
  void initState() {
    super.initState();

    // 회전 애니메이션 컨트롤러 (fur_zip용 - 계속 한 방향으로)
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat(); // 계속 회전

    // 위아래 애니메이션 컨트롤러 (popo_loading용 - 왔다갔다)
    _floatingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true); // 역방향 반복으로 부드럽게 왔다갔다

    // 펄스 애니메이션 (크기 변화)
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _floatingController, curve: Curves.easeInOut),
    );

    // 회전 애니메이션
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_rotationController);

    // 상하 움직임 애니메이션 (위아래로만)
    _floatingY = Tween<double>(begin: -10.0, end: 10.0).animate(
      CurvedAnimation(parent: _floatingController, curve: Curves.easeInOut),
    );

    // 메시지 변경 타이머 (2초마다)
    _messageTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (mounted) {
        setState(() {
          _currentMessageIndex =
              (_currentMessageIndex + 1) % _loadingMessages.length;
        });
      }
    });

    // 실제 처리 시뮬레이션 (8초 후 RecordListPage로 이동)
    // TODO: 실제 API 연동 시 이 부분을 API 호출로 교체
    _processingTimer = Timer(const Duration(seconds: 8), () {
      if (mounted) {
        context.go('/records');
      }
    });
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _floatingController.dispose();
    _messageTimer?.cancel();
    _processingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),

                // Popo 캐릭터 애니메이션 (fur_zip.png 위에 popo_loading.png)
                SizedBox(
                  width: 350,
                  height: 350,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // 아래 이미지: fur_zip.png - 빙글빙글 회전
                      AnimatedBuilder(
                        animation: _rotationController,
                        builder: (context, child) {
                          return Transform.rotate(
                            angle: _rotationAnimation.value * 2 * pi, // 완전히 회전
                            child: SizedBox(
                              width: 350,
                              height: 350,
                              child: Image.asset(
                                'assets/images/fur_zip.png',
                                fit: BoxFit.contain,
                              ),
                            ),
                          );
                        },
                      ),
                      // 위 이미지: popo_loading.png - 위아래로 두둥실 떠다니기
                      AnimatedBuilder(
                        animation: _floatingController,
                        builder: (context, child) {
                          return Transform.translate(
                            offset: Offset(
                              20, // 오른쪽으로 고정
                              _floatingY.value, // 위아래 움직임만
                            ),
                            child: SizedBox(
                              width: 200,
                              height: 200,
                              child: Image.asset(
                                'assets/images/popo_loading.png',
                                fit: BoxFit.contain,
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 60),

                // 로딩 메시지 (애니메이션으로 전환)
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 500),
                  transitionBuilder: (child, animation) {
                    return FadeTransition(
                      opacity: animation,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0, 0.3),
                          end: Offset.zero,
                        ).animate(animation),
                        child: child,
                      ),
                    );
                  },
                  child: Text(
                    _loadingMessages[_currentMessageIndex],
                    key: ValueKey<int>(_currentMessageIndex),
                    style: AppTextStyles.regular16.copyWith(
                      color: Colors.black.withValues(alpha: 0.6),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),

                const Spacer(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
