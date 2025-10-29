import 'package:equatable/equatable.dart';

/// Domain entity example
/// Entities are pure Dart objects with no dependencies
class ExampleEntity extends Equatable {
  final String id;
  final String name;

  const ExampleEntity({
    required this.id,
    required this.name,
  });

  @override
  List<Object> get props => [id, name];
}
