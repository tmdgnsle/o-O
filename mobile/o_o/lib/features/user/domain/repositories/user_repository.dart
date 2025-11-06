import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';

/// User repository interface
abstract class UserRepository {
  Future<Either<Failure, UserEntity>> getUser(String id);
  Future<Either<Failure, List<UserEntity>>> getUsers();
  Future<Either<Failure, UserEntity>> createUser(UserEntity user);
  Future<Either<Failure, UserEntity>> updateUser(UserEntity user);
  Future<Either<Failure, void>> deleteUser(String id);
}
