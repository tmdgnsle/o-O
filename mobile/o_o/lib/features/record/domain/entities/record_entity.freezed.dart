// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'record_entity.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordEntity {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  String? get audioUrl => throw _privateConstructorUsedError;

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecordEntityCopyWith<RecordEntity> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordEntityCopyWith<$Res> {
  factory $RecordEntityCopyWith(
    RecordEntity value,
    $Res Function(RecordEntity) then,
  ) = _$RecordEntityCopyWithImpl<$Res, RecordEntity>;
  @useResult
  $Res call({
    String id,
    String title,
    String content,
    DateTime createdAt,
    String? audioUrl,
  });
}

/// @nodoc
class _$RecordEntityCopyWithImpl<$Res, $Val extends RecordEntity>
    implements $RecordEntityCopyWith<$Res> {
  _$RecordEntityCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordEntity
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
abstract class _$$RecordEntityImplCopyWith<$Res>
    implements $RecordEntityCopyWith<$Res> {
  factory _$$RecordEntityImplCopyWith(
    _$RecordEntityImpl value,
    $Res Function(_$RecordEntityImpl) then,
  ) = __$$RecordEntityImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String content,
    DateTime createdAt,
    String? audioUrl,
  });
}

/// @nodoc
class __$$RecordEntityImplCopyWithImpl<$Res>
    extends _$RecordEntityCopyWithImpl<$Res, _$RecordEntityImpl>
    implements _$$RecordEntityImplCopyWith<$Res> {
  __$$RecordEntityImplCopyWithImpl(
    _$RecordEntityImpl _value,
    $Res Function(_$RecordEntityImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordEntity
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
      _$RecordEntityImpl(
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

class _$RecordEntityImpl extends _RecordEntity {
  const _$RecordEntityImpl({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    this.audioUrl,
  }) : super._();

  @override
  final String id;
  @override
  final String title;
  @override
  final String content;
  @override
  final DateTime createdAt;
  @override
  final String? audioUrl;

  @override
  String toString() {
    return 'RecordEntity(id: $id, title: $title, content: $content, createdAt: $createdAt, audioUrl: $audioUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordEntityImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.audioUrl, audioUrl) ||
                other.audioUrl == audioUrl));
  }

  @override
  int get hashCode =>
      Object.hash(runtimeType, id, title, content, createdAt, audioUrl);

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordEntityImplCopyWith<_$RecordEntityImpl> get copyWith =>
      __$$RecordEntityImplCopyWithImpl<_$RecordEntityImpl>(this, _$identity);
}

abstract class _RecordEntity extends RecordEntity {
  const factory _RecordEntity({
    required final String id,
    required final String title,
    required final String content,
    required final DateTime createdAt,
    final String? audioUrl,
  }) = _$RecordEntityImpl;
  const _RecordEntity._() : super._();

  @override
  String get id;
  @override
  String get title;
  @override
  String get content;
  @override
  DateTime get createdAt;
  @override
  String? get audioUrl;

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordEntityImplCopyWith<_$RecordEntityImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
