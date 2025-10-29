import 'dart:async';

import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';

/// Mock AuthRepository for development
///
/// 실제 Google Sign-In API가 준비되기 전에 사용하는 Mock Repository입니다.
/// 더미 데이터를 반환하여 UI와 BLoC을 테스트할 수 있습니다.
class AuthRepositoryMock implements AuthRepository {
  // 현재 로그인된 사용자 (메모리에만 저장)
  AuthUser? _currentUser;

  // 인증 상태 스트림 컨트롤러
  final _authStateController = StreamController<AuthUser?>.broadcast();

  @override
  Stream<AuthUser?> get authStateChanges => _authStateController.stream;

  @override
  Future<Either<Failure, AuthUser>> signInWithGoogle() async {
    // 구글 로그인 시뮬레이션
    await Future.delayed(const Duration(seconds: 2));

    // 더미 사용자 생성
    final user = AuthUser(
      id: 'mock_user_${DateTime.now().millisecondsSinceEpoch}',
      email: 'test@example.com',
      name: 'Test User',
      photoUrl: 'https://via.placeholder.com/150',
      provider: 'google',
    );

    _currentUser = user;
    _authStateController.add(user);

    return Right(user);
  }

  @override
  Future<Either<Failure, void>> signOut() async {
    // 로그아웃 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 500));

    _currentUser = null;
    _authStateController.add(null);

    return const Right(null);
  }

  @override
  Future<Either<Failure, AuthUser?>> getCurrentUser() async {
    // 현재 사용자 가져오기 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 300));

    return Right(_currentUser);
  }

  void dispose() {
    _authStateController.close();
  }
}
