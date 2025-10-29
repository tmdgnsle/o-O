import 'package:equatable/equatable.dart';

import '../../domain/entities/example_entity.dart';

/// Base class for all example states
abstract class ExampleState extends Equatable {
  const ExampleState();

  @override
  List<Object> get props => [];
}

/// Initial state
class ExampleInitial extends ExampleState {}

/// Loading state
class ExampleLoading extends ExampleState {}

/// Success state with data
class ExampleLoaded extends ExampleState {
  final ExampleEntity example;

  const ExampleLoaded(this.example);

  @override
  List<Object> get props => [example];
}

/// Success state with list of data
class ExamplesLoaded extends ExampleState {
  final List<ExampleEntity> examples;

  const ExamplesLoaded(this.examples);

  @override
  List<Object> get props => [examples];
}

/// Error state
class ExampleError extends ExampleState {
  final String message;

  const ExampleError(this.message);

  @override
  List<Object> get props => [message];
}
