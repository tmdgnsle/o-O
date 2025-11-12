// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'workspace_calendar_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

WorkspaceCalendarItemModel _$WorkspaceCalendarItemModelFromJson(
  Map<String, dynamic> json,
) {
  return _WorkspaceCalendarItemModel.fromJson(json);
}

/// @nodoc
mixin _$WorkspaceCalendarItemModel {
  int get workspaceId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;

  /// Serializes this WorkspaceCalendarItemModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WorkspaceCalendarItemModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WorkspaceCalendarItemModelCopyWith<WorkspaceCalendarItemModel>
  get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WorkspaceCalendarItemModelCopyWith<$Res> {
  factory $WorkspaceCalendarItemModelCopyWith(
    WorkspaceCalendarItemModel value,
    $Res Function(WorkspaceCalendarItemModel) then,
  ) =
      _$WorkspaceCalendarItemModelCopyWithImpl<
        $Res,
        WorkspaceCalendarItemModel
      >;
  @useResult
  $Res call({int workspaceId, String title});
}

/// @nodoc
class _$WorkspaceCalendarItemModelCopyWithImpl<
  $Res,
  $Val extends WorkspaceCalendarItemModel
>
    implements $WorkspaceCalendarItemModelCopyWith<$Res> {
  _$WorkspaceCalendarItemModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WorkspaceCalendarItemModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? workspaceId = null, Object? title = null}) {
    return _then(
      _value.copyWith(
            workspaceId:
                null == workspaceId
                    ? _value.workspaceId
                    : workspaceId // ignore: cast_nullable_to_non_nullable
                        as int,
            title:
                null == title
                    ? _value.title
                    : title // ignore: cast_nullable_to_non_nullable
                        as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$WorkspaceCalendarItemModelImplCopyWith<$Res>
    implements $WorkspaceCalendarItemModelCopyWith<$Res> {
  factory _$$WorkspaceCalendarItemModelImplCopyWith(
    _$WorkspaceCalendarItemModelImpl value,
    $Res Function(_$WorkspaceCalendarItemModelImpl) then,
  ) = __$$WorkspaceCalendarItemModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int workspaceId, String title});
}

/// @nodoc
class __$$WorkspaceCalendarItemModelImplCopyWithImpl<$Res>
    extends
        _$WorkspaceCalendarItemModelCopyWithImpl<
          $Res,
          _$WorkspaceCalendarItemModelImpl
        >
    implements _$$WorkspaceCalendarItemModelImplCopyWith<$Res> {
  __$$WorkspaceCalendarItemModelImplCopyWithImpl(
    _$WorkspaceCalendarItemModelImpl _value,
    $Res Function(_$WorkspaceCalendarItemModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceCalendarItemModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? workspaceId = null, Object? title = null}) {
    return _then(
      _$WorkspaceCalendarItemModelImpl(
        workspaceId:
            null == workspaceId
                ? _value.workspaceId
                : workspaceId // ignore: cast_nullable_to_non_nullable
                    as int,
        title:
            null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                    as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$WorkspaceCalendarItemModelImpl extends _WorkspaceCalendarItemModel {
  const _$WorkspaceCalendarItemModelImpl({
    required this.workspaceId,
    required this.title,
  }) : super._();

  factory _$WorkspaceCalendarItemModelImpl.fromJson(
    Map<String, dynamic> json,
  ) => _$$WorkspaceCalendarItemModelImplFromJson(json);

  @override
  final int workspaceId;
  @override
  final String title;

  @override
  String toString() {
    return 'WorkspaceCalendarItemModel(workspaceId: $workspaceId, title: $title)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceCalendarItemModelImpl &&
            (identical(other.workspaceId, workspaceId) ||
                other.workspaceId == workspaceId) &&
            (identical(other.title, title) || other.title == title));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, workspaceId, title);

  /// Create a copy of WorkspaceCalendarItemModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WorkspaceCalendarItemModelImplCopyWith<_$WorkspaceCalendarItemModelImpl>
  get copyWith => __$$WorkspaceCalendarItemModelImplCopyWithImpl<
    _$WorkspaceCalendarItemModelImpl
  >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$WorkspaceCalendarItemModelImplToJson(this);
  }
}

abstract class _WorkspaceCalendarItemModel extends WorkspaceCalendarItemModel {
  const factory _WorkspaceCalendarItemModel({
    required final int workspaceId,
    required final String title,
  }) = _$WorkspaceCalendarItemModelImpl;
  const _WorkspaceCalendarItemModel._() : super._();

  factory _WorkspaceCalendarItemModel.fromJson(Map<String, dynamic> json) =
      _$WorkspaceCalendarItemModelImpl.fromJson;

  @override
  int get workspaceId;
  @override
  String get title;

  /// Create a copy of WorkspaceCalendarItemModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WorkspaceCalendarItemModelImplCopyWith<_$WorkspaceCalendarItemModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}

WorkspaceCalendarModel _$WorkspaceCalendarModelFromJson(
  Map<String, dynamic> json,
) {
  return _WorkspaceCalendarModel.fromJson(json);
}

/// @nodoc
mixin _$WorkspaceCalendarModel {
  String get date => throw _privateConstructorUsedError;
  List<WorkspaceCalendarItemModel> get workspaces =>
      throw _privateConstructorUsedError;

  /// Serializes this WorkspaceCalendarModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WorkspaceCalendarModelCopyWith<WorkspaceCalendarModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WorkspaceCalendarModelCopyWith<$Res> {
  factory $WorkspaceCalendarModelCopyWith(
    WorkspaceCalendarModel value,
    $Res Function(WorkspaceCalendarModel) then,
  ) = _$WorkspaceCalendarModelCopyWithImpl<$Res, WorkspaceCalendarModel>;
  @useResult
  $Res call({String date, List<WorkspaceCalendarItemModel> workspaces});
}

/// @nodoc
class _$WorkspaceCalendarModelCopyWithImpl<
  $Res,
  $Val extends WorkspaceCalendarModel
>
    implements $WorkspaceCalendarModelCopyWith<$Res> {
  _$WorkspaceCalendarModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? date = null, Object? workspaces = null}) {
    return _then(
      _value.copyWith(
            date:
                null == date
                    ? _value.date
                    : date // ignore: cast_nullable_to_non_nullable
                        as String,
            workspaces:
                null == workspaces
                    ? _value.workspaces
                    : workspaces // ignore: cast_nullable_to_non_nullable
                        as List<WorkspaceCalendarItemModel>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$WorkspaceCalendarModelImplCopyWith<$Res>
    implements $WorkspaceCalendarModelCopyWith<$Res> {
  factory _$$WorkspaceCalendarModelImplCopyWith(
    _$WorkspaceCalendarModelImpl value,
    $Res Function(_$WorkspaceCalendarModelImpl) then,
  ) = __$$WorkspaceCalendarModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String date, List<WorkspaceCalendarItemModel> workspaces});
}

/// @nodoc
class __$$WorkspaceCalendarModelImplCopyWithImpl<$Res>
    extends
        _$WorkspaceCalendarModelCopyWithImpl<$Res, _$WorkspaceCalendarModelImpl>
    implements _$$WorkspaceCalendarModelImplCopyWith<$Res> {
  __$$WorkspaceCalendarModelImplCopyWithImpl(
    _$WorkspaceCalendarModelImpl _value,
    $Res Function(_$WorkspaceCalendarModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? date = null, Object? workspaces = null}) {
    return _then(
      _$WorkspaceCalendarModelImpl(
        date:
            null == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                    as String,
        workspaces:
            null == workspaces
                ? _value._workspaces
                : workspaces // ignore: cast_nullable_to_non_nullable
                    as List<WorkspaceCalendarItemModel>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$WorkspaceCalendarModelImpl extends _WorkspaceCalendarModel {
  const _$WorkspaceCalendarModelImpl({
    required this.date,
    required final List<WorkspaceCalendarItemModel> workspaces,
  }) : _workspaces = workspaces,
       super._();

  factory _$WorkspaceCalendarModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$WorkspaceCalendarModelImplFromJson(json);

  @override
  final String date;
  final List<WorkspaceCalendarItemModel> _workspaces;
  @override
  List<WorkspaceCalendarItemModel> get workspaces {
    if (_workspaces is EqualUnmodifiableListView) return _workspaces;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_workspaces);
  }

  @override
  String toString() {
    return 'WorkspaceCalendarModel(date: $date, workspaces: $workspaces)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceCalendarModelImpl &&
            (identical(other.date, date) || other.date == date) &&
            const DeepCollectionEquality().equals(
              other._workspaces,
              _workspaces,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    date,
    const DeepCollectionEquality().hash(_workspaces),
  );

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WorkspaceCalendarModelImplCopyWith<_$WorkspaceCalendarModelImpl>
  get copyWith =>
      __$$WorkspaceCalendarModelImplCopyWithImpl<_$WorkspaceCalendarModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$WorkspaceCalendarModelImplToJson(this);
  }
}

abstract class _WorkspaceCalendarModel extends WorkspaceCalendarModel {
  const factory _WorkspaceCalendarModel({
    required final String date,
    required final List<WorkspaceCalendarItemModel> workspaces,
  }) = _$WorkspaceCalendarModelImpl;
  const _WorkspaceCalendarModel._() : super._();

  factory _WorkspaceCalendarModel.fromJson(Map<String, dynamic> json) =
      _$WorkspaceCalendarModelImpl.fromJson;

  @override
  String get date;
  @override
  List<WorkspaceCalendarItemModel> get workspaces;

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WorkspaceCalendarModelImplCopyWith<_$WorkspaceCalendarModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
