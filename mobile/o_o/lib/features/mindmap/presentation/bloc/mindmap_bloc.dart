import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/utils/app_logger.dart';
import '../../domain/usecases/get_mindmap_nodes.dart';
import 'mindmap_event.dart';
import 'mindmap_state.dart';

/// Mindmap BLoC
class MindmapBloc extends Bloc<MindmapEvent, MindmapState> {
  final GetMindmapNodes getMindmapNodes;

  MindmapBloc({
    required this.getMindmapNodes,
  }) : super(const MindmapState.initial()) {
    logger.i('📦 MindmapBloc initialized');

    on<MindmapEvent>((event, emit) async {
      logger.d('📨 MindmapBloc received event: $event');
      await event.when(
        loadMindmap: (workspaceId) => _onLoadMindmap(workspaceId, emit),
        refreshMindmap: (workspaceId) => _onRefreshMindmap(workspaceId, emit),
      );
    });
  }

  Future<void> _onLoadMindmap(
    int workspaceId,
    Emitter<MindmapState> emit,
  ) async {
    logger.i('🔄 MindmapBloc: Loading mindmap for workspace $workspaceId');
    emit(const MindmapState.loading());

    final result = await getMindmapNodes(workspaceId);

    result.fold(
      (failure) {
        logger.e('❌ MindmapBloc: Failed to load mindmap - ${failure.message}');
        emit(MindmapState.error(message: failure.message));
      },
      (mindmap) {
        logger.i('✅ MindmapBloc: Successfully loaded mindmap');
        logger.d('  📊 Nodes: ${mindmap.nodes.length}, Edges: ${mindmap.edges.length}');

        // 노드 상세 정보 (처음 5개만)
        for (var i = 0; i < mindmap.nodes.length && i < 5; i++) {
          final node = mindmap.nodes[i];
          logger.d('  [$i] "${node.text}" at (${node.position.dx.toStringAsFixed(1)}, ${node.position.dy.toStringAsFixed(1)}), level: ${node.level}');
        }
        if (mindmap.nodes.length > 5) {
          logger.d('  ... and ${mindmap.nodes.length - 5} more nodes');
        }

        emit(MindmapState.loaded(mindmap: mindmap));
      },
    );
  }

  Future<void> _onRefreshMindmap(
    int workspaceId,
    Emitter<MindmapState> emit,
  ) async {
    logger.i('🔄 MindmapBloc: Refreshing mindmap for workspace $workspaceId');

    final result = await getMindmapNodes(workspaceId);

    result.fold(
      (failure) {
        logger.e('❌ MindmapBloc: Failed to refresh mindmap - ${failure.message}');
        emit(MindmapState.error(message: failure.message));
      },
      (mindmap) {
        logger.i('✅ MindmapBloc: Successfully refreshed mindmap');
        emit(MindmapState.loaded(mindmap: mindmap));
      },
    );
  }
}
