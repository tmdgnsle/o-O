import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flame/game.dart';
import 'package:flame_forge2d/flame_forge2d.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

/// 키워드 구슬 데이터
class KeywordMarble {
  final String keyword;
  final int weight;

  KeywordMarble({required this.keyword, required this.weight});
}

/// 구슬 물리 컴포넌트
class MarbleComponent extends BodyComponent {
  final String keyword;
  final double radius;
  final Color color;
  final Vector2 initialPosition;
  final ui.Image marbleImage;

  MarbleComponent({
    required this.keyword,
    required this.radius,
    required this.initialPosition,
    required this.marbleImage,
    this.color = Colors.white,
  }) : super(
          priority: 1,
        );

  @override
  Body createBody() {
    final shape = CircleShape()..radius = radius;

    final fixtureDef = FixtureDef(
      shape,
      restitution: 0.2, // 반발력 약간 증가 (살짝 튐)
      density: 3.0, // 밀도 더 높게 (더 무거운 구슬)
      friction: 0.5, // 마찰력 중간 (적당히 미끄러짐)
    );

    final bodyDef = BodyDef(
      position: initialPosition,
      type: BodyType.dynamic,
      angularDamping: 0.8, // 회전 감쇠
      linearDamping: 0.3, // 선형 감쇠
      bullet: true, // CCD 활성화 (빠른 충돌 감지)
      allowSleep: false, // 구슬이 sleep 모드로 전환되지 않도록
    );

    return world.createBody(bodyDef)..createFixture(fixtureDef);
  }

  @override
  void render(Canvas canvas) {
    // marble.png 이미지 그리기
    final size = radius * 2;
    final srcRect = Rect.fromLTWH(
      0,
      0,
      marbleImage.width.toDouble(),
      marbleImage.height.toDouble(),
    );
    final dstRect = Rect.fromLTWH(
      -radius,
      -radius,
      size,
      size,
    );

    // 원본 이미지 사용 (색상 필터 제거)
    final paint = Paint()
      ..filterQuality = FilterQuality.high
      ..isAntiAlias = true;

    canvas.drawImageRect(marbleImage, srcRect, dstRect, paint);

    // 키워드 텍스트
    final textPainter = TextPainter(
      text: TextSpan(
        text: keyword,
        style: TextStyle(
          color: AppColors.semi_black,
          fontSize: (radius * 0.35).clamp(10, 18),
          fontWeight: FontWeight.bold,
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
      maxLines: 2,
    );

    textPainter.layout(maxWidth: radius * 1.5);
    textPainter.paint(
      canvas,
      Offset(-textPainter.width / 2, -textPainter.height / 2),
    );
  }
}

/// 구슬 물리 게임
class MarblePhysicsGame extends Forge2DGame {
  final List<KeywordMarble> marbles;
  final Size screenSize;

  MarblePhysicsGame({required this.marbles, required this.screenSize})
      : super(
          gravity: Vector2(0, 500), // 중력 낮춤 (천천히 떨어지도록)
        );

  @override
  Color backgroundColor() => const Color(0x00000000); // 투명 배경

  @override
  Future<void> onLoad() async {
    await super.onLoad();

    // marble.png 이미지 미리 로드
    final marbleImage = await images.load('marble.png');

    // 카메라 설정 - 픽셀을 월드 좌표로 직접 매핑
    camera.viewfinder.zoom = 1;
    camera.viewfinder.position = Vector2(screenSize.width / 2, screenSize.height / 2);

    final random = Random();
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.pink,
      Colors.teal,
    ];

    // 바닥 생성 (화면 맨 아래)
    _createGround();

    // 벽 생성
    _createWalls();

    // 구슬들 생성
    for (int i = 0; i < marbles.length; i++) {
      final marble = marbles[i];
      final radius = _getMarbleRadius(marble.weight, marbles.length);

      // 화면 중앙에서 랜덤 위치로 떨어뜨림
      final x = screenSize.width * 0.2 + random.nextDouble() * (screenSize.width * 0.6);
      final y = -100 - (i * 120.0); // 구슬이 작아져서 간격 조정

      final marbleComponent = MarbleComponent(
        keyword: marble.keyword,
        radius: radius,
        initialPosition: Vector2(x, y),
        marbleImage: marbleImage,
        color: colors[i % colors.length],
      );

      await add(marbleComponent);
    }
  }

  /// 바닥 생성
  void _createGround() {
    // 화면 맨 아래에서 20픽셀 위
    final groundY = screenSize.height - 20;
    final groundBody = world.createBody(BodyDef(position: Vector2(screenSize.width / 2, groundY)));

    final shape = EdgeShape()
      ..set(Vector2(-screenSize.width, 0), Vector2(screenSize.width, 0));

    groundBody.createFixture(FixtureDef(shape, friction: 0.8));
  }

  /// 벽 생성
  void _createWalls() {
    final centerY = screenSize.height / 2;

    // 왼쪽 벽 (화면 왼쪽 가장자리)
    final leftWall = world.createBody(BodyDef(position: Vector2(20, centerY)));
    final leftShape = EdgeShape()..set(Vector2(0, -screenSize.height), Vector2(0, screenSize.height));
    leftWall.createFixture(FixtureDef(leftShape, friction: 0.3, restitution: 0.2));

    // 오른쪽 벽 (화면 오른쪽 가장자리)
    final rightWall = world.createBody(BodyDef(position: Vector2(screenSize.width - 20, centerY)));
    final rightShape = EdgeShape()..set(Vector2(0, -screenSize.height), Vector2(0, screenSize.height));
    rightWall.createFixture(FixtureDef(rightShape, friction: 0.3, restitution: 0.2));
  }

  /// 가중치에 따른 구슬 반지름 계산 (픽셀 단위)
  double _getMarbleRadius(int weight, int totalMarbles) {
    final baseSize = totalMarbles <= 3 ? 40.0 : (totalMarbles <= 6 ? 35.0 : 30.0);
    final sizeMultiplier = totalMarbles <= 3 ? 6.0 : (totalMarbles <= 6 ? 5.0 : 4.0);

    return baseSize + (weight * sizeMultiplier);
  }
}

/// 마이페이지
class MyPage extends StatefulWidget {
  const MyPage({super.key});

