import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/workspace_calendar_entity.dart';

part 'workspace_calendar_model.freezed.dart';
part 'workspace_calendar_model.g.dart';

/// Workspace Calendar Item Model
@freezed
class WorkspaceCalendarItemModel with _$WorkspaceCalendarItemModel {
  const WorkspaceCalendarItemModel._();

  const factory WorkspaceCalendarItemModel({
    required int workspaceId,
    required String title,
  }) = _WorkspaceCalendarItemModel;

  factory WorkspaceCalendarItemModel.fromJson(Map<String, dynamic> json) =>
      _$WorkspaceCalendarItemModelFromJson(json);

  /// Convert to Entity
  WorkspaceCalendarItem toEntity() {
    return WorkspaceCalendarItem(
      workspaceId: workspaceId,
      title: title,
    );
  }
}

/// Workspace Calendar Model
@freezed
class WorkspaceCalendarModel with _$WorkspaceCalendarModel {
  const WorkspaceCalendarModel._();

  const factory WorkspaceCalendarModel({
    required String date,
    required List<WorkspaceCalendarItemModel> workspaces,
  }) = _WorkspaceCalendarModel;

  factory WorkspaceCalendarModel.fromJson(Map<String, dynamic> json) =>
      _$WorkspaceCalendarModelFromJson(json);

  /// Convert to Entity
  WorkspaceCalendarEntity toEntity() {
    return WorkspaceCalendarEntity(
      date: date,
      workspaces: workspaces.map((model) => model.toEntity()).toList(),
    );
  }
}
