// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'record_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

RecordModel _$RecordModelFromJson(Map<String, dynamic> json) {
  return _RecordModel.fromJson(json);
}

/// @nodoc
mixin _$RecordModel {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'audio_url')
  String? get audioUrl => throw _privateConstructorUsedError;

  /// Serializes this RecordModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RecordModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecordModelCopyWith<RecordModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordModelCopyWith<$Res> {
  factory $RecordModelCopyWith(
    RecordModel value,
    $Res Function(RecordModel) then,
  ) = _$RecordModelCopyWithImpl<$Res, RecordModel>;
  @useResult
  $Res call({
    String id,
    String title,
    String content,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'audio_url') String? audioUrl,
  });
}

/// @nodoc
class _$RecordModelCopyWithImpl<$Res, $Val extends RecordModel>
    implements $RecordModelCopyWith<$Res> {
  _$RecordModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? content = null,
    Object? createdAt = null,
    Object? audioUrl = freezed,
  }) {
    return _then(
      _value.copyWith(
            id:
                null == id
                    ? _value.id
                    : id // ignore: cast_nullable_to_non_nullable
                        as String,
            title:
                null == title
                    ? _value.title
                    : title // ignore: cast_nullable_to_non_nullable
                        as String,
            content:
                null == content
                    ? _value.content
                    : content // ignore: cast_nullable_to_non_nullable
                        as String,
            createdAt:
                null == createdAt
                    ? _value.createdAt
                    : createdAt // ignore: cast_nullable_to_non_nullable
                        as DateTime,
            audioUrl:
                freezed == audioUrl
                    ? _value.audioUrl
                    : audioUrl // ignore: cast_nullable_to_non_nullable
                        as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RecordModelImplCopyWith<$Res>
    implements $RecordModelCopyWith<$Res> {
  factory _$$RecordModelImplCopyWith(
    _$RecordModelImpl value,
    $Res Function(_$RecordModelImpl) then,
  ) = __$$RecordModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String content,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'audio_url') String? audioUrl,
  });
}

/// @nodoc
class __$$RecordModelImplCopyWithImpl<$Res>
    extends _$RecordModelCopyWithImpl<$Res, _$RecordModelImpl>
    implements _$$RecordModelImplCopyWith<$Res> {
  __$$RecordModelImplCopyWithImpl(
    _$RecordModelImpl _value,
    $Res Function(_$RecordModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? content = null,
    Object? createdAt = null,
    Object? audioUrl = freezed,
  }) {
    return _then(
      _$RecordModelImpl(
        id:
            null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                    as String,
        title:
            null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                    as String,
        content:
            null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                    as String,
        createdAt:
            null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                    as DateTime,
        audioUrl:
            freezed == audioUrl
                ? _value.audioUrl
                : audioUrl // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RecordModelImpl extends _RecordModel {
  const _$RecordModelImpl({
    required this.id,
    required this.title,
    required this.content,
    @JsonKey(name: 'created_at') required this.createdAt,
    @JsonKey(name: 'audio_url') this.audioUrl,
  }) : super._();

  factory _$RecordModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$RecordModelImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String content;
  @override
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @override
  @JsonKey(name: 'audio_url')
  final String? audioUrl;

  @override
  String toString() {
    return 'RecordModel(id: $id, title: $title, content: $content, createdAt: $createdAt, audioUrl: $audioUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.audioUrl, audioUrl) ||
                other.audioUrl == audioUrl));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, title, content, createdAt, audioUrl);

  /// Create a copy of RecordModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordModelImplCopyWith<_$RecordModelImpl> get copyWith =>
      __$$RecordModelImplCopyWithImpl<_$RecordModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RecordModelImplToJson(this);
  }
}

abstract class _RecordModel extends RecordModel {
  const factory _RecordModel({
    required final String id,
    required final String title,
    required final String content,
    @JsonKey(name: 'created_at') required final DateTime createdAt,
    @JsonKey(name: 'audio_url') final String? audioUrl,
  }) = _$RecordModelImpl;
  const _RecordModel._() : super._();

  factory _RecordModel.fromJson(Map<String, dynamic> json) =
      _$RecordModelImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get content;
  @override
  @JsonKey(name: 'created_at')
  DateTime get createdAt;
  @override
  @JsonKey(name: 'audio_url')
  String? get audioUrl;

  /// Create a copy of RecordModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordModelImplCopyWith<_$RecordModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
