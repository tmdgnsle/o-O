import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/example_entity.dart';
import '../../domain/repositories/example_repository.dart';
import '../datasources/example_local_data_source.dart';
import '../datasources/example_remote_data_source.dart';

/// Repository implementation (data layer)
class ExampleRepositoryImpl implements ExampleRepository {
  final ExampleRemoteDataSource remoteDataSource;
  final ExampleLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  ExampleRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, ExampleEntity>> getExample(String id) async {
    if (await networkInfo.isConnected) {
      try {
        final remoteExample = await remoteDataSource.getExample(id);
        await localDataSource.cacheExample(remoteExample);
        return Right(remoteExample);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      } on NetworkException catch (e) {
        return Left(NetworkFailure(e.message));
      }
    } else {
      try {
        final localExample = await localDataSource.getCachedExample(id);
        return Right(localExample);
      } on CacheException catch (e) {
        return Left(CacheFailure(e.message));
      }
    }
  }

  @override
  Future<Either<Failure, List<ExampleEntity>>> getExamples() async {
    // TODO: Implement
    throw UnimplementedError();
  }
}
