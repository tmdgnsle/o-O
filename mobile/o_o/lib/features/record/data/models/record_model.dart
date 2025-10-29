import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/record_entity.dart';

part 'record_model.freezed.dart';
part 'record_model.g.dart';

/// Record model using Freezed + JSON Serialization
@freezed
class RecordModel with _$RecordModel {
  const factory RecordModel({
    required String id,
    required String title,
    required String content,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'audio_url') String? audioUrl,
  }) = _RecordModel;

  factory RecordModel.fromJson(Map<String, dynamic> json) =>
      _$RecordModelFromJson(json);

  const RecordModel._();

  /// Entity로 변환
  RecordEntity toEntity() {
    return RecordEntity(
      id: id,
      title: title,
      content: content,
      createdAt: createdAt,
      audioUrl: audioUrl,
    );
  }

  /// Entity에서 Model로 변환
  factory RecordModel.fromEntity(RecordEntity entity) {
    return RecordModel(
      id: entity.id,
      title: entity.title,
      content: entity.content,
      createdAt: entity.createdAt,
      audioUrl: entity.audioUrl,
    );
  }
}
