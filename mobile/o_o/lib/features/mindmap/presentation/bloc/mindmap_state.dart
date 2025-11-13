import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/mindmap.dart';

part 'mindmap_state.freezed.dart';

/// Mindmap BLoC State
@freezed
class MindmapState with _$MindmapState {
  /// 초기 상태
  const factory MindmapState.initial() = MindmapInitial;

  /// 로딩 중
  const factory MindmapState.loading() = MindmapLoading;

  /// 로드 완료
  const factory MindmapState.loaded({
    required Mindmap mindmap,
  }) = MindmapLoaded;

  /// 에러
  const factory MindmapState.error({
    required String message,
  }) = MindmapError;
}
