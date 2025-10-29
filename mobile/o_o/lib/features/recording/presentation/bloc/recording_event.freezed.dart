// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recording_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordingEvent {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() stop,
    required TResult Function() toggle,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? stop,
    TResult? Function()? toggle,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? stop,
    TResult Function()? toggle,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordingEventCopyWith<$Res> {
  factory $RecordingEventCopyWith(
    RecordingEvent value,
    $Res Function(RecordingEvent) then,
  ) = _$RecordingEventCopyWithImpl<$Res, RecordingEvent>;
}

/// @nodoc
class _$RecordingEventCopyWithImpl<$Res, $Val extends RecordingEvent>
    implements $RecordingEventCopyWith<$Res> {
  _$RecordingEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$RecordingStartImplCopyWith<$Res> {
  factory _$$RecordingStartImplCopyWith(
    _$RecordingStartImpl value,
    $Res Function(_$RecordingStartImpl) then,
  ) = __$$RecordingStartImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingStartImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingStartImpl>
    implements _$$RecordingStartImplCopyWith<$Res> {
  __$$RecordingStartImplCopyWithImpl(
    _$RecordingStartImpl _value,
    $Res Function(_$RecordingStartImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingStartImpl implements RecordingStart {
  const _$RecordingStartImpl();

  @override
  String toString() {
    return 'RecordingEvent.start()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingStartImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() stop,
    required TResult Function() toggle,
  }) {
    return start();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? stop,
    TResult? Function()? toggle,
  }) {
    return start?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? stop,
    TResult Function()? toggle,
    required TResult orElse(),
  }) {
    if (start != null) {
      return start();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
  }) {
    return start(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
  }) {
    return start?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    required TResult orElse(),
  }) {
    if (start != null) {
      return start(this);
    }
    return orElse();
  }
}

abstract class RecordingStart implements RecordingEvent {
  const factory RecordingStart() = _$RecordingStartImpl;
}

/// @nodoc
abstract class _$$RecordingStopImplCopyWith<$Res> {
  factory _$$RecordingStopImplCopyWith(
    _$RecordingStopImpl value,
    $Res Function(_$RecordingStopImpl) then,
  ) = __$$RecordingStopImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingStopImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingStopImpl>
    implements _$$RecordingStopImplCopyWith<$Res> {
  __$$RecordingStopImplCopyWithImpl(
    _$RecordingStopImpl _value,
    $Res Function(_$RecordingStopImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingStopImpl implements RecordingStop {
  const _$RecordingStopImpl();

  @override
  String toString() {
    return 'RecordingEvent.stop()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingStopImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() stop,
    required TResult Function() toggle,
  }) {
    return stop();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? stop,
    TResult? Function()? toggle,
  }) {
    return stop?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? stop,
    TResult Function()? toggle,
    required TResult orElse(),
  }) {
    if (stop != null) {
      return stop();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
  }) {
    return stop(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
  }) {
    return stop?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    required TResult orElse(),
  }) {
    if (stop != null) {
      return stop(this);
    }
    return orElse();
  }
}

abstract class RecordingStop implements RecordingEvent {
  const factory RecordingStop() = _$RecordingStopImpl;
}

/// @nodoc
abstract class _$$RecordingToggleImplCopyWith<$Res> {
  factory _$$RecordingToggleImplCopyWith(
    _$RecordingToggleImpl value,
    $Res Function(_$RecordingToggleImpl) then,
  ) = __$$RecordingToggleImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingToggleImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingToggleImpl>
    implements _$$RecordingToggleImplCopyWith<$Res> {
  __$$RecordingToggleImplCopyWithImpl(
    _$RecordingToggleImpl _value,
    $Res Function(_$RecordingToggleImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingToggleImpl implements RecordingToggle {
  const _$RecordingToggleImpl();

  @override
  String toString() {
    return 'RecordingEvent.toggle()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingToggleImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() stop,
    required TResult Function() toggle,
  }) {
    return toggle();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? stop,
    TResult? Function()? toggle,
  }) {
    return toggle?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? stop,
    TResult Function()? toggle,
    required TResult orElse(),
  }) {
    if (toggle != null) {
      return toggle();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
  }) {
    return toggle(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
  }) {
    return toggle?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    required TResult orElse(),
  }) {
    if (toggle != null) {
      return toggle(this);
    }
    return orElse();
  }
}

abstract class RecordingToggle implements RecordingEvent {
  const factory RecordingToggle() = _$RecordingToggleImpl;
}
