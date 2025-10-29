// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$UserEvent {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String id) getUser,
    required TResult Function() getUsers,
    required TResult Function(UserEntity user) createUser,
    required TResult Function(UserEntity user) updateUser,
    required TResult Function(String id) deleteUser,
    required TResult Function() refreshUsers,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String id)? getUser,
    TResult? Function()? getUsers,
    TResult? Function(UserEntity user)? createUser,
    TResult? Function(UserEntity user)? updateUser,
    TResult? Function(String id)? deleteUser,
    TResult? Function()? refreshUsers,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String id)? getUser,
    TResult Function()? getUsers,
    TResult Function(UserEntity user)? createUser,
    TResult Function(UserEntity user)? updateUser,
    TResult Function(String id)? deleteUser,
    TResult Function()? refreshUsers,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetUserEvent value) getUser,
    required TResult Function(GetUsersEvent value) getUsers,
    required TResult Function(CreateUserEvent value) createUser,
    required TResult Function(UpdateUserEvent value) updateUser,
    required TResult Function(DeleteUserEvent value) deleteUser,
    required TResult Function(RefreshUsersEvent value) refreshUsers,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetUserEvent value)? getUser,
    TResult? Function(GetUsersEvent value)? getUsers,
    TResult? Function(CreateUserEvent value)? createUser,
    TResult? Function(UpdateUserEvent value)? updateUser,
    TResult? Function(DeleteUserEvent value)? deleteUser,
    TResult? Function(RefreshUsersEvent value)? refreshUsers,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetUserEvent value)? getUser,
    TResult Function(GetUsersEvent value)? getUsers,
    TResult Function(CreateUserEvent value)? createUser,
    TResult Function(UpdateUserEvent value)? updateUser,
    TResult Function(DeleteUserEvent value)? deleteUser,
    TResult Function(RefreshUsersEvent value)? refreshUsers,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserEventCopyWith<$Res> {
  factory $UserEventCopyWith(UserEvent value, $Res Function(UserEvent) then) =
      _$UserEventCopyWithImpl<$Res, UserEvent>;
}

/// @nodoc
class _$UserEventCopyWithImpl<$Res, $Val extends UserEvent>
    implements $UserEventCopyWith<$Res> {
  _$UserEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$GetUserEventImplCopyWith<$Res> {
  factory _$$GetUserEventImplCopyWith(
    _$GetUserEventImpl value,
    $Res Function(_$GetUserEventImpl) then,
  ) = __$$GetUserEventImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String id});
}

/// @nodoc
class __$$GetUserEventImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$GetUserEventImpl>
    implements _$$GetUserEventImplCopyWith<$Res> {
  __$$GetUserEventImplCopyWithImpl(
    _$GetUserEventImpl _value,
    $Res Function(_$GetUserEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null}) {
    return _then(
      _$GetUserEventImpl(
        id:
            null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                    as String,
      ),
    );
  }
}

/// @nodoc

class _$GetUserEventImpl implements GetUserEvent {
  const _$GetUserEventImpl({required this.id});

  @override
  final String id;

