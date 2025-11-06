// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$UserState {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserStateCopyWith<$Res> {
  factory $UserStateCopyWith(UserState value, $Res Function(UserState) then) =
      _$UserStateCopyWithImpl<$Res, UserState>;
}

/// @nodoc
class _$UserStateCopyWithImpl<$Res, $Val extends UserState>
    implements $UserStateCopyWith<$Res> {
  _$UserStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$UserInitialImplCopyWith<$Res> {
  factory _$$UserInitialImplCopyWith(
    _$UserInitialImpl value,
    $Res Function(_$UserInitialImpl) then,
  ) = __$$UserInitialImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$UserInitialImplCopyWithImpl<$Res>
    extends _$UserStateCopyWithImpl<$Res, _$UserInitialImpl>
    implements _$$UserInitialImplCopyWith<$Res> {
  __$$UserInitialImplCopyWithImpl(
    _$UserInitialImpl _value,
    $Res Function(_$UserInitialImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$UserInitialImpl implements UserInitial {
  const _$UserInitialImpl();

  @override
  String toString() {
    return 'UserState.initial()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$UserInitialImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) {
    return initial();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) {
    return initial?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
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
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) {
    return initial(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) {
    return initial?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) {
    if (initial != null) {
      return initial(this);
    }
    return orElse();
  }
}

abstract class UserInitial implements UserState {
  const factory UserInitial() = _$UserInitialImpl;
}

/// @nodoc
abstract class _$$UserLoadingImplCopyWith<$Res> {
  factory _$$UserLoadingImplCopyWith(
    _$UserLoadingImpl value,
    $Res Function(_$UserLoadingImpl) then,
  ) = __$$UserLoadingImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$UserLoadingImplCopyWithImpl<$Res>
    extends _$UserStateCopyWithImpl<$Res, _$UserLoadingImpl>
    implements _$$UserLoadingImplCopyWith<$Res> {
  __$$UserLoadingImplCopyWithImpl(
    _$UserLoadingImpl _value,
    $Res Function(_$UserLoadingImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$UserLoadingImpl implements UserLoading {
  const _$UserLoadingImpl();

  @override
  String toString() {
    return 'UserState.loading()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$UserLoadingImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) {
    return loading();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) {
    return loading?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
    required TResult orElse(),
  }) {
    if (loading != null) {
      return loading();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) {
    return loading(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) {
    return loading?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) {
    if (loading != null) {
      return loading(this);
    }
    return orElse();
  }
}

abstract class UserLoading implements UserState {
  const factory UserLoading() = _$UserLoadingImpl;
}

/// @nodoc
abstract class _$$UserLoadedImplCopyWith<$Res> {
  factory _$$UserLoadedImplCopyWith(
    _$UserLoadedImpl value,
    $Res Function(_$UserLoadedImpl) then,
  ) = __$$UserLoadedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({UserEntity user});

  $UserEntityCopyWith<$Res> get user;
}

/// @nodoc
class __$$UserLoadedImplCopyWithImpl<$Res>
    extends _$UserStateCopyWithImpl<$Res, _$UserLoadedImpl>
    implements _$$UserLoadedImplCopyWith<$Res> {
  __$$UserLoadedImplCopyWithImpl(
    _$UserLoadedImpl _value,
    $Res Function(_$UserLoadedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? user = null}) {
    return _then(
      _$UserLoadedImpl(
        user:
            null == user
                ? _value.user
                : user // ignore: cast_nullable_to_non_nullable
                    as UserEntity,
      ),
    );
  }

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UserEntityCopyWith<$Res> get user {
    return $UserEntityCopyWith<$Res>(_value.user, (value) {
      return _then(_value.copyWith(user: value));
    });
  }
}

/// @nodoc

class _$UserLoadedImpl implements UserLoaded {
  const _$UserLoadedImpl({required this.user});

  @override
  final UserEntity user;

  @override
  String toString() {
    return 'UserState.loaded(user: $user)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserLoadedImpl &&
            (identical(other.user, user) || other.user == user));
  }

  @override
  int get hashCode => Object.hash(runtimeType, user);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserLoadedImplCopyWith<_$UserLoadedImpl> get copyWith =>
      __$$UserLoadedImplCopyWithImpl<_$UserLoadedImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) {
    return loaded(user);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) {
    return loaded?.call(user);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
    required TResult orElse(),
  }) {
    if (loaded != null) {
      return loaded(user);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) {
    return loaded(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) {
    return loaded?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) {
    if (loaded != null) {
      return loaded(this);
    }
    return orElse();
  }
}

abstract class UserLoaded implements UserState {
  const factory UserLoaded({required final UserEntity user}) = _$UserLoadedImpl;

  UserEntity get user;

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserLoadedImplCopyWith<_$UserLoadedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$UserListLoadedImplCopyWith<$Res> {
  factory _$$UserListLoadedImplCopyWith(
    _$UserListLoadedImpl value,
    $Res Function(_$UserListLoadedImpl) then,
  ) = __$$UserListLoadedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({List<UserEntity> users});
}

/// @nodoc
class __$$UserListLoadedImplCopyWithImpl<$Res>
    extends _$UserStateCopyWithImpl<$Res, _$UserListLoadedImpl>
    implements _$$UserListLoadedImplCopyWith<$Res> {
  __$$UserListLoadedImplCopyWithImpl(
    _$UserListLoadedImpl _value,
    $Res Function(_$UserListLoadedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? users = null}) {
    return _then(
      _$UserListLoadedImpl(
        users:
            null == users
                ? _value._users
                : users // ignore: cast_nullable_to_non_nullable
                    as List<UserEntity>,
      ),
    );
  }
}

/// @nodoc

class _$UserListLoadedImpl implements UserListLoaded {
  const _$UserListLoadedImpl({required final List<UserEntity> users})
    : _users = users;

  final List<UserEntity> _users;
  @override
  List<UserEntity> get users {
    if (_users is EqualUnmodifiableListView) return _users;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_users);
  }

  @override
  String toString() {
    return 'UserState.listLoaded(users: $users)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserListLoadedImpl &&
            const DeepCollectionEquality().equals(other._users, _users));
  }

  @override
  int get hashCode =>
      Object.hash(runtimeType, const DeepCollectionEquality().hash(_users));

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserListLoadedImplCopyWith<_$UserListLoadedImpl> get copyWith =>
      __$$UserListLoadedImplCopyWithImpl<_$UserListLoadedImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) {
    return listLoaded(users);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) {
    return listLoaded?.call(users);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
    required TResult orElse(),
  }) {
    if (listLoaded != null) {
      return listLoaded(users);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) {
    return listLoaded(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) {
    return listLoaded?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) {
    if (listLoaded != null) {
      return listLoaded(this);
    }
    return orElse();
  }
}

abstract class UserListLoaded implements UserState {
  const factory UserListLoaded({required final List<UserEntity> users}) =
      _$UserListLoadedImpl;

  List<UserEntity> get users;

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserListLoadedImplCopyWith<_$UserListLoadedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$UserErrorImplCopyWith<$Res> {
  factory _$$UserErrorImplCopyWith(
    _$UserErrorImpl value,
    $Res Function(_$UserErrorImpl) then,
  ) = __$$UserErrorImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String message, String? errorCode});
}

/// @nodoc
class __$$UserErrorImplCopyWithImpl<$Res>
    extends _$UserStateCopyWithImpl<$Res, _$UserErrorImpl>
    implements _$$UserErrorImplCopyWith<$Res> {
  __$$UserErrorImplCopyWithImpl(
    _$UserErrorImpl _value,
    $Res Function(_$UserErrorImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? message = null, Object? errorCode = freezed}) {
    return _then(
      _$UserErrorImpl(
        message:
            null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                    as String,
        errorCode:
            freezed == errorCode
                ? _value.errorCode
                : errorCode // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc

class _$UserErrorImpl implements UserError {
  const _$UserErrorImpl({required this.message, this.errorCode});

  @override
  final String message;
  @override
  final String? errorCode;

  @override
  String toString() {
    return 'UserState.error(message: $message, errorCode: $errorCode)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserErrorImpl &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.errorCode, errorCode) ||
                other.errorCode == errorCode));
  }

  @override
  int get hashCode => Object.hash(runtimeType, message, errorCode);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserErrorImplCopyWith<_$UserErrorImpl> get copyWith =>
      __$$UserErrorImplCopyWithImpl<_$UserErrorImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) {
    return error(message, errorCode);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) {
    return error?.call(message, errorCode);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(message, errorCode);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) {
    return error(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) {
    return error?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(this);
    }
    return orElse();
  }
}

abstract class UserError implements UserState {
  const factory UserError({
    required final String message,
    final String? errorCode,
  }) = _$UserErrorImpl;

  String get message;
  String? get errorCode;

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserErrorImplCopyWith<_$UserErrorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$UserCreatingImplCopyWith<$Res> {
  factory _$$UserCreatingImplCopyWith(
    _$UserCreatingImpl value,
    $Res Function(_$UserCreatingImpl) then,
  ) = __$$UserCreatingImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$UserCreatingImplCopyWithImpl<$Res>
    extends _$UserStateCopyWithImpl<$Res, _$UserCreatingImpl>
    implements _$$UserCreatingImplCopyWith<$Res> {
  __$$UserCreatingImplCopyWithImpl(
    _$UserCreatingImpl _value,
    $Res Function(_$UserCreatingImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$UserCreatingImpl implements UserCreating {
  const _$UserCreatingImpl();

  @override
  String toString() {
    return 'UserState.creating()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$UserCreatingImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) {
    return creating();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) {
    return creating?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
    required TResult orElse(),
  }) {
    if (creating != null) {
      return creating();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) {
    return creating(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) {
    return creating?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) {
    if (creating != null) {
      return creating(this);
    }
    return orElse();
  }
}

abstract class UserCreating implements UserState {
  const factory UserCreating() = _$UserCreatingImpl;
}

/// @nodoc
abstract class _$$UserCreatedImplCopyWith<$Res> {
  factory _$$UserCreatedImplCopyWith(
    _$UserCreatedImpl value,
    $Res Function(_$UserCreatedImpl) then,
  ) = __$$UserCreatedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({UserEntity user});

  $UserEntityCopyWith<$Res> get user;
}

/// @nodoc
class __$$UserCreatedImplCopyWithImpl<$Res>
    extends _$UserStateCopyWithImpl<$Res, _$UserCreatedImpl>
    implements _$$UserCreatedImplCopyWith<$Res> {
  __$$UserCreatedImplCopyWithImpl(
    _$UserCreatedImpl _value,
    $Res Function(_$UserCreatedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? user = null}) {
    return _then(
      _$UserCreatedImpl(
        user:
            null == user
                ? _value.user
                : user // ignore: cast_nullable_to_non_nullable
                    as UserEntity,
      ),
    );
  }

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UserEntityCopyWith<$Res> get user {
    return $UserEntityCopyWith<$Res>(_value.user, (value) {
      return _then(_value.copyWith(user: value));
    });
  }
}

/// @nodoc

class _$UserCreatedImpl implements UserCreated {
  const _$UserCreatedImpl({required this.user});

  @override
  final UserEntity user;

  @override
  String toString() {
    return 'UserState.created(user: $user)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserCreatedImpl &&
            (identical(other.user, user) || other.user == user));
  }

  @override
  int get hashCode => Object.hash(runtimeType, user);

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserCreatedImplCopyWith<_$UserCreatedImpl> get copyWith =>
      __$$UserCreatedImplCopyWithImpl<_$UserCreatedImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(UserEntity user) loaded,
    required TResult Function(List<UserEntity> users) listLoaded,
    required TResult Function(String message, String? errorCode) error,
    required TResult Function() creating,
    required TResult Function(UserEntity user) created,
  }) {
    return created(user);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(UserEntity user)? loaded,
    TResult? Function(List<UserEntity> users)? listLoaded,
    TResult? Function(String message, String? errorCode)? error,
    TResult? Function()? creating,
    TResult? Function(UserEntity user)? created,
  }) {
    return created?.call(user);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(UserEntity user)? loaded,
    TResult Function(List<UserEntity> users)? listLoaded,
    TResult Function(String message, String? errorCode)? error,
    TResult Function()? creating,
    TResult Function(UserEntity user)? created,
    required TResult orElse(),
  }) {
    if (created != null) {
      return created(user);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserInitial value) initial,
    required TResult Function(UserLoading value) loading,
    required TResult Function(UserLoaded value) loaded,
    required TResult Function(UserListLoaded value) listLoaded,
    required TResult Function(UserError value) error,
    required TResult Function(UserCreating value) creating,
    required TResult Function(UserCreated value) created,
  }) {
    return created(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserInitial value)? initial,
    TResult? Function(UserLoading value)? loading,
    TResult? Function(UserLoaded value)? loaded,
    TResult? Function(UserListLoaded value)? listLoaded,
    TResult? Function(UserError value)? error,
    TResult? Function(UserCreating value)? creating,
    TResult? Function(UserCreated value)? created,
  }) {
    return created?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserInitial value)? initial,
    TResult Function(UserLoading value)? loading,
    TResult Function(UserLoaded value)? loaded,
    TResult Function(UserListLoaded value)? listLoaded,
    TResult Function(UserError value)? error,
    TResult Function(UserCreating value)? creating,
    TResult Function(UserCreated value)? created,
    required TResult orElse(),
  }) {
    if (created != null) {
      return created(this);
    }
    return orElse();
  }
}

abstract class UserCreated implements UserState {
  const factory UserCreated({required final UserEntity user}) =
      _$UserCreatedImpl;

  UserEntity get user;

  /// Create a copy of UserState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserCreatedImplCopyWith<_$UserCreatedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
