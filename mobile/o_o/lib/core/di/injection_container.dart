import 'package:get_it/get_it.dart';

import '../../features/user/data/repositories/user_repository_mock.dart';
import '../../features/user/domain/repositories/user_repository.dart';
import '../../features/user/presentation/bloc/user_bloc.dart';

final sl = GetIt.instance;

/// Initialize all dependencies
Future<void> init() async {
  //! Features - User
  // Bloc
  sl.registerFactory(
    () => UserBloc(
      repository: sl(),
    ),
  );

  // Repository (Mock)
  // TODO: 실제 API 구현 시 UserRepositoryImpl로 교체
  sl.registerLazySingleton<UserRepository>(
    () => UserRepositoryMock(),
  );

  //! Features - Example
  // Bloc
  // sl.registerFactory(
  //   () => ExampleBloc(
  //     getExample: sl(),
  //   ),
  // );

  // Use cases
  // sl.registerLazySingleton(() => GetExample(sl()));

  // Repository
  // sl.registerLazySingleton<ExampleRepository>(
  //   () => ExampleRepositoryImpl(
  //     remoteDataSource: sl(),
  //     localDataSource: sl(),
  //     networkInfo: sl(),
  //   ),
  // );

  // Data sources
  // sl.registerLazySingleton<ExampleRemoteDataSource>(
  //   () => ExampleRemoteDataSourceImpl(client: sl()),
  // );

  // sl.registerLazySingleton<ExampleLocalDataSource>(
  //   () => ExampleLocalDataSourceImpl(),
  // );

  //! Core
  // sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl(sl()));

  //! External
  // final sharedPreferences = await SharedPreferences.getInstance();
  // sl.registerLazySingleton(() => sharedPreferences);
  // sl.registerLazySingleton(() => http.Client());
  // sl.registerLazySingleton(() => InternetConnectionChecker());
}
