import 'package:equatable/equatable.dart';

/// Workspace Calendar Item Entity
class WorkspaceCalendarItem extends Equatable {
  final int workspaceId;
  final String title;

  const WorkspaceCalendarItem({
    required this.workspaceId,
    required this.title,
  });

  @override
  List<Object?> get props => [workspaceId, title];
}

/// Workspace Calendar Entity (날짜별 워크스페이스 목록)
class WorkspaceCalendarEntity extends Equatable {
  final String date;
  final List<WorkspaceCalendarItem> workspaces;

  const WorkspaceCalendarEntity({
    required this.date,
    required this.workspaces,
  });

  @override
  List<Object?> get props => [date, workspaces];
}
