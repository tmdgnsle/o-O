import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/mindmap.dart';

/// Mindmap Repository 인터페이스
abstract class MindmapRepository {
  /// 워크스페이스 ID로 마인드맵 조회
  Future<Either<Failure, Mindmap>> getMindmapByWorkspaceId(int workspaceId);
}
