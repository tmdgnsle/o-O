import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/user_repository.dart';
import 'user_event.dart';
import 'user_state.dart';

/// User BLoC using Freezed events and states
class UserBloc extends Bloc<UserEvent, UserState> {
  final UserRepository repository;

  UserBloc({required this.repository}) : super(const UserState.initial()) {
    // Freezed의 when을 사용하여 각 event를 처리
    on<UserEvent>((event, emit) async {
      await event.when(
        getUser: (id) => _onGetUser(id, emit),
        getUsers: () => _onGetUsers(emit),
        createUser: (user) => _onCreateUser(user, emit),
        updateUser: (user) => _onUpdateUser(user, emit),
        deleteUser: (id) => _onDeleteUser(id, emit),
        refreshUsers: () => _onRefreshUsers(emit),
      );
    });
  }

  Future<void> _onGetUser(String id, Emitter<UserState> emit) async {
    emit(const UserState.loading());

    final result = await repository.getUser(id);

    result.fold(
      (failure) => emit(UserState.error(message: failure.message)),
      (user) => emit(UserState.loaded(user: user)),
    );
  }

  Future<void> _onGetUsers(Emitter<UserState> emit) async {
    emit(const UserState.loading());

    final result = await repository.getUsers();

    result.fold(
      (failure) => emit(UserState.error(message: failure.message)),
      (users) => emit(UserState.listLoaded(users: users)),
    );
  }

  Future<void> _onCreateUser(UserEntity user, Emitter<UserState> emit) async {
    emit(const UserState.creating());

    final result = await repository.createUser(user);

    result.fold(
      (failure) => emit(UserState.error(message: failure.message)),
      (createdUser) => emit(UserState.created(user: createdUser)),
    );
  }

  Future<void> _onUpdateUser(UserEntity user, Emitter<UserState> emit) async {
    emit(const UserState.loading());

    final result = await repository.updateUser(user);

    result.fold(
      (failure) => emit(UserState.error(message: failure.message)),
      (updatedUser) => emit(UserState.loaded(user: updatedUser)),
    );
  }

  Future<void> _onDeleteUser(String id, Emitter<UserState> emit) async {
    emit(const UserState.loading());

    final result = await repository.deleteUser(id);

    result.fold(
      (failure) => emit(UserState.error(message: failure.message)),
      (_) => emit(const UserState.initial()),
    );
  }

  Future<void> _onRefreshUsers(Emitter<UserState> emit) async {
    // Refresh without showing loading state
    final result = await repository.getUsers();

    result.fold(
      (failure) => emit(UserState.error(message: failure.message)),
      (users) => emit(UserState.listLoaded(users: users)),
    );
  }
}
