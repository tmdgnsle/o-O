import 'package:get_it/get_it.dart';

import '../../features/auth/data/repositories/auth_repository_mock.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/recording/data/repositories/recording_repository_mock.dart';
import '../../features/recording/domain/repositories/recording_repository.dart';
import '../../features/recording/domain/usecases/start_recording.dart';
import '../../features/recording/domain/usecases/stop_recording.dart';
import '../../features/recording/presentation/bloc/recording_bloc.dart';
import '../../features/user/data/repositories/user_repository_mock.dart';
import '../../features/user/domain/repositories/user_repository.dart';
import '../../features/user/presentation/bloc/user_bloc.dart';

final sl = GetIt.instance;

/// Initialize all dependencies
Future<void> init() async {
  //! Features - Auth
  // Bloc
  sl.registerFactory(
    () => AuthBloc(
      repository: sl(),
    ),
  );

  // Repository (Mock)
  // TODO: 실제 Google Sign-In 구현 시 AuthRepositoryImpl로 교체
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryMock(),
  );

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

  //! Features - Recording
  // Bloc
  sl.registerFactory(
    () => RecordingBloc(
      startRecording: sl(),
      stopRecording: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => StartRecording(sl()));
  sl.registerLazySingleton(() => StopRecording(sl()));

  // Repository (Mock)
  // TODO: 실제 녹음 기능 구현 시 RecordingRepositoryImpl로 교체
  sl.registerLazySingleton<RecordingRepository>(
    () => RecordingRepositoryMock(),
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
