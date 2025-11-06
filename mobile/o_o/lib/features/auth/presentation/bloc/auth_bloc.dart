import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// Auth BLoC
///
/// 인증 관련 비즈니스 로직을 처리합니다.
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository repository;

  AuthBloc({required this.repository}) : super(const AuthState.initial()) {
    // NOTE: authStateChanges 리스너 제거
    // Google Sign-In 성공만으로 인증 상태를 변경하지 않고,
    // 백엔드 인증까지 성공해야만 authenticated 상태로 변경

    on<AuthEvent>((event, emit) async {
      await event.when(
        signInWithGoogle: () => _onSignInWithGoogle(emit),
        signOut: () => _onSignOut(emit),
        checkAuthStatus: () => _onCheckAuthStatus(emit),
      );
    });
  }

  /// 구글 로그인 처리
  Future<void> _onSignInWithGoogle(Emitter<AuthState> emit) async {
    emit(const AuthState.loading());

    final result = await repository.signInWithGoogle();

    result.fold(
      (failure) => emit(AuthState.error(message: failure.message)),
      (user) => emit(AuthState.authenticated(user: user)),
    );
  }

  /// 로그아웃 처리
  Future<void> _onSignOut(Emitter<AuthState> emit) async {
    emit(const AuthState.loading());

    final result = await repository.signOut();

    result.fold(
      (failure) => emit(AuthState.error(message: failure.message)),
      (_) => emit(const AuthState.unauthenticated()),
    );
  }

  /// 현재 인증 상태 확인
  Future<void> _onCheckAuthStatus(Emitter<AuthState> emit) async {
    final result = await repository.getCurrentUser();

    result.fold(
      (failure) => emit(const AuthState.unauthenticated()),
      (user) {
        if (user != null) {
          emit(AuthState.authenticated(user: user));
        } else {
          emit(const AuthState.unauthenticated());
        }
      },
    );
  }
}
