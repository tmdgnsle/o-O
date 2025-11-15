import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';
import '../models/mindmap_creation_request.dart';
import '../models/mindmap_creation_response.dart';
import '../models/mindmap_node_model.dart';

/// Mindmap API Data Source
abstract class MindmapApiDataSource {
  /// 워크스페이스 ID로 마인드맵 노드 조회
  Future<List<MindmapNodeModel>> getMindmapNodes(int workspaceId);

  /// STT 텍스트로 마인드맵 생성
  Future<MindmapCreationResponse> createMindmapFromText(String text);
}

/// Mindmap API Data Source Implementation
class MindmapApiDataSourceImpl implements MindmapApiDataSource {
  final Dio dio;

  MindmapApiDataSourceImpl({required this.dio});

  @override
  Future<List<MindmapNodeModel>> getMindmapNodes(int workspaceId) async {
    try {
      final url = ApiConstants.getMindmapNodes(workspaceId);
      logger.i('📡 Fetching mindmap nodes from $url');

      final response = await dio.get(url);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        logger.d('📦 Raw API response: $data');

        final nodes = data
            .map((json) => MindmapNodeModel.fromJson(json as Map<String, dynamic>))
            .toList();

        logger.i('✅ Fetched ${nodes.length} mindmap nodes');

        // 각 노드 상세 로깅 (처음 5개만)
        for (var i = 0; i < nodes.length && i < 5; i++) {
          final node = nodes[i];
          logger.d('  [$i] id: ${node.id}, keyword: "${node.keyword}", parentId: ${node.parentId}, x: ${node.x}, y: ${node.y}');
        }
        if (nodes.length > 5) {
          logger.d('  ... and ${nodes.length - 5} more nodes');
        }

        return nodes;
      } else {
        logger.e('❌ Failed to fetch mindmap nodes: ${response.statusCode}');
        throw ServerException('Failed to fetch mindmap nodes: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      logger.e('📍 Response data: ${e.response?.data}');
      throw ServerException('Failed to fetch mindmap nodes: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to fetch mindmap nodes: $e');
    }
  }

  @override
  Future<MindmapCreationResponse> createMindmapFromText(String text) async {
    try {
      final url = ApiConstants.createMindmapFromStt;
      logger.i('📡 Creating mindmap from text: "$text"');

      final request = MindmapCreationRequest(text: text);
      final response = await dio.post(
        url,
        data: request.toJson(),
      );

      if (response.statusCode == 200 ||
          response.statusCode == 201 ||
          response.statusCode == 202) {
        logger.d('📦 Raw API response: ${response.data}');

        final result = MindmapCreationResponse.fromJson(
          response.data as Map<String, dynamic>,
        );

        logger.i('✅ Mindmap created - workspaceId: ${result.workspaceId}, message: ${result.message}');

        return result;
      } else {
        logger.e('❌ Failed to create mindmap: ${response.statusCode}');
        throw ServerException('Failed to create mindmap: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      logger.e('📍 Response data: ${e.response?.data}');
      throw ServerException('Failed to create mindmap: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to create mindmap: $e');
    }
  }
}
