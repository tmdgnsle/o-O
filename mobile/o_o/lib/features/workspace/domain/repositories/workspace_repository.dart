import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/workspace_calendar_entity.dart';
import '../entities/workspace_response.dart';

/// Workspace Repository Interface
abstract class WorkspaceRepository {
  /// Get workspaces with pagination
  Future<Either<Failure, WorkspaceResponse>> getWorkspaces({int? cursor});

  /// Get daily activity keywords (일일 활동 키워드)
  Future<Either<Failure, WorkspaceCalendarEntity>> getDailyActivity({
    required String date,
  });
}
