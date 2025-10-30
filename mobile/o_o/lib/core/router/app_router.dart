import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/mindmap/presentation/pages/mindmap_page.dart';
import '../../features/record/presentation/pages/record_list_page.dart';
import '../../features/user/presentation/pages/my_page.dart';
import '../../features/user/presentation/pages/user_page.dart';

/// GoRouter 설정
///
/// Clean Architecture에서 라우팅은 core 계층에 위치합니다.
/// 각 피처의 페이지를 임포트하여 라우트를 정의합니다.
class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/users',
        name: 'users',
        builder: (context, state) => const UserPage(),
      ),
      GoRoute(
        path: '/records',
        name: 'records',
        builder: (context, state) => const RecordListPage(),
      ),
      GoRoute(
        path: '/mypage',
        name: 'mypage',
        builder: (context, state) => const MyPage(),
      ),
      GoRoute(
        path: '/mindmap',
        name: 'mindmap',
        builder: (context, state) {
          // extra로 전달된 Map 데이터를 파싱
          final data = state.extra as Map<String, dynamic>?;
          return MindmapPage(
            title: data?['title'] as String? ?? '마인드맵',
            imagePath: data?['imagePath'] as String? ?? '',
            mindmapId: data?['mindmapId'] as String?,
          );
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
}
