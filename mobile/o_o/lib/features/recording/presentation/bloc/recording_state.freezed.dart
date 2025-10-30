// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recording_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordingState {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() recording,
    required TResult Function() paused,
    required TResult Function(String? filePath) stopped,
    required TResult Function(String message) error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? recording,
    TResult? Function()? paused,
    TResult? Function(String? filePath)? stopped,
    TResult? Function(String message)? error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? recording,
    TResult Function()? paused,
    TResult Function(String? filePath)? stopped,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingInitial value) initial,
    required TResult Function(RecordingInProgress value) recording,
    required TResult Function(RecordingPaused value) paused,
    required TResult Function(RecordingStopped value) stopped,
    required TResult Function(RecordingError value) error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingInitial value)? initial,
    TResult? Function(RecordingInProgress value)? recording,
    TResult? Function(RecordingPaused value)? paused,
    TResult? Function(RecordingStopped value)? stopped,
    TResult? Function(RecordingError value)? error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingInitial value)? initial,
    TResult Function(RecordingInProgress value)? recording,
    TResult Function(RecordingPaused value)? paused,
    TResult Function(RecordingStopped value)? stopped,
    TResult Function(RecordingError value)? error,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordingStateCopyWith<$Res> {
  factory $RecordingStateCopyWith(
    RecordingState value,
    $Res Function(RecordingState) then,
  ) = _$RecordingStateCopyWithImpl<$Res, RecordingState>;
}

/// @nodoc
class _$RecordingStateCopyWithImpl<$Res, $Val extends RecordingState>
    implements $RecordingStateCopyWith<$Res> {
  _$RecordingStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$RecordingInitialImplCopyWith<$Res> {
  factory _$$RecordingInitialImplCopyWith(
    _$RecordingInitialImpl value,
    $Res Function(_$RecordingInitialImpl) then,
  ) = __$$RecordingInitialImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingInitialImplCopyWithImpl<$Res>
    extends _$RecordingStateCopyWithImpl<$Res, _$RecordingInitialImpl>
    implements _$$RecordingInitialImplCopyWith<$Res> {
  __$$RecordingInitialImplCopyWithImpl(
    _$RecordingInitialImpl _value,
    $Res Function(_$RecordingInitialImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingInitialImpl implements RecordingInitial {
  const _$RecordingInitialImpl();

  @override
  String toString() {
    return 'RecordingState.initial()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingInitialImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() recording,
    required TResult Function() paused,
    required TResult Function(String? filePath) stopped,
    required TResult Function(String message) error,
  }) {
    return initial();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? recording,
    TResult? Function()? paused,
    TResult? Function(String? filePath)? stopped,
    TResult? Function(String message)? error,
  }) {
    return initial?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? recording,
    TResult Function()? paused,
    TResult Function(String? filePath)? stopped,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (initial != null) {
      return initial();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingInitial value) initial,
    required TResult Function(RecordingInProgress value) recording,
    required TResult Function(RecordingPaused value) paused,
    required TResult Function(RecordingStopped value) stopped,
    required TResult Function(RecordingError value) error,
  }) {
    return initial(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingInitial value)? initial,
    TResult? Function(RecordingInProgress value)? recording,
    TResult? Function(RecordingPaused value)? paused,
    TResult? Function(RecordingStopped value)? stopped,
    TResult? Function(RecordingError value)? error,
  }) {
    return initial?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingInitial value)? initial,
    TResult Function(RecordingInProgress value)? recording,
    TResult Function(RecordingPaused value)? paused,
    TResult Function(RecordingStopped value)? stopped,
    TResult Function(RecordingError value)? error,
    required TResult orElse(),
  }) {
    if (initial != null) {
      return initial(this);
    }
    return orElse();
  }
}

abstract class RecordingInitial implements RecordingState {
  const factory RecordingInitial() = _$RecordingInitialImpl;
}

