import '../models/example_model.dart';

/// Remote data source interface
abstract class ExampleRemoteDataSource {
  Future<ExampleModel> getExample(String id);
  Future<List<ExampleModel>> getExamples();
}

/// Implementation of remote data source
class ExampleRemoteDataSourceImpl implements ExampleRemoteDataSource {
  // final http.Client client; // or Dio instance

  ExampleRemoteDataSourceImpl();

  @override
  Future<ExampleModel> getExample(String id) async {
    // TODO: Implement API call
    throw UnimplementedError();
  }

  @override
  Future<List<ExampleModel>> getExamples() async {
    // TODO: Implement API call
    throw UnimplementedError();
  }
}
