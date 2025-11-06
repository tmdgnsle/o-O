import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecases/usecase.dart';
import '../../domain/usecases/start_recording.dart';
import '../../domain/usecases/stop_recording.dart';
import 'recording_event.dart';
import 'recording_state.dart';

/// 녹음 BLoC
class RecordingBloc extends Bloc<RecordingEvent, RecordingState> {
  final StartRecording startRecording;
  final StopRecording stopRecording;

  RecordingBloc({
    required this.startRecording,
    required this.stopRecording,
  }) : super(const RecordingState.initial()) {
    on<RecordingStart>(_onStart);
    on<RecordingPause>(_onPause);
    on<RecordingResume>(_onResume);
    on<RecordingStop>(_onStop);
    on<RecordingToggle>(_onToggle);
  }

  Future<void> _onStart(
    RecordingStart event,
    Emitter<RecordingState> emit,
  ) async {
    final result = await startRecording(NoParams());

    result.fold(
      (failure) => emit(RecordingState.error(message: '녹음 시작 실패')),
      (_) => emit(const RecordingState.recording()),
    );
  }

  Future<void> _onPause(
    RecordingPause event,
    Emitter<RecordingState> emit,
  ) async {
    // 녹음 일시정지 (실제 녹음은 계속되지만 UI 상태만 변경)
    emit(const RecordingState.paused());
  }

  Future<void> _onResume(
    RecordingResume event,
    Emitter<RecordingState> emit,
  ) async {
    // 녹음 재개
    emit(const RecordingState.recording());
  }

  Future<void> _onStop(
    RecordingStop event,
    Emitter<RecordingState> emit,
  ) async {
    final result = await stopRecording(NoParams());

    result.fold(
      (failure) => emit(RecordingState.error(message: '녹음 종료 실패')),
      (filePath) => emit(RecordingState.stopped(filePath: filePath)),
    );
  }

  Future<void> _onToggle(
    RecordingToggle event,
    Emitter<RecordingState> emit,
  ) async {
    state.when(
      initial: () => add(const RecordingEvent.start()),
      recording: () => add(const RecordingEvent.stop()),
      paused: () => add(const RecordingEvent.stop()),
      stopped: (_) => add(const RecordingEvent.start()),
      error: (_) => add(const RecordingEvent.start()),
    );
  }
}