  @override
  String toString() {
    return 'UserEvent.getUser(id: $id)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GetUserEventImpl &&
            (identical(other.id, id) || other.id == id));
  }

  @override
  int get hashCode => Object.hash(runtimeType, id);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GetUserEventImplCopyWith<_$GetUserEventImpl> get copyWith =>
      __$$GetUserEventImplCopyWithImpl<_$GetUserEventImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String id) getUser,
    required TResult Function() getUsers,
    required TResult Function(UserEntity user) createUser,
    required TResult Function(UserEntity user) updateUser,
    required TResult Function(String id) deleteUser,
    required TResult Function() refreshUsers,
  }) {
    return getUser(id);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String id)? getUser,
    TResult? Function()? getUsers,
    TResult? Function(UserEntity user)? createUser,
    TResult? Function(UserEntity user)? updateUser,
    TResult? Function(String id)? deleteUser,
    TResult? Function()? refreshUsers,
  }) {
    return getUser?.call(id);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String id)? getUser,
    TResult Function()? getUsers,
    TResult Function(UserEntity user)? createUser,
    TResult Function(UserEntity user)? updateUser,
    TResult Function(String id)? deleteUser,
    TResult Function()? refreshUsers,
    required TResult orElse(),
  }) {
    if (getUser != null) {
      return getUser(id);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetUserEvent value) getUser,
    required TResult Function(GetUsersEvent value) getUsers,
    required TResult Function(CreateUserEvent value) createUser,
    required TResult Function(UpdateUserEvent value) updateUser,
    required TResult Function(DeleteUserEvent value) deleteUser,
    required TResult Function(RefreshUsersEvent value) refreshUsers,
  }) {
    return getUser(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetUserEvent value)? getUser,
    TResult? Function(GetUsersEvent value)? getUsers,
    TResult? Function(CreateUserEvent value)? createUser,
    TResult? Function(UpdateUserEvent value)? updateUser,
    TResult? Function(DeleteUserEvent value)? deleteUser,
    TResult? Function(RefreshUsersEvent value)? refreshUsers,
  }) {
    return getUser?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetUserEvent value)? getUser,
    TResult Function(GetUsersEvent value)? getUsers,
    TResult Function(CreateUserEvent value)? createUser,
    TResult Function(UpdateUserEvent value)? updateUser,
    TResult Function(DeleteUserEvent value)? deleteUser,
    TResult Function(RefreshUsersEvent value)? refreshUsers,
    required TResult orElse(),
  }) {
    if (getUser != null) {
      return getUser(this);
    }
    return orElse();
  }
}

abstract class GetUserEvent implements UserEvent {
  const factory GetUserEvent({required final String id}) = _$GetUserEventImpl;

  String get id;

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GetUserEventImplCopyWith<_$GetUserEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$GetUsersEventImplCopyWith<$Res> {
  factory _$$GetUsersEventImplCopyWith(
    _$GetUsersEventImpl value,
    $Res Function(_$GetUsersEventImpl) then,
  ) = __$$GetUsersEventImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$GetUsersEventImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$GetUsersEventImpl>
    implements _$$GetUsersEventImplCopyWith<$Res> {
  __$$GetUsersEventImplCopyWithImpl(
    _$GetUsersEventImpl _value,
    $Res Function(_$GetUsersEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$GetUsersEventImpl implements GetUsersEvent {
  const _$GetUsersEventImpl();

  @override
  String toString() {
    return 'UserEvent.getUsers()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$GetUsersEventImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String id) getUser,
    required TResult Function() getUsers,
    required TResult Function(UserEntity user) createUser,
    required TResult Function(UserEntity user) updateUser,
    required TResult Function(String id) deleteUser,
    required TResult Function() refreshUsers,
  }) {
    return getUsers();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String id)? getUser,
    TResult? Function()? getUsers,
    TResult? Function(UserEntity user)? createUser,
    TResult? Function(UserEntity user)? updateUser,
    TResult? Function(String id)? deleteUser,
    TResult? Function()? refreshUsers,
  }) {
    return getUsers?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String id)? getUser,
    TResult Function()? getUsers,
    TResult Function(UserEntity user)? createUser,
    TResult Function(UserEntity user)? updateUser,
    TResult Function(String id)? deleteUser,
    TResult Function()? refreshUsers,
    required TResult orElse(),
  }) {
    if (getUsers != null) {
      return getUsers();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetUserEvent value) getUser,
    required TResult Function(GetUsersEvent value) getUsers,
    required TResult Function(CreateUserEvent value) createUser,
    required TResult Function(UpdateUserEvent value) updateUser,
    required TResult Function(DeleteUserEvent value) deleteUser,
    required TResult Function(RefreshUsersEvent value) refreshUsers,
  }) {
    return getUsers(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetUserEvent value)? getUser,
    TResult? Function(GetUsersEvent value)? getUsers,
    TResult? Function(CreateUserEvent value)? createUser,
    TResult? Function(UpdateUserEvent value)? updateUser,
    TResult? Function(DeleteUserEvent value)? deleteUser,
    TResult? Function(RefreshUsersEvent value)? refreshUsers,
  }) {
    return getUsers?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetUserEvent value)? getUser,
    TResult Function(GetUsersEvent value)? getUsers,
    TResult Function(CreateUserEvent value)? createUser,
    TResult Function(UpdateUserEvent value)? updateUser,
    TResult Function(DeleteUserEvent value)? deleteUser,
    TResult Function(RefreshUsersEvent value)? refreshUsers,
    required TResult orElse(),
  }) {
    if (getUsers != null) {
      return getUsers(this);
    }
    return orElse();
  }
}