/// @nodoc
abstract class _$$RecordingInProgressImplCopyWith<$Res> {
  factory _$$RecordingInProgressImplCopyWith(
    _$RecordingInProgressImpl value,
    $Res Function(_$RecordingInProgressImpl) then,
  ) = __$$RecordingInProgressImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingInProgressImplCopyWithImpl<$Res>
    extends _$RecordingStateCopyWithImpl<$Res, _$RecordingInProgressImpl>
    implements _$$RecordingInProgressImplCopyWith<$Res> {
  __$$RecordingInProgressImplCopyWithImpl(
    _$RecordingInProgressImpl _value,
    $Res Function(_$RecordingInProgressImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingInProgressImpl implements RecordingInProgress {
  const _$RecordingInProgressImpl();

  @override
  String toString() {
    return 'RecordingState.recording()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordingInProgressImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() recording,
    required TResult Function() paused,
    required TResult Function(String? filePath) stopped,
    required TResult Function(String message) error,
  }) {
    return recording();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? recording,
    TResult? Function()? paused,
    TResult? Function(String? filePath)? stopped,
    TResult? Function(String message)? error,
  }) {
    return recording?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? recording,
    TResult Function()? paused,
    TResult Function(String? filePath)? stopped,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (recording != null) {
      return recording();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingInitial value) initial,
    required TResult Function(RecordingInProgress value) recording,
    required TResult Function(RecordingPaused value) paused,
    required TResult Function(RecordingStopped value) stopped,
    required TResult Function(RecordingError value) error,
  }) {
    return recording(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingInitial value)? initial,
    TResult? Function(RecordingInProgress value)? recording,
    TResult? Function(RecordingPaused value)? paused,
    TResult? Function(RecordingStopped value)? stopped,
    TResult? Function(RecordingError value)? error,
  }) {
    return recording?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingInitial value)? initial,
    TResult Function(RecordingInProgress value)? recording,
    TResult Function(RecordingPaused value)? paused,
    TResult Function(RecordingStopped value)? stopped,
    TResult Function(RecordingError value)? error,
    required TResult orElse(),
  }) {
    if (recording != null) {
      return recording(this);
    }
    return orElse();
  }
}

abstract class RecordingInProgress implements RecordingState {
  const factory RecordingInProgress() = _$RecordingInProgressImpl;
}

/// @nodoc
abstract class _$$RecordingPausedImplCopyWith<$Res> {
  factory _$$RecordingPausedImplCopyWith(
    _$RecordingPausedImpl value,
    $Res Function(_$RecordingPausedImpl) then,
  ) = __$$RecordingPausedImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingPausedImplCopyWithImpl<$Res>
    extends _$RecordingStateCopyWithImpl<$Res, _$RecordingPausedImpl>
    implements _$$RecordingPausedImplCopyWith<$Res> {
  __$$RecordingPausedImplCopyWithImpl(
    _$RecordingPausedImpl _value,
    $Res Function(_$RecordingPausedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingPausedImpl implements RecordingPaused {
  const _$RecordingPausedImpl();

  @override
  String toString() {
    return 'RecordingState.paused()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingPausedImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() recording,
    required TResult Function() paused,
    required TResult Function(String? filePath) stopped,
    required TResult Function(String message) error,
  }) {
    return paused();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? recording,
    TResult? Function()? paused,
    TResult? Function(String? filePath)? stopped,
    TResult? Function(String message)? error,
  }) {
    return paused?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? recording,
    TResult Function()? paused,
    TResult Function(String? filePath)? stopped,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (paused != null) {
      return paused();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingInitial value) initial,
    required TResult Function(RecordingInProgress value) recording,
    required TResult Function(RecordingPaused value) paused,
    required TResult Function(RecordingStopped value) stopped,
    required TResult Function(RecordingError value) error,
  }) {
    return paused(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingInitial value)? initial,
    TResult? Function(RecordingInProgress value)? recording,
    TResult? Function(RecordingPaused value)? paused,
    TResult? Function(RecordingStopped value)? stopped,
    TResult? Function(RecordingError value)? error,
  }) {
    return paused?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingInitial value)? initial,
    TResult Function(RecordingInProgress value)? recording,
    TResult Function(RecordingPaused value)? paused,
    TResult Function(RecordingStopped value)? stopped,
    TResult Function(RecordingError value)? error,
    required TResult orElse(),
  }) {
    if (paused != null) {
      return paused(this);
    }
    return orElse();
  }
}

abstract class RecordingPaused implements RecordingState {
  const factory RecordingPaused() = _$RecordingPausedImpl;
}

/// @nodoc
abstract class _$$RecordingStoppedImplCopyWith<$Res> {
  factory _$$RecordingStoppedImplCopyWith(
    _$RecordingStoppedImpl value,
    $Res Function(_$RecordingStoppedImpl) then,
  ) = __$$RecordingStoppedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String? filePath});
}