  @override
  State<MyPage> createState() => _MyPageState();
}

class _MyPageState extends State<MyPage> {
  late List<KeywordMarble> marbles;
  MarblePhysicsGame? game;
  final Random random = Random();

  @override
  void initState() {
    super.initState();
    marbles = _generateDummyData();
  }

  /// 더미 데이터 생성
  List<KeywordMarble> _generateDummyData() {
    final keywords = [
      '쓰레기통',
      '공항',
      '중국어',
      '유아학습\n플랫폼',
      '완전탐색',
      '쓰레기통',
    ];

    return keywords.map((keyword) {
      // 가중치 1-10 사이 랜덤
      final weight = random.nextInt(10) + 1;
      return KeywordMarble(keyword: keyword, weight: weight);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final topPadding = mediaQuery.padding.top;
    final screenSize = mediaQuery.size;

    // 게임 인스턴스가 없으면 생성
    game ??= MarblePhysicsGame(
      marbles: marbles,
      screenSize: screenSize,
    );

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: Stack(
          children: [
            // 물리 시뮬레이션 게임 위젯
            Positioned.fill(
              child: GameWidget(game: game!),
            ),
            // 상단 컨텐츠
            Positioned(
              top: topPadding + 16,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  // 헤더 - 로고만
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: GestureDetector(
                        onTap: () => context.go('/'),
                        child: Image.asset(
                          'assets/images/logo.png',
                          height: 32,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  // 프로필 이미지 (큰 원형)
                  Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 20,
                          spreadRadius: 5,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Image.asset(
                          'assets/images/popo4.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  // 사용자 이름
                  Text(
                    '한동근',
                    style: AppTextStyles.semiBold20.copyWith(
                      color: AppColors.semi_black,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // 이메일
                  Text(
                    'dongri@gmail.com',
                    style: AppTextStyles.regular15.copyWith(
                      color: AppColors.black_gray,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
