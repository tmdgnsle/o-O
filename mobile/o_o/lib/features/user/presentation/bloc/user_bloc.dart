import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/usecases/usecase.dart';
import '../../../../core/utils/app_logger.dart';
import '../../../workspace/domain/usecases/get_workspace_calendar.dart';
import '../../domain/usecases/get_user_info.dart';
import 'user_event.dart';
import 'user_state.dart';

/// User BLoC
class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserInfo getUserInfo;
  final GetWorkspaceCalendar getWorkspaceCalendar;

  UserBloc({
    required this.getUserInfo,
    required this.getWorkspaceCalendar,
  }) : super(const UserState.initial()) {
    on<LoadUserInfo>(_onLoadUserInfo);
    on<RefreshUserInfo>(_onRefreshUserInfo);
    on<LoadCalendar>(_onLoadCalendar);
  }

  Future<void> _onLoadUserInfo(
    LoadUserInfo event,
    Emitter<UserState> emit,
  ) async {
    emit(const UserState.loading());

    final result = await getUserInfo(NoParams());

    result.fold(
      (failure) => emit(const UserState.error(message: '사용자 정보를 불러올 수 없습니다')),
      (user) => emit(UserState.loaded(user: user)),
    );
  }

  Future<void> _onRefreshUserInfo(
    RefreshUserInfo event,
    Emitter<UserState> emit,
  ) async {
    // Refresh without showing loading state
    final result = await getUserInfo(NoParams());

    result.fold(
      (failure) => emit(const UserState.error(message: '사용자 정보를 불러올 수 없습니다')),
      (user) => emit(UserState.loaded(user: user)),
    );
  }

  Future<void> _onLoadCalendar(
    LoadCalendar event,
    Emitter<UserState> emit,
  ) async {
    logger.i('📅 [UserBloc] LoadCalendar 이벤트 수신');

    // 현재 상태가 loaded가 아니면 return
    final currentState = state;
    logger.i('📊 [UserBloc] 현재 상태: ${currentState.runtimeType}');

    if (currentState is! UserLoaded) {
      logger.w('⚠️ [UserBloc] UserLoaded 상태가 아님 - 캘린더 로드 중단');
      return;
    }

    // 오늘 날짜 가져오기
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    logger.i('📆 [UserBloc] 오늘 날짜: $today');

    // 캘린더 API 호출 (from, to 모두 오늘 날짜)
    logger.i('🌐 [UserBloc] 캘린더 API 호출 시작 (from: $today, to: $today)');
    final result = await getWorkspaceCalendar(
      CalendarParams(from: today, to: today),
    );

    result.fold(
      (failure) {
        logger.e('❌ [UserBloc] 캘린더 API 실패: ${failure.toString()}');
        // 에러 발생 시 현재 상태 유지 (키워드는 빈 리스트)
        emit(UserState.loaded(
          user: currentState.user,
          keywords: [],
        ));
        logger.i('📤 [UserBloc] 빈 키워드 리스트로 상태 업데이트');
      },
      (calendarList) {
        logger.i('✅ [UserBloc] 캘린더 API 성공 - ${calendarList.length}개의 날짜 데이터');

        // 모든 날짜의 workspace title들을 추출
        final keywords = calendarList
            .expand((calendar) => calendar.workspaces)
            .toList();

        logger.i('🔑 [UserBloc] 추출된 키워드: ${keywords.length}개');
        for (var keyword in keywords) {
          logger.d('  - workspaceId: ${keyword.workspaceId}, title: "${keyword.title}"');
        }

        emit(UserState.loaded(
          user: currentState.user,
          keywords: keywords,
        ));
        logger.i('📤 [UserBloc] 키워드와 함께 상태 업데이트 완료');
      },
    );
  }
}
