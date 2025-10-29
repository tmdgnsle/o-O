import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/di/injection_container.dart' as di;
import 'core/router/app_router.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/record/presentation/bloc/record_bloc.dart';
import 'features/recording/presentation/bloc/recording_bloc.dart';
import 'features/user/presentation/bloc/user_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 시스템 UI 설정 - 상태바/네비게이션바 투명화
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // DI Container 초기화
  await di.init();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        // AuthBloc Provider
        BlocProvider(
          create: (context) => di.sl<AuthBloc>(),
        ),
        // UserBloc Provider
        BlocProvider(
          create: (context) => di.sl<UserBloc>(),
        ),
        // RecordingBloc Provider
        BlocProvider(
          create: (context) => di.sl<RecordingBloc>(),
        ),
        // RecordBloc Provider
        BlocProvider(
          create: (context) => di.sl<RecordBloc>(),
        ),
      ],
      child: MaterialApp.router(
        title: 'o_o Project',
        theme: ThemeData(
          useMaterial3: true,
          fontFamily: 'Paperlogy',
        ),
        routerConfig: AppRouter.router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
