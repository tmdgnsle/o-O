import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/workspace_calendar_entity.dart';
import '../../domain/entities/workspace_response.dart';
import '../../domain/repositories/workspace_repository.dart';
import '../datasources/workspace_api_data_source.dart';

/// Workspace Repository Implementation
class WorkspaceRepositoryImpl implements WorkspaceRepository {
  final WorkspaceApiDataSource apiDataSource;

  WorkspaceRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Failure, WorkspaceResponse>> getWorkspaces({int? cursor}) async {
    try {
      final responseModel = await apiDataSource.getWorkspaces(cursor: cursor);
      final entity = responseModel.toEntity();
      return Right(entity);
    } on ServerException catch (e) {
      logger.e('❌ ServerException in repository: ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e) {
      logger.e('❌ Unexpected error in repository: $e');
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }

  @override
  Future<Either<Failure, WorkspaceCalendarEntity>> getDailyActivity({
    required String date,
  }) async {
    try {
      final model = await apiDataSource.getDailyActivity(date: date);
      final entity = model.toEntity();
      return Right(entity);
    } on ServerException catch (e) {
      logger.e('❌ ServerException in repository: ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e) {
      logger.e('❌ Unexpected error in repository: $e');
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
}
