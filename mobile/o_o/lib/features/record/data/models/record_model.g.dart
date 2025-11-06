// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'record_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RecordModelImpl _$$RecordModelImplFromJson(Map<String, dynamic> json) =>
    _$RecordModelImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      audioUrl: json['audio_url'] as String?,
    );

Map<String, dynamic> _$$RecordModelImplToJson(_$RecordModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'content': instance.content,
      'created_at': instance.createdAt.toIso8601String(),
      'audio_url': instance.audioUrl,
    };