abstract class GetUsersEvent implements UserEvent {
  const factory GetUsersEvent() = _$GetUsersEventImpl;
}

/// @nodoc
abstract class _$$CreateUserEventImplCopyWith<$Res> {
  factory _$$CreateUserEventImplCopyWith(
    _$CreateUserEventImpl value,
    $Res Function(_$CreateUserEventImpl) then,
  ) = __$$CreateUserEventImplCopyWithImpl<$Res>;
  @useResult
  $Res call({UserEntity user});

  $UserEntityCopyWith<$Res> get user;
}

/// @nodoc
class __$$CreateUserEventImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$CreateUserEventImpl>
    implements _$$CreateUserEventImplCopyWith<$Res> {
  __$$CreateUserEventImplCopyWithImpl(
    _$CreateUserEventImpl _value,
    $Res Function(_$CreateUserEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? user = null}) {
    return _then(
      _$CreateUserEventImpl(
        user:
            null == user
                ? _value.user
                : user // ignore: cast_nullable_to_non_nullable
                    as UserEntity,
      ),
    );
  }

  /// Create a copy of UserEvent
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

class _$CreateUserEventImpl implements CreateUserEvent {
  const _$CreateUserEventImpl({required this.user});

  @override
  final UserEntity user;

  @override
  String toString() {
    return 'UserEvent.createUser(user: $user)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateUserEventImpl &&
            (identical(other.user, user) || other.user == user));
  }

  @override
  int get hashCode => Object.hash(runtimeType, user);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateUserEventImplCopyWith<_$CreateUserEventImpl> get copyWith =>
      __$$CreateUserEventImplCopyWithImpl<_$CreateUserEventImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String id) getUser,
    required TResult Function() getUsers,
    required TResult Function(UserEntity user) createUser,
    required TResult Function(UserEntity user) updateUser,
    required TResult Function(String id) deleteUser,
    required TResult Function() refreshUsers,
  }) {
    return createUser(user);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String id)? getUser,
    TResult? Function()? getUsers,
    TResult? Function(UserEntity user)? createUser,
    TResult? Function(UserEntity user)? updateUser,
    TResult? Function(String id)? deleteUser,
    TResult? Function()? refreshUsers,
  }) {
    return createUser?.call(user);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String id)? getUser,
    TResult Function()? getUsers,
    TResult Function(UserEntity user)? createUser,
    TResult Function(UserEntity user)? updateUser,
    TResult Function(String id)? deleteUser,
    TResult Function()? refreshUsers,
    required TResult orElse(),
  }) {
    if (createUser != null) {
      return createUser(user);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetUserEvent value) getUser,
    required TResult Function(GetUsersEvent value) getUsers,
    required TResult Function(CreateUserEvent value) createUser,
    required TResult Function(UpdateUserEvent value) updateUser,
    required TResult Function(DeleteUserEvent value) deleteUser,
    required TResult Function(RefreshUsersEvent value) refreshUsers,
  }) {
    return createUser(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetUserEvent value)? getUser,
    TResult? Function(GetUsersEvent value)? getUsers,
    TResult? Function(CreateUserEvent value)? createUser,
    TResult? Function(UpdateUserEvent value)? updateUser,
    TResult? Function(DeleteUserEvent value)? deleteUser,
    TResult? Function(RefreshUsersEvent value)? refreshUsers,
  }) {
    return createUser?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetUserEvent value)? getUser,
    TResult Function(GetUsersEvent value)? getUsers,
    TResult Function(CreateUserEvent value)? createUser,
    TResult Function(UpdateUserEvent value)? updateUser,
    TResult Function(DeleteUserEvent value)? deleteUser,
    TResult Function(RefreshUsersEvent value)? refreshUsers,
    required TResult orElse(),
  }) {
    if (createUser != null) {
      return createUser(this);
    }
    return orElse();
  }
}

