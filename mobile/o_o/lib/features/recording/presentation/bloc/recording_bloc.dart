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
      stopped: (_) => add(const RecordingEvent.start()),
      error: (_) => add(const RecordingEvent.start()),
    );
  }
}
