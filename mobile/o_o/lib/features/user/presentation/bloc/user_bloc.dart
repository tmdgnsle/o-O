import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecases/usecase.dart';
import '../../domain/usecases/get_user_info.dart';
import 'user_event.dart';
import 'user_state.dart';

/// User BLoC
class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserInfo getUserInfo;

  UserBloc({required this.getUserInfo}) : super(const UserState.initial()) {
    on<LoadUserInfo>(_onLoadUserInfo);
    on<RefreshUserInfo>(_onRefreshUserInfo);
  }

  Future<void> _onLoadUserInfo(
    LoadUserInfo event,
    Emitter<UserState> emit,
  ) async {
    emit(const UserState.loading());

    final result = await getUserInfo(NoParams());

    result.fold(
      (failure) => emit(UserState.error(message: '사용자 정보를 불러올 수 없습니다')),
      (user) => emit(UserState.loaded(user: user)),
    );
  }

  Future<void> _onRefreshUserInfo(
    RefreshUserInfo event,
    Emitter<UserState> emit,
  ) async {
    // Refresh without showing loading state
    final result = await getUserInfo(NoParams());

    result.fold(
      (failure) => emit(UserState.error(message: '사용자 정보를 불러올 수 없습니다')),
      (user) => emit(UserState.loaded(user: user)),
    );
  }
}
