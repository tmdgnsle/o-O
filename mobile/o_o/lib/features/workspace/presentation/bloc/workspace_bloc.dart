import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecases/usecase.dart';
import '../../domain/usecases/get_workspaces.dart';
import 'workspace_event.dart';
import 'workspace_state.dart';

/// Workspace BLoC
class WorkspaceBloc extends Bloc<WorkspaceEvent, WorkspaceState> {
  final GetWorkspaces getWorkspaces;

  WorkspaceBloc({required this.getWorkspaces})
      : super(const WorkspaceState.initial()) {
    on<WorkspaceLoadEvent>(_onLoad);
    on<WorkspaceRefreshEvent>(_onRefresh);
  }

  Future<void> _onLoad(
    WorkspaceLoadEvent event,
    Emitter<WorkspaceState> emit,
  ) async {
    emit(const WorkspaceState.loading());

    final result = await getWorkspaces(NoParams());

    result.fold(
      (failure) => emit(WorkspaceState.error(message: '워크스페이스를 불러올 수 없습니다')),
      (workspaces) => emit(WorkspaceState.loaded(workspaces: workspaces)),
    );
  }

  Future<void> _onRefresh(
    WorkspaceRefreshEvent event,
    Emitter<WorkspaceState> emit,
  ) async {
    // Refresh는 loading 상태 없이 바로 로드
    final result = await getWorkspaces(NoParams());

    result.fold(
      (failure) => emit(WorkspaceState.error(message: '워크스페이스를 불러올 수 없습니다')),
      (workspaces) => emit(WorkspaceState.loaded(workspaces: workspaces)),
    );
  }
}