/// @nodoc
class __$$RecordingStoppedImplCopyWithImpl<$Res>
    extends _$RecordingStateCopyWithImpl<$Res, _$RecordingStoppedImpl>
    implements _$$RecordingStoppedImplCopyWith<$Res> {
  __$$RecordingStoppedImplCopyWithImpl(
    _$RecordingStoppedImpl _value,
    $Res Function(_$RecordingStoppedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? filePath = freezed}) {
    return _then(
      _$RecordingStoppedImpl(
        filePath:
            freezed == filePath
                ? _value.filePath
                : filePath // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc

class _$RecordingStoppedImpl implements RecordingStopped {
  const _$RecordingStoppedImpl({this.filePath});

  @override
  final String? filePath;

  @override
  String toString() {
    return 'RecordingState.stopped(filePath: $filePath)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordingStoppedImpl &&
            (identical(other.filePath, filePath) ||
                other.filePath == filePath));
  }

  @override
  int get hashCode => Object.hash(runtimeType, filePath);

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordingStoppedImplCopyWith<_$RecordingStoppedImpl> get copyWith =>
      __$$RecordingStoppedImplCopyWithImpl<_$RecordingStoppedImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() recording,
    required TResult Function() paused,
    required TResult Function(String? filePath) stopped,
    required TResult Function(String message) error,
  }) {
    return stopped(filePath);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? recording,
    TResult? Function()? paused,
    TResult? Function(String? filePath)? stopped,
    TResult? Function(String message)? error,
  }) {
    return stopped?.call(filePath);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? recording,
    TResult Function()? paused,
    TResult Function(String? filePath)? stopped,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (stopped != null) {
      return stopped(filePath);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingInitial value) initial,
    required TResult Function(RecordingInProgress value) recording,
    required TResult Function(RecordingPaused value) paused,
    required TResult Function(RecordingStopped value) stopped,
    required TResult Function(RecordingError value) error,
  }) {
    return stopped(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingInitial value)? initial,
    TResult? Function(RecordingInProgress value)? recording,
    TResult? Function(RecordingPaused value)? paused,
    TResult? Function(RecordingStopped value)? stopped,
    TResult? Function(RecordingError value)? error,
  }) {
    return stopped?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingInitial value)? initial,
    TResult Function(RecordingInProgress value)? recording,
    TResult Function(RecordingPaused value)? paused,
    TResult Function(RecordingStopped value)? stopped,
    TResult Function(RecordingError value)? error,
    required TResult orElse(),
  }) {
    if (stopped != null) {
      return stopped(this);
    }
    return orElse();
  }
}

abstract class RecordingStopped implements RecordingState {
  const factory RecordingStopped({final String? filePath}) =
      _$RecordingStoppedImpl;

  String? get filePath;

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordingStoppedImplCopyWith<_$RecordingStoppedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$RecordingErrorImplCopyWith<$Res> {
  factory _$$RecordingErrorImplCopyWith(
    _$RecordingErrorImpl value,
    $Res Function(_$RecordingErrorImpl) then,
  ) = __$$RecordingErrorImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String message});
}

/// @nodoc
class __$$RecordingErrorImplCopyWithImpl<$Res>
    extends _$RecordingStateCopyWithImpl<$Res, _$RecordingErrorImpl>
    implements _$$RecordingErrorImplCopyWith<$Res> {
  __$$RecordingErrorImplCopyWithImpl(
    _$RecordingErrorImpl _value,
    $Res Function(_$RecordingErrorImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? message = null}) {
    return _then(
      _$RecordingErrorImpl(
        message:
            null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                    as String,
      ),
    );
  }
}

/// @nodoc

class _$RecordingErrorImpl implements RecordingError {
  const _$RecordingErrorImpl({required this.message});

  @override
  final String message;

  @override
  String toString() {
    return 'RecordingState.error(message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordingErrorImpl &&
            (identical(other.message, message) || other.message == message));
  }

  @override
  int get hashCode => Object.hash(runtimeType, message);

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordingErrorImplCopyWith<_$RecordingErrorImpl> get copyWith =>
      __$$RecordingErrorImplCopyWithImpl<_$RecordingErrorImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() recording,
    required TResult Function() paused,
    required TResult Function(String? filePath) stopped,
    required TResult Function(String message) error,
  }) {
    return error(message);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? recording,
    TResult? Function()? paused,
    TResult? Function(String? filePath)? stopped,
    TResult? Function(String message)? error,
  }) {
    return error?.call(message);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? recording,
    TResult Function()? paused,
    TResult Function(String? filePath)? stopped,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(message);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingInitial value) initial,
    required TResult Function(RecordingInProgress value) recording,
    required TResult Function(RecordingPaused value) paused,
    required TResult Function(RecordingStopped value) stopped,
    required TResult Function(RecordingError value) error,
  }) {
    return error(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingInitial value)? initial,
    TResult? Function(RecordingInProgress value)? recording,
    TResult? Function(RecordingPaused value)? paused,
    TResult? Function(RecordingStopped value)? stopped,
    TResult? Function(RecordingError value)? error,
  }) {
    return error?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingInitial value)? initial,
    TResult Function(RecordingInProgress value)? recording,
    TResult Function(RecordingPaused value)? paused,
    TResult Function(RecordingStopped value)? stopped,
    TResult Function(RecordingError value)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(this);
    }
    return orElse();
  }
}

abstract class RecordingError implements RecordingState {
  const factory RecordingError({required final String message}) =
      _$RecordingErrorImpl;

  String get message;

  /// Create a copy of RecordingState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordingErrorImplCopyWith<_$RecordingErrorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