abstract class CreateUserEvent implements UserEvent {
  const factory CreateUserEvent({required final UserEntity user}) =
      _$CreateUserEventImpl;

  UserEntity get user;

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateUserEventImplCopyWith<_$CreateUserEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$UpdateUserEventImplCopyWith<$Res> {
  factory _$$UpdateUserEventImplCopyWith(
    _$UpdateUserEventImpl value,
    $Res Function(_$UpdateUserEventImpl) then,
  ) = __$$UpdateUserEventImplCopyWithImpl<$Res>;
  @useResult
  $Res call({UserEntity user});

  $UserEntityCopyWith<$Res> get user;
}

/// @nodoc
class __$$UpdateUserEventImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$UpdateUserEventImpl>
    implements _$$UpdateUserEventImplCopyWith<$Res> {
  __$$UpdateUserEventImplCopyWithImpl(
    _$UpdateUserEventImpl _value,
    $Res Function(_$UpdateUserEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? user = null}) {
    return _then(
      _$UpdateUserEventImpl(
        user:
            null == user
                ? _value.user
                : user // ignore: cast_nullable_to_non_nullable
                    as UserEntity,
      ),
    );
  }

  /// Create a copy of UserEvent
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

class _$UpdateUserEventImpl implements UpdateUserEvent {
  const _$UpdateUserEventImpl({required this.user});

  @override
  final UserEntity user;

  @override
  String toString() {
    return 'UserEvent.updateUser(user: $user)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UpdateUserEventImpl &&
            (identical(other.user, user) || other.user == user));
  }

  @override
  int get hashCode => Object.hash(runtimeType, user);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UpdateUserEventImplCopyWith<_$UpdateUserEventImpl> get copyWith =>
      __$$UpdateUserEventImplCopyWithImpl<_$UpdateUserEventImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String id) getUser,
    required TResult Function() getUsers,
    required TResult Function(UserEntity user) createUser,
    required TResult Function(UserEntity user) updateUser,
    required TResult Function(String id) deleteUser,
    required TResult Function() refreshUsers,
  }) {
    return updateUser(user);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String id)? getUser,
    TResult? Function()? getUsers,
    TResult? Function(UserEntity user)? createUser,
    TResult? Function(UserEntity user)? updateUser,
    TResult? Function(String id)? deleteUser,
    TResult? Function()? refreshUsers,
  }) {
    return updateUser?.call(user);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String id)? getUser,
    TResult Function()? getUsers,
    TResult Function(UserEntity user)? createUser,
    TResult Function(UserEntity user)? updateUser,
    TResult Function(String id)? deleteUser,
    TResult Function()? refreshUsers,
    required TResult orElse(),
  }) {
    if (updateUser != null) {
      return updateUser(user);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetUserEvent value) getUser,
    required TResult Function(GetUsersEvent value) getUsers,
    required TResult Function(CreateUserEvent value) createUser,
    required TResult Function(UpdateUserEvent value) updateUser,
    required TResult Function(DeleteUserEvent value) deleteUser,
    required TResult Function(RefreshUsersEvent value) refreshUsers,
  }) {
    return updateUser(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetUserEvent value)? getUser,
    TResult? Function(GetUsersEvent value)? getUsers,
    TResult? Function(CreateUserEvent value)? createUser,
    TResult? Function(UpdateUserEvent value)? updateUser,
    TResult? Function(DeleteUserEvent value)? deleteUser,
    TResult? Function(RefreshUsersEvent value)? refreshUsers,
  }) {
    return updateUser?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetUserEvent value)? getUser,
    TResult Function(GetUsersEvent value)? getUsers,
    TResult Function(CreateUserEvent value)? createUser,
    TResult Function(UpdateUserEvent value)? updateUser,
    TResult Function(DeleteUserEvent value)? deleteUser,
    TResult Function(RefreshUsersEvent value)? refreshUsers,
    required TResult orElse(),
  }) {
    if (updateUser != null) {
      return updateUser(this);
    }
    return orElse();
  }
}

