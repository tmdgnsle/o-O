import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/workspace_calendar_entity.dart';
import '../entities/workspace_response.dart';

/// Workspace Repository Interface
abstract class WorkspaceRepository {
  /// Get workspaces with pagination
  Future<Either<Failure, WorkspaceResponse>> getWorkspaces({int? cursor});

  /// Get workspace calendar (날짜별 워크스페이스 활동)
  Future<Either<Failure, List<WorkspaceCalendarEntity>>> getCalendar({
    required String from,
    required String to,
  });
}
