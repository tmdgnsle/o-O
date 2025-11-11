import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/workspace.dart';
import '../../domain/repositories/workspace_repository.dart';
import '../datasources/workspace_api_data_source.dart';

/// Workspace Repository Implementation
class WorkspaceRepositoryImpl implements WorkspaceRepository {
  final WorkspaceApiDataSource apiDataSource;

  WorkspaceRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Failure, List<Workspace>>> getWorkspaces() async {
    try {
      final models = await apiDataSource.getWorkspaces();
      final entities = models.map((model) => model.toEntity()).toList();
      return Right(entities);
    } on ServerException catch (e) {
      logger.e('❌ ServerException in repository: ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e) {
      logger.e('❌ Unexpected error in repository: $e');
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
}
