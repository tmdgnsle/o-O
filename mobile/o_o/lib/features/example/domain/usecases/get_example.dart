import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/example_entity.dart';
import '../repositories/example_repository.dart';

/// Use case for getting a single example
class GetExample implements UseCase<ExampleEntity, GetExampleParams> {
  final ExampleRepository repository;

  GetExample(this.repository);

  @override
  Future<Either<Failure, ExampleEntity>> call(GetExampleParams params) async {
    return await repository.getExample(params.id);
  }
}

class GetExampleParams extends Equatable {
  final String id;

  const GetExampleParams({required this.id});

  @override
  List<Object> get props => [id];
}
