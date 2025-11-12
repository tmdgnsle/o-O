// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workspace_calendar_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WorkspaceCalendarItemModelImpl _$$WorkspaceCalendarItemModelImplFromJson(
  Map<String, dynamic> json,
) => _$WorkspaceCalendarItemModelImpl(
  workspaceId: (json['workspaceId'] as num).toInt(),
  title: json['title'] as String,
);

Map<String, dynamic> _$$WorkspaceCalendarItemModelImplToJson(
  _$WorkspaceCalendarItemModelImpl instance,
) => <String, dynamic>{
  'workspaceId': instance.workspaceId,
  'title': instance.title,
};

_$WorkspaceCalendarModelImpl _$$WorkspaceCalendarModelImplFromJson(
  Map<String, dynamic> json,
) => _$WorkspaceCalendarModelImpl(
  date: json['date'] as String,
  workspaces:
      (json['workspaces'] as List<dynamic>)
          .map(
            (e) =>
                WorkspaceCalendarItemModel.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
);

Map<String, dynamic> _$$WorkspaceCalendarModelImplToJson(
  _$WorkspaceCalendarModelImpl instance,
) => <String, dynamic>{
  'date': instance.date,
  'workspaces': instance.workspaces,
};
