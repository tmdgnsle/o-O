import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';
import '../models/workspace_model.dart';

/// Workspace API Data Source
abstract class WorkspaceApiDataSource {
  /// Get all workspaces
  Future<List<WorkspaceModel>> getWorkspaces();
}

/// Workspace API Data Source Implementation
class WorkspaceApiDataSourceImpl implements WorkspaceApiDataSource {
  final Dio dio;

  WorkspaceApiDataSourceImpl({required this.dio});

  @override
  Future<List<WorkspaceModel>> getWorkspaces() async {
    try {
      logger.i('📡 Fetching workspaces from ${ApiConstants.getWorkspaces}');

      final response = await dio.get(ApiConstants.getWorkspaces);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        final workspaces = data.map((json) => WorkspaceModel.fromJson(json as Map<String, dynamic>)).toList();

        logger.i('✅ Fetched ${workspaces.length} workspaces');
        return workspaces;
      } else {
        logger.e('❌ Failed to fetch workspaces: ${response.statusCode}');
        throw ServerException('Failed to fetch workspaces: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      throw ServerException('Failed to fetch workspaces: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to fetch workspaces: $e');
    }
  }
}
