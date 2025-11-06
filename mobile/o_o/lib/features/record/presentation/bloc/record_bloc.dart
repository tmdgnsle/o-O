import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecases/usecase.dart';
import '../../domain/repositories/record_repository.dart';
import '../../domain/usecases/get_records.dart';
import 'record_event.dart';
import 'record_state.dart';

/// Record BLoC using Freezed events and states
class RecordBloc extends Bloc<RecordEvent, RecordState> {
  final GetRecords getRecords;
  final RecordRepository repository;

  RecordBloc({
    required this.getRecords,
    required this.repository,
  }) : super(const RecordState.initial()) {
    on<RecordEvent>((event, emit) async {
      await event.when(
        getRecords: () => _onGetRecords(emit),
        getRecord: (id) => _onGetRecord(id, emit),
        deleteRecord: (id) => _onDeleteRecord(id, emit),
        refreshRecords: () => _onRefreshRecords(emit),
      );
    });
  }

  Future<void> _onGetRecords(Emitter<RecordState> emit) async {
    emit(const RecordState.loading());

    final result = await getRecords(NoParams());

    result.fold(
      (failure) => emit(RecordState.error(message: failure.message)),
      (records) => emit(RecordState.loaded(records: records)),
    );
  }

  Future<void> _onGetRecord(String id, Emitter<RecordState> emit) async {
    emit(const RecordState.loading());

    final result = await repository.getRecord(id);

    result.fold(
      (failure) => emit(RecordState.error(message: failure.message)),
      (record) => emit(RecordState.detailLoaded(record: record)),
    );
  }

  Future<void> _onDeleteRecord(String id, Emitter<RecordState> emit) async {
    emit(const RecordState.loading());

    final result = await repository.deleteRecord(id);

    result.fold(
      (failure) => emit(RecordState.error(message: failure.message)),
      (_) => emit(const RecordState.deleted()),
    );
  }

  Future<void> _onRefreshRecords(Emitter<RecordState> emit) async {
    // Refresh without showing loading state
    final result = await getRecords(NoParams());

    result.fold(
      (failure) => emit(RecordState.error(message: failure.message)),
      (records) => emit(RecordState.loaded(records: records)),
    );
  }
}
