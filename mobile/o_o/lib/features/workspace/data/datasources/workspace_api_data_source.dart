import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';
import '../models/workspace_calendar_model.dart';
import '../models/workspace_response_model.dart';

/// Workspace API Data Source
abstract class WorkspaceApiDataSource {
  /// Get workspaces with pagination
  Future<WorkspaceResponseModel> getWorkspaces({int? cursor});

  /// Get workspace calendar
  Future<List<WorkspaceCalendarModel>> getCalendar({
    required String from,
    required String to,
  });
}

/// Workspace API Data Source Implementation
class WorkspaceApiDataSourceImpl implements WorkspaceApiDataSource {
  final Dio dio;

  WorkspaceApiDataSourceImpl({required this.dio});

  @override
  Future<WorkspaceResponseModel> getWorkspaces({int? cursor}) async {
    try {
      logger.i('📡 Fetching workspaces from ${ApiConstants.getWorkspaces} with cursor: $cursor');

      final response = await dio.get(
        ApiConstants.getWorkspaces,
        queryParameters: {
          'category': 'recent',
          if (cursor != null) 'cursor': cursor,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        logger.d('📦 Raw API response: $data');

        final workspaceResponse = WorkspaceResponseModel.fromJson(data);

        logger.i('✅ Fetched ${workspaceResponse.workspaces.length} workspaces, hasNext: ${workspaceResponse.hasNext}, nextCursor: ${workspaceResponse.nextCursor}');

        // 각 워크스페이스 상세 로깅
        for (var i = 0; i < workspaceResponse.workspaces.length; i++) {
          final workspace = workspaceResponse.workspaces[i];
          logger.d('  [$i] id: ${workspace.id}, title: "${workspace.title}", thumbnail: ${workspace.thumbnail ?? "null"}');
        }

        return workspaceResponse;
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

  @override
  Future<List<WorkspaceCalendarModel>> getCalendar({
    required String from,
    required String to,
  }) async {
    try {
      logger.i('📡 Fetching calendar from ${ApiConstants.getWorkspaceCalendar} (from: $from, to: $to)');

      final response = await dio.get(
        ApiConstants.getWorkspaceCalendar,
        queryParameters: {
          'from': from,
          'to': to,
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        final calendar = data
            .map((json) => WorkspaceCalendarModel.fromJson(json as Map<String, dynamic>))
            .toList();

        logger.i('✅ Fetched ${calendar.length} calendar entries');
        return calendar;
      } else {
        logger.e('❌ Failed to fetch calendar: ${response.statusCode}');
        throw ServerException('Failed to fetch calendar: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      throw ServerException('Failed to fetch calendar: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to fetch calendar: $e');
    }
  }
}
