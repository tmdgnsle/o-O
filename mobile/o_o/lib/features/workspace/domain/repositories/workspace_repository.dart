import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/workspace.dart';

/// Workspace Repository Interface
abstract class WorkspaceRepository {
  /// Get all workspaces
  Future<Either<Failure, List<Workspace>>> getWorkspaces();
}
