import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import '../../features/auth/data/datasources/auth_api_data_source.dart';
import '../../features/auth/data/datasources/auth_local_data_source.dart';
import '../../features/auth/data/datasources/auth_remote_data_source.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/record/data/repositories/record_repository_mock.dart';
import '../../features/record/domain/repositories/record_repository.dart';
import '../../features/record/domain/usecases/get_records.dart';
import '../../features/record/presentation/bloc/record_bloc.dart';
import '../../features/recording/data/repositories/recording_repository_impl.dart';
import '../../features/recording/domain/repositories/recording_repository.dart';
import '../../features/recording/domain/usecases/start_recording.dart';
import '../../features/recording/domain/usecases/stop_recording.dart';
import '../../features/recording/presentation/bloc/recording_bloc.dart';
import '../../features/user/data/repositories/user_repository_mock.dart';
import '../../features/user/domain/repositories/user_repository.dart';
import '../../features/user/presentation/bloc/user_bloc.dart';
import '../constants/api_constants.dart';
import '../network/auth_interceptor.dart';

final sl = GetIt.instance;

/// Initialize all dependencies
Future<void> init() async {
  //! External
  // FlutterSecureStorage
  const secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );
  sl.registerLazySingleton(() => secureStorage);

  // AuthLocalDataSource (Dio보다 먼저 등록 - 인터셉터에서 사용)
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(secureStorage: sl()),
  );

  // Dio (AuthInterceptor 포함)
  sl.registerLazySingleton(
    () {
      final dio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {
            'Content-Type': 'application/json',
          },
        ),
      );

      // AuthInterceptor 추가
      dio.interceptors.add(
        AuthInterceptor(
          localDataSource: sl<AuthLocalDataSource>(),
          dio: dio,
        ),
      );

      return dio;
    },
  );

  //! Features - Auth
  // Bloc
  sl.registerFactory(
    () => AuthBloc(
      repository: sl(),
    ),
  );

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      apiDataSource: sl(),
      localDataSource: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(),
  );

  sl.registerLazySingleton<AuthApiDataSource>(
    () => AuthApiDataSourceImpl(dio: sl()),
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
      repository: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => StartRecording(sl()));
  sl.registerLazySingleton(() => StopRecording(sl()));

  // Repository (Real Implementation with STT)
  sl.registerLazySingleton<RecordingRepository>(
    () => RecordingRepositoryImpl(),
  );

  //! Features - Record
  // Bloc
  sl.registerFactory(
    () => RecordBloc(
      getRecords: sl(),
      repository: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetRecords(sl()));

  // Repository (Mock)
  // TODO: 실제 API 구현 시 RecordRepositoryImpl로 교체
  sl.registerLazySingleton<RecordRepository>(
    () => RecordRepositoryMock(),
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
}
