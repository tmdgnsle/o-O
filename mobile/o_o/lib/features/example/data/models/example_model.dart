import '../../domain/entities/example_entity.dart';

/// Data model that extends domain entity
/// Handles serialization/deserialization
class ExampleModel extends ExampleEntity {
  const ExampleModel({
    required super.id,
    required super.name,
  });

  factory ExampleModel.fromJson(Map<String, dynamic> json) {
    return ExampleModel(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
}
