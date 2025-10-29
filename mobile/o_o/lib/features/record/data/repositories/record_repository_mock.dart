import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../domain/entities/record_entity.dart';
import '../../domain/repositories/record_repository.dart';

/// Mock implementation of RecordRepository
/// TODO: 실제 API 구현 시 RecordRepositoryImpl로 교체
class RecordRepositoryMock implements RecordRepository {
  // 더미 데이터
  final List<RecordEntity> _mockRecords = List.generate(
    20,
    (index) {
      // 다양한 길이의 텍스트
      final contents = [
        '나는 알고리즘을 싫어해. 왜냐하면 재미가 없고, 문제를 푸는 데 너무 오래 걸리기 때문이야. 그리고 무는 망식을 만들면 평생 풀 수 없어! 수학이랑 비슷하다고 느껴져...',
        '오늘 회의에서 새로운 프로젝트 아이디어가 나왔어. 사용자 경험을 개선하고, 성능을 최적화하며, 새로운 기능들을 추가하는 거야. 팀원들 모두 열정적으로 의견을 나눴고, 다음 주부터 본격적으로 시작할 계획이야. 정말 기대되는 프로젝트야!',
        '점심으로 뭐 먹을지 고민 중이야. 파스타? 아니면 김치찌개? 날씨도 좋고 밖에 나가서 먹고 싶은데...',
        '최근에 읽은 책이 정말 인상 깊었어. 주인공의 성장 과정과 그가 마주한 도전들, 그리고 그것을 극복하는 과정이 너무 감동적이었어. 특히 마지막 장면은 정말 잊을 수 없을 것 같아. 작가의 문체도 아름답고, 이야기 전개도 탄탄해서 몰입도가 정말 높았어. 다음 책도 기대되네!',
        '주말에 등산 가는 게 어때? 날씨 좋을 때 운동도 하고 자연도 즐기고!',
      ];

      return RecordEntity(
        id: 'record_${index + 1}',
        title: '${2025}.${10}.${28} ${10}:00',
        content: contents[index % contents.length],
        createdAt: DateTime(2025, 10, 28, 10, 0).subtract(Duration(days: index)),
        audioUrl: 'https://example.com/audio_${index + 1}.mp3',
      );
    },
  );

  @override
  Future<Either<Failure, List<RecordEntity>>> getRecords() async {
    try {
      // API 호출 시뮬레이션
      await Future.delayed(const Duration(milliseconds: 800));

      // 성공 응답
      return Right(_mockRecords);
    } catch (e) {
      return Left(ServerFailure('Failed to fetch records: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Failure, RecordEntity>> getRecord(String id) async {
    try {
      // API 호출 시뮬레이션
      await Future.delayed(const Duration(milliseconds: 500));

      final record = _mockRecords.firstWhere(
        (record) => record.id == id,
        orElse: () => throw Exception('Record not found'),
      );

      return Right(record);
    } catch (e) {
      return Left(ServerFailure('Failed to fetch record: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Failure, void>> deleteRecord(String id) async {
    try {
      // API 호출 시뮬레이션
      await Future.delayed(const Duration(milliseconds: 500));

      _mockRecords.removeWhere((record) => record.id == id);

      return const Right(null);
    } catch (e) {
      return Left(ServerFailure('Failed to delete record: ${e.toString()}'));
    }
  }
}