abstract class UpdateUserEvent implements UserEvent {
  const factory UpdateUserEvent({required final UserEntity user}) =
      _$UpdateUserEventImpl;

  UserEntity get user;

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UpdateUserEventImplCopyWith<_$UpdateUserEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$DeleteUserEventImplCopyWith<$Res> {
  factory _$$DeleteUserEventImplCopyWith(
    _$DeleteUserEventImpl value,
    $Res Function(_$DeleteUserEventImpl) then,
  ) = __$$DeleteUserEventImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String id});
}

/// @nodoc
class __$$DeleteUserEventImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$DeleteUserEventImpl>
    implements _$$DeleteUserEventImplCopyWith<$Res> {
  __$$DeleteUserEventImplCopyWithImpl(
    _$DeleteUserEventImpl _value,
    $Res Function(_$DeleteUserEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null}) {
    return _then(
      _$DeleteUserEventImpl(
        id:
            null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                    as String,
      ),
    );
  }
}

/// @nodoc

class _$DeleteUserEventImpl implements DeleteUserEvent {
  const _$DeleteUserEventImpl({required this.id});

  @override
  final String id;

  @override
  String toString() {
    return 'UserEvent.deleteUser(id: $id)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DeleteUserEventImpl &&
            (identical(other.id, id) || other.id == id));
  }

  @override
  int get hashCode => Object.hash(runtimeType, id);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DeleteUserEventImplCopyWith<_$DeleteUserEventImpl> get copyWith =>
      __$$DeleteUserEventImplCopyWithImpl<_$DeleteUserEventImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String id) getUser,
    required TResult Function() getUsers,
    required TResult Function(UserEntity user) createUser,
    required TResult Function(UserEntity user) updateUser,
    required TResult Function(String id) deleteUser,
    required TResult Function() refreshUsers,
  }) {
    return deleteUser(id);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String id)? getUser,
    TResult? Function()? getUsers,
    TResult? Function(UserEntity user)? createUser,
    TResult? Function(UserEntity user)? updateUser,
    TResult? Function(String id)? deleteUser,
    TResult? Function()? refreshUsers,
  }) {
    return deleteUser?.call(id);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String id)? getUser,
    TResult Function()? getUsers,
    TResult Function(UserEntity user)? createUser,
    TResult Function(UserEntity user)? updateUser,
    TResult Function(String id)? deleteUser,
    TResult Function()? refreshUsers,
    required TResult orElse(),
  }) {
    if (deleteUser != null) {
      return deleteUser(id);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetUserEvent value) getUser,
    required TResult Function(GetUsersEvent value) getUsers,
    required TResult Function(CreateUserEvent value) createUser,
    required TResult Function(UpdateUserEvent value) updateUser,
    required TResult Function(DeleteUserEvent value) deleteUser,
    required TResult Function(RefreshUsersEvent value) refreshUsers,
  }) {
    return deleteUser(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetUserEvent value)? getUser,
    TResult? Function(GetUsersEvent value)? getUsers,
    TResult? Function(CreateUserEvent value)? createUser,
    TResult? Function(UpdateUserEvent value)? updateUser,
    TResult? Function(DeleteUserEvent value)? deleteUser,
    TResult? Function(RefreshUsersEvent value)? refreshUsers,
  }) {
    return deleteUser?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetUserEvent value)? getUser,
    TResult Function(GetUsersEvent value)? getUsers,
    TResult Function(CreateUserEvent value)? createUser,
    TResult Function(UpdateUserEvent value)? updateUser,
    TResult Function(DeleteUserEvent value)? deleteUser,
    TResult Function(RefreshUsersEvent value)? refreshUsers,
    required TResult orElse(),
  }) {
    if (deleteUser != null) {
      return deleteUser(this);
    }
    return orElse();
  }
}

