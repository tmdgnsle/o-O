// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mindmap_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$MindmapEvent {
  int get workspaceId => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(int workspaceId) loadMindmap,
    required TResult Function(int workspaceId) refreshMindmap,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(int workspaceId)? loadMindmap,
    TResult? Function(int workspaceId)? refreshMindmap,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(int workspaceId)? loadMindmap,
    TResult Function(int workspaceId)? refreshMindmap,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoadMindmapEvent value) loadMindmap,
    required TResult Function(RefreshMindmapEvent value) refreshMindmap,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoadMindmapEvent value)? loadMindmap,
    TResult? Function(RefreshMindmapEvent value)? refreshMindmap,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoadMindmapEvent value)? loadMindmap,
    TResult Function(RefreshMindmapEvent value)? refreshMindmap,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MindmapEventCopyWith<MindmapEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MindmapEventCopyWith<$Res> {
  factory $MindmapEventCopyWith(
    MindmapEvent value,
    $Res Function(MindmapEvent) then,
  ) = _$MindmapEventCopyWithImpl<$Res, MindmapEvent>;
  @useResult
  $Res call({int workspaceId});
}

/// @nodoc
class _$MindmapEventCopyWithImpl<$Res, $Val extends MindmapEvent>
    implements $MindmapEventCopyWith<$Res> {
  _$MindmapEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? workspaceId = null}) {
    return _then(
      _value.copyWith(
            workspaceId:
                null == workspaceId
                    ? _value.workspaceId
                    : workspaceId // ignore: cast_nullable_to_non_nullable
                        as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$LoadMindmapEventImplCopyWith<$Res>
    implements $MindmapEventCopyWith<$Res> {
  factory _$$LoadMindmapEventImplCopyWith(
    _$LoadMindmapEventImpl value,
    $Res Function(_$LoadMindmapEventImpl) then,
  ) = __$$LoadMindmapEventImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int workspaceId});
}

/// @nodoc
class __$$LoadMindmapEventImplCopyWithImpl<$Res>
    extends _$MindmapEventCopyWithImpl<$Res, _$LoadMindmapEventImpl>
    implements _$$LoadMindmapEventImplCopyWith<$Res> {
  __$$LoadMindmapEventImplCopyWithImpl(
    _$LoadMindmapEventImpl _value,
    $Res Function(_$LoadMindmapEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? workspaceId = null}) {
    return _then(
      _$LoadMindmapEventImpl(
        workspaceId:
            null == workspaceId
                ? _value.workspaceId
                : workspaceId // ignore: cast_nullable_to_non_nullable
                    as int,
      ),
    );
  }
}

/// @nodoc

class _$LoadMindmapEventImpl implements LoadMindmapEvent {
  const _$LoadMindmapEventImpl({required this.workspaceId});

  @override
  final int workspaceId;

  @override
  String toString() {
    return 'MindmapEvent.loadMindmap(workspaceId: $workspaceId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LoadMindmapEventImpl &&
            (identical(other.workspaceId, workspaceId) ||
                other.workspaceId == workspaceId));
  }

  @override
  int get hashCode => Object.hash(runtimeType, workspaceId);

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LoadMindmapEventImplCopyWith<_$LoadMindmapEventImpl> get copyWith =>
      __$$LoadMindmapEventImplCopyWithImpl<_$LoadMindmapEventImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(int workspaceId) loadMindmap,
    required TResult Function(int workspaceId) refreshMindmap,
  }) {
    return loadMindmap(workspaceId);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(int workspaceId)? loadMindmap,
    TResult? Function(int workspaceId)? refreshMindmap,
  }) {
    return loadMindmap?.call(workspaceId);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(int workspaceId)? loadMindmap,
    TResult Function(int workspaceId)? refreshMindmap,
    required TResult orElse(),
  }) {
    if (loadMindmap != null) {
      return loadMindmap(workspaceId);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoadMindmapEvent value) loadMindmap,
    required TResult Function(RefreshMindmapEvent value) refreshMindmap,
  }) {
    return loadMindmap(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoadMindmapEvent value)? loadMindmap,
    TResult? Function(RefreshMindmapEvent value)? refreshMindmap,
  }) {
    return loadMindmap?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoadMindmapEvent value)? loadMindmap,
    TResult Function(RefreshMindmapEvent value)? refreshMindmap,
    required TResult orElse(),
  }) {
    if (loadMindmap != null) {
      return loadMindmap(this);
    }
    return orElse();
  }
}

