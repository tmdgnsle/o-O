import 'package:equatable/equatable.dart';

/// Workspace Entity
class Workspace extends Equatable {
  final int id;
  final String title;
  final String visibility;
  final DateTime createdAt;
  final String thumbnail;

  const Workspace({
    required this.id,
    required this.title,
    required this.visibility,
    required this.createdAt,
    required this.thumbnail,
  });

  @override
  List<Object?> get props => [id, title, visibility, createdAt, thumbnail];
}
