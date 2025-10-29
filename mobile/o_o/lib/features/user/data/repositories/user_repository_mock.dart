import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/user_repository.dart';

/// Mock UserRepository for development
///
/// 실제 API가 준비되기 전에 사용하는 Mock Repository입니다.
/// 더미 데이터를 반환하여 UI와 BLoC을 테스트할 수 있습니다.
class UserRepositoryMock implements UserRepository {
  // 더미 사용자 목록
  final List<UserEntity> _users = [
    const UserEntity(
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: null,
      isActive: true,
    ),
    const UserEntity(
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: null,
      isActive: true,
    ),
    const UserEntity(
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      avatarUrl: null,
      isActive: false,
    ),
  ];

  @override
  Future<Either<Failure, UserEntity>> getUser(String id) async {
    // API 호출 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 500));

    try {
      final user = _users.firstWhere((u) => u.id == id);
      return Right(user);
    } catch (e) {
      return Left(ServerFailure('User not found: $id'));
    }
  }

  @override
  Future<Either<Failure, List<UserEntity>>> getUsers() async {
    // API 호출 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 800));

    return Right(_users);
  }

  @override
  Future<Either<Failure, UserEntity>> createUser(UserEntity user) async {
    // API 호출 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 600));

    final newUser = user.copyWith(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
    );
    _users.add(newUser);

    return Right(newUser);
  }

  @override
  Future<Either<Failure, UserEntity>> updateUser(UserEntity user) async {
    // API 호출 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 500));

    final index = _users.indexWhere((u) => u.id == user.id);
    if (index != -1) {
      _users[index] = user;
      return Right(user);
    } else {
      return Left(ServerFailure('User not found: ${user.id}'));
    }
  }

  @override
  Future<Either<Failure, void>> deleteUser(String id) async {
    // API 호출 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 500));

    final index = _users.indexWhere((u) => u.id == id);
    if (index != -1) {
      _users.removeAt(index);
      return const Right(null);
    } else {
      return Left(ServerFailure('User not found: $id'));
    }
  }
}
