import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_example.dart';
import 'example_event.dart';
import 'example_state.dart';

const String serverFailureMessage = 'Server Failure';
const String cacheFailureMessage = 'Cache Failure';
const String networkFailureMessage = 'Network Failure';

/// BLoC for managing example feature state
class ExampleBloc extends Bloc<ExampleEvent, ExampleState> {
  final GetExample getExample;
  // Add other use cases here

  ExampleBloc({
    required this.getExample,
  }) : super(ExampleInitial()) {
    on<GetExampleEvent>(_onGetExample);
    on<GetExamplesEvent>(_onGetExamples);
  }

  Future<void> _onGetExample(
    GetExampleEvent event,
    Emitter<ExampleState> emit,
  ) async {
    emit(ExampleLoading());

    final failureOrExample = await getExample(
      GetExampleParams(id: event.id),
    );

    failureOrExample.fold(
      (failure) => emit(ExampleError(_mapFailureToMessage(failure.message))),
      (example) => emit(ExampleLoaded(example)),
    );
  }

  Future<void> _onGetExamples(
    GetExamplesEvent event,
    Emitter<ExampleState> emit,
  ) async {
    // TODO: Implement get examples
    emit(const ExampleError('Not implemented'));
  }

  String _mapFailureToMessage(String message) {
    return message;
  }
}
