import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/user_entity.dart';

part 'user_event.freezed.dart';

/// BLoC Event with Freezed
///
/// Event도 Union type으로 정의하면 타입 안전성이 높아집니다.
@freezed
class UserEvent with _$UserEvent {
  // Get single user by ID
  const factory UserEvent.getUser({
    required String id,
  }) = GetUserEvent;

  // Get all users
  const factory UserEvent.getUsers() = GetUsersEvent;

  // Create new user
  const factory UserEvent.createUser({
    required UserEntity user,
  }) = CreateUserEvent;

  // Update existing user
  const factory UserEvent.updateUser({
    required UserEntity user,
  }) = UpdateUserEvent;

  // Delete user
  const factory UserEvent.deleteUser({
    required String id,
  }) = DeleteUserEvent;

  // Refresh user list
  const factory UserEvent.refreshUsers() = RefreshUsersEvent;
}
