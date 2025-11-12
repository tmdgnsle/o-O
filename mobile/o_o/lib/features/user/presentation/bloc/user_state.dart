import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../workspace/domain/entities/workspace_calendar_entity.dart';
import '../../domain/entities/user_entity.dart';

part 'user_state.freezed.dart';

/// User BLoC State
@freezed
class UserState with _$UserState {
  const factory UserState.initial() = UserInitial;
  const factory UserState.loading() = UserLoading;
  const factory UserState.loaded({
    required UserEntity user,
    List<WorkspaceCalendarItem>? keywords,
  }) = UserLoaded;
  const factory UserState.error({required String message}) = UserError;
}