abstract class LoadMindmapEvent implements MindmapEvent {
  const factory LoadMindmapEvent({required final int workspaceId}) =
      _$LoadMindmapEventImpl;

  @override
  int get workspaceId;

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LoadMindmapEventImplCopyWith<_$LoadMindmapEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$RefreshMindmapEventImplCopyWith<$Res>
    implements $MindmapEventCopyWith<$Res> {
  factory _$$RefreshMindmapEventImplCopyWith(
    _$RefreshMindmapEventImpl value,
    $Res Function(_$RefreshMindmapEventImpl) then,
  ) = __$$RefreshMindmapEventImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int workspaceId});
}

/// @nodoc
class __$$RefreshMindmapEventImplCopyWithImpl<$Res>
    extends _$MindmapEventCopyWithImpl<$Res, _$RefreshMindmapEventImpl>
    implements _$$RefreshMindmapEventImplCopyWith<$Res> {
  __$$RefreshMindmapEventImplCopyWithImpl(
    _$RefreshMindmapEventImpl _value,
    $Res Function(_$RefreshMindmapEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? workspaceId = null}) {
    return _then(
      _$RefreshMindmapEventImpl(
        workspaceId:
            null == workspaceId
                ? _value.workspaceId
                : workspaceId // ignore: cast_nullable_to_non_nullable
                    as int,
      ),
    );
  }
}

/// @nodoc

class _$RefreshMindmapEventImpl implements RefreshMindmapEvent {
  const _$RefreshMindmapEventImpl({required this.workspaceId});

  @override
  final int workspaceId;

  @override
  String toString() {
    return 'MindmapEvent.refreshMindmap(workspaceId: $workspaceId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RefreshMindmapEventImpl &&
            (identical(other.workspaceId, workspaceId) ||
                other.workspaceId == workspaceId));
  }

  @override
  int get hashCode => Object.hash(runtimeType, workspaceId);

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RefreshMindmapEventImplCopyWith<_$RefreshMindmapEventImpl> get copyWith =>
      __$$RefreshMindmapEventImplCopyWithImpl<_$RefreshMindmapEventImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(int workspaceId) loadMindmap,
    required TResult Function(int workspaceId) refreshMindmap,
  }) {
    return refreshMindmap(workspaceId);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(int workspaceId)? loadMindmap,
    TResult? Function(int workspaceId)? refreshMindmap,
  }) {
    return refreshMindmap?.call(workspaceId);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(int workspaceId)? loadMindmap,
    TResult Function(int workspaceId)? refreshMindmap,
    required TResult orElse(),
  }) {
    if (refreshMindmap != null) {
      return refreshMindmap(workspaceId);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoadMindmapEvent value) loadMindmap,
    required TResult Function(RefreshMindmapEvent value) refreshMindmap,
  }) {
    return refreshMindmap(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoadMindmapEvent value)? loadMindmap,
    TResult? Function(RefreshMindmapEvent value)? refreshMindmap,
  }) {
    return refreshMindmap?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoadMindmapEvent value)? loadMindmap,
    TResult Function(RefreshMindmapEvent value)? refreshMindmap,
    required TResult orElse(),
  }) {
    if (refreshMindmap != null) {
      return refreshMindmap(this);
    }
    return orElse();
  }
}

abstract class RefreshMindmapEvent implements MindmapEvent {
  const factory RefreshMindmapEvent({required final int workspaceId}) =
      _$RefreshMindmapEventImpl;

  @override
  int get workspaceId;

  /// Create a copy of MindmapEvent
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RefreshMindmapEventImplCopyWith<_$RefreshMindmapEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
