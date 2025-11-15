import '../models/example_model.dart';

/// Local data source interface (for caching)
abstract class ExampleLocalDataSource {
  Future<ExampleModel> getCachedExample(String id);
  Future<void> cacheExample(ExampleModel example);
}

/// Implementation of local data source
class ExampleLocalDataSourceImpl implements ExampleLocalDataSource {
  // final SharedPreferences sharedPreferences; // or Hive/SQLite instance

  ExampleLocalDataSourceImpl();

  @override
  Future<ExampleModel> getCachedExample(String id) async {
    // TODO: Implement cache retrieval
    throw UnimplementedError();
  }

  @override
  Future<void> cacheExample(ExampleModel example) async {
    // TODO: Implement caching
    throw UnimplementedError();
  }
}