abstract class DeleteUserEvent implements UserEvent {
  const factory DeleteUserEvent({required final String id}) =
      _$DeleteUserEventImpl;

  String get id;

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DeleteUserEventImplCopyWith<_$DeleteUserEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$RefreshUsersEventImplCopyWith<$Res> {
  factory _$$RefreshUsersEventImplCopyWith(
    _$RefreshUsersEventImpl value,
    $Res Function(_$RefreshUsersEventImpl) then,
  ) = __$$RefreshUsersEventImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RefreshUsersEventImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$RefreshUsersEventImpl>
    implements _$$RefreshUsersEventImplCopyWith<$Res> {
  __$$RefreshUsersEventImplCopyWithImpl(
    _$RefreshUsersEventImpl _value,
    $Res Function(_$RefreshUsersEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RefreshUsersEventImpl implements RefreshUsersEvent {
  const _$RefreshUsersEventImpl();

  @override
  String toString() {
    return 'UserEvent.refreshUsers()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RefreshUsersEventImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String id) getUser,
    required TResult Function() getUsers,
    required TResult Function(UserEntity user) createUser,
    required TResult Function(UserEntity user) updateUser,
    required TResult Function(String id) deleteUser,
    required TResult Function() refreshUsers,
  }) {
    return refreshUsers();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String id)? getUser,
    TResult? Function()? getUsers,
    TResult? Function(UserEntity user)? createUser,
    TResult? Function(UserEntity user)? updateUser,
    TResult? Function(String id)? deleteUser,
    TResult? Function()? refreshUsers,
  }) {
    return refreshUsers?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String id)? getUser,
    TResult Function()? getUsers,
    TResult Function(UserEntity user)? createUser,
    TResult Function(UserEntity user)? updateUser,
    TResult Function(String id)? deleteUser,
    TResult Function()? refreshUsers,
    required TResult orElse(),
  }) {
    if (refreshUsers != null) {
      return refreshUsers();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetUserEvent value) getUser,
    required TResult Function(GetUsersEvent value) getUsers,
    required TResult Function(CreateUserEvent value) createUser,
    required TResult Function(UpdateUserEvent value) updateUser,
    required TResult Function(DeleteUserEvent value) deleteUser,
    required TResult Function(RefreshUsersEvent value) refreshUsers,
  }) {
    return refreshUsers(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetUserEvent value)? getUser,
    TResult? Function(GetUsersEvent value)? getUsers,
    TResult? Function(CreateUserEvent value)? createUser,
    TResult? Function(UpdateUserEvent value)? updateUser,
    TResult? Function(DeleteUserEvent value)? deleteUser,
    TResult? Function(RefreshUsersEvent value)? refreshUsers,
  }) {
    return refreshUsers?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetUserEvent value)? getUser,
    TResult Function(GetUsersEvent value)? getUsers,
    TResult Function(CreateUserEvent value)? createUser,
    TResult Function(UpdateUserEvent value)? updateUser,
    TResult Function(DeleteUserEvent value)? deleteUser,
    TResult Function(RefreshUsersEvent value)? refreshUsers,
    required TResult orElse(),
  }) {
    if (refreshUsers != null) {
      return refreshUsers(this);
    }
    return orElse();
  }
}

abstract class RefreshUsersEvent implements UserEvent {
  const factory RefreshUsersEvent() = _$RefreshUsersEventImpl;
}
