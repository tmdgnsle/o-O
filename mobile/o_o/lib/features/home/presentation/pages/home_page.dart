import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:o_o/core/constants/app_colors.dart';

import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../recording/presentation/bloc/recording_bloc.dart';
import '../../../recording/presentation/bloc/recording_event.dart';
import '../../../recording/presentation/bloc/recording_state.dart';
import '../widgets/animated_circular_button.dart';
import '../widgets/circular_popo_button.dart';
import '../widgets/mindmap_card.dart';

/// 홈 페이지
class HomePage extends StatelessWidget {
  const HomePage({super.key});

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
        child: BlocBuilder<RecordingBloc, RecordingState>(
          builder: (context, recordingState) {
            final isRecording = recordingState is RecordingInProgress;

            return Stack(
              children: [
                // 상단 헤더
                SafeArea(
                  bottom: false,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20.0,
                      vertical: 16.0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // 로고 - 항상 보임
                        Image.asset('assets/images/logo.png', height: 32),
                        // 오른쪽 아이콘들 - 녹음 중에는 사라짐
                        AnimatedOpacity(
                          opacity: isRecording ? 0.0 : 1.0,
                          duration: const Duration(milliseconds: 300),
                          child: IgnorePointer(
                            ignoring: isRecording,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                CircularButton(
                                  onTap: () {},
                                  containerSize: 38,
                                  imageSize: 24,
                                  blurRadius: 4,
                                  image: 'assets/images/menu_book.png',
                                ),
                                const SizedBox(width: 8),
                                CircularButton(
                                  onTap: () {},
                                  containerSize: 38,
                                  imageSize: 24,
                                  blurRadius: 4,
                                  image: 'assets/images/popo4.png',
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Popo 캐릭터 (하단에서 2/3 지점)
                SafeArea(
                  bottom: false,
                  child: Align(
                    alignment: const Alignment(0, -0.33),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // 캐릭터 버튼 - AnimatedSwitcher로 부드러운 전환
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          transitionBuilder: (child, animation) {
                            return FadeTransition(
                              opacity: animation,
                              child: child,
                            );
                          },
                          child:
                              isRecording
                                  ? AnimatedCircularButton(
                                    key: const ValueKey('recording'),
                                    onTap:
                                        () => context.read<RecordingBloc>().add(
                                          const RecordingEvent.toggle(),
                                        ),
                                    containerSize: 220,
                                    imageSize: 170,
                                    blurRadius: 6,
                                    image: 'assets/images/popo_listen.png',
                                  )
                                  : CircularButton(
                                    key: const ValueKey('idle'),
                                    onTap:
                                        () => context.read<RecordingBloc>().add(
                                          const RecordingEvent.toggle(),
                                        ),
                                    containerSize: 220,
                                    imageSize: 170,
                                    blurRadius: 6,
                                    image: 'assets/images/popo_record.png',
                                    showAura: true,
                                  ),
                        ),
                        // 녹음 중일 때 텍스트 표시
                        AnimatedSize(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                          child:
                              isRecording
                                  ? Column(
                                    children: [
                                      const SizedBox(height: 12),
                                      Text(
                                        '지금 떠오르는 아이디어를',
                                        style: AppTextStyles.semiBold20
                                            .copyWith(
                                              color: AppColors.semi_black,
                                            ),
                                        textAlign: TextAlign.center,
                                      ),
                                      Text(
                                        '말해보세요.',
                                        style: AppTextStyles.semiBold20
                                            .copyWith(
                                              color: AppColors.semi_black,
                                            ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  )
                                  : const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                ),

                // 하단 BottomSheet (DraggableScrollableSheet)
                AnimatedSlide(
                  offset: isRecording ? const Offset(0, 1) : Offset.zero,
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOut,
                  child: DraggableScrollableSheet(
                    initialChildSize: 0.2,
                    minChildSize: 0.2,
                    maxChildSize: 0.9,
                    builder: (context, scrollController) {
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(50),
                            topRight: Radius.circular(50),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.11),
                              blurRadius: 7.2,
                              offset: const Offset(0, -4),
                              spreadRadius: 0,
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            // 드래그 핸들
                            Container(
                              margin: const EdgeInsets.only(top: 12, bottom: 8),
                              width: 40,
                              height: 4,
                              decoration: BoxDecoration(
                                color: Colors.grey[300],
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            // 컨텐츠
                            Expanded(
                              child: ListView(
                                controller: scrollController,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                ),
                                children: [
                                  const SizedBox(height: 24),
                                  Text(
                                    '최근 마인드맵',
                                    style: AppTextStyles.semiBold20.copyWith(
                                      color: AppColors.semi_black,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  // 마인드맵 카드 리스트
                                  MindmapCard(
                                    title: '알고리즘 싫어하는 마인드맵',
                                    imagePath:
                                        'assets/images/dummy_mindmap.png',
                                    onTap: () {
                                      // TODO: 마인드맵 상세 페이지로 이동
                                    },
                                  ),
                                  MindmapCard(
                                    title: '알고리즘 싫어하는 마인드맵',
                                    imagePath:
                                        'assets/images/dummy_mindmap.png',
                                    onTap: () {
                                      // TODO: 마인드맵 상세 페이지로 이동
                                    },
                                  ),
                                  MindmapCard(
                                    title: '알고리즘 싫어하는 마인드맵',
                                    imagePath:
                                        'assets/images/dummy_mindmap.png',
                                    onTap: () {
                                      // TODO: 마인드맵 상세 페이지로 이동
                                    },
                                  ),
                                  const SizedBox(height: 50),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
