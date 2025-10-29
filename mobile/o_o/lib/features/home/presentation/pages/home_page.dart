import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../widgets/circular_popo_button.dart';

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
        child: Stack(
          children: [
            // 메인 컨텐츠
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
                    // 로고
                    Image.asset('assets/images/logo.png', height: 32),
                    // 오른쪽 아이콘들
                    Row(
                      children: [
                        CircularButton(
                          onTap: () {},
                          containerSize: 38,
                          imageSize: 24,
                          blurRadius: 4,
                          image:'assets/images/menu_book.png',
                        ),
                        const SizedBox(width: 14),
                        CircularButton(
                          onTap: () {},
                          containerSize: 38,
                          imageSize: 24,
                          blurRadius: 4,
                          image: 'assets/images/popo4.png',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            SafeArea(
              bottom: false,
              child: // Popo 캐릭터 (하단에서 2/3 지점)
                  Align(
                alignment: const Alignment(0, -0.33),
                child: CircularButton(
                  onTap: () {},
                  containerSize: 220,
                  imageSize: 170,
                  blurRadius: 6,
                  image: 'assets/images/popo_record.png',
                  showAura: true,
                ),
              ),
            ),

            // 하단 BottomSheet (DraggableScrollableSheet)
            DraggableScrollableSheet(
              initialChildSize: 0.2,
              minChildSize: 0.1,
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
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          children: [
                            const Text(
                              '최근 마인드맵',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Container(
                              width: double.infinity,
                              height: 80,
                              decoration: BoxDecoration(
                                color: Colors.grey[100],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Center(
                                child: Icon(
                                  Icons.add,
                                  size: 32,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
