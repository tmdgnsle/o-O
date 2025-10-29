import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// 로그인 페이지
///
/// 구글 로그인 버튼만 있는 심플한 로그인 화면입니다.
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          state.when(
            initial: () {},
            loading: () {},
            authenticated: (user) {
              // 로그인 성공 시 홈으로 이동
              context.go('/');
            },
            unauthenticated: () {},
            error: (message) {
              // 에러 메시지 표시
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(message),
                  backgroundColor: Colors.red,
                ),
              );
            },
          );
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 로고 또는 앱 이름
                  const Icon(
                    Icons.remove_red_eye_outlined,
                    size: 80,
                    color: Colors.deepPurple,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'o_o',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.deepPurple,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Welcome!',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  const SizedBox(height: 80),

                  // 구글 로그인 버튼
                  ElevatedButton.icon(
                    onPressed: isLoading
                        ? null
                        : () {
                            context
                                .read<AuthBloc>()
                                .add(const AuthEvent.signInWithGoogle());
                          },
                    icon: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Image.asset(
                            'assets/google_logo.png',
                            width: 24,
                            height: 24,
                            errorBuilder: (context, error, stackTrace) {
                              // 이미지 없을 때 G 아이콘 표시
                              return const Icon(Icons.g_mobiledata, size: 24);
                            },
                          ),
                    label: Text(
                      isLoading ? 'Signing in...' : 'Sign in with Google',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black87,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: BorderSide(color: Colors.grey[300]!),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 안내 문구
                  Text(
                    'By signing in, you agree to our Terms of Service and Privacy Policy',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
