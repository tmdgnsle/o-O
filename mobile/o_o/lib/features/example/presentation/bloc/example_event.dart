import 'package:equatable/equatable.dart';

/// Base class for all example events
abstract class ExampleEvent extends Equatable {
  const ExampleEvent();

  @override
  List<Object> get props => [];
}

/// Event to get an example by ID
class GetExampleEvent extends ExampleEvent {
  final String id;

  const GetExampleEvent(this.id);

  @override
  List<Object> get props => [id];
}

/// Event to get all examples
class GetExamplesEvent extends ExampleEvent {
  const GetExamplesEvent();
}
