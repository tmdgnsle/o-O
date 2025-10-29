import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/user_entity.dart';

part 'user_state.freezed.dart';

/// BLoC State with Freezed
///
/// Freezed를 사용하면 State를 Union type으로 깔끔하게 정의할 수 있습니다.
/// when, map, maybeWhen, maybeMap 등의 메서드가 자동 생성됩니다.
@freezed
class UserState with _$UserState {
  // Initial state
  const factory UserState.initial() = UserInitial;

  // Loading state
  const factory UserState.loading() = UserLoading;

  // Success state with single user
  const factory UserState.loaded({
    required UserEntity user,
  }) = UserLoaded;

  // Success state with list of users
  const factory UserState.listLoaded({
    required List<UserEntity> users,
  }) = UserListLoaded;

  // Error state
  const factory UserState.error({
    required String message,
    String? errorCode,
  }) = UserError;

  // Creating state (for create/update operations)
  const factory UserState.creating() = UserCreating;

  // Created state
  const factory UserState.created({
    required UserEntity user,
  }) = UserCreated;
}
