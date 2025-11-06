import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/example_entity.dart';

/// Repository interface (domain layer)
/// This is implemented in the data layer
abstract class ExampleRepository {
  Future<Either<Failure, ExampleEntity>> getExample(String id);
  Future<Either<Failure, List<ExampleEntity>>> getExamples();
}
