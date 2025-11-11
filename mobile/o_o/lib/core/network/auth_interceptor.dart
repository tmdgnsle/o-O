import 'package:dio/dio.dart';

import '../../features/auth/data/datasources/auth_local_data_source.dart';
import '../constants/api_constants.dart';
import '../utils/app_logger.dart';

/// 인증 토큰을 자동으로 관리하는 Dio 인터셉터
///
/// 기능:
/// 1. 모든 요청에 AccessToken을 Authorization 헤더에 자동 추가
/// 2. 401 에러 발생 시 RefreshToken으로 토큰 재발급
/// 3. 재발급 성공 시 원래 요청 재시도
class AuthInterceptor extends Interceptor {
  final AuthLocalDataSource localDataSource;
  final Dio dio;

  AuthInterceptor({
    required this.localDataSource,
    required this.dio,
  });

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // 로그인 API는 토큰 없이 요청
    if (options.path.contains('/auth/login')) {
      return handler.next(options);
    }

    try {
      // SecureStorage에서 AccessToken 가져오기
      final accessToken = await localDataSource.getAccessToken();

      if (accessToken != null && accessToken.isNotEmpty) {
        // Authorization 헤더에 AccessToken 추가
        options.headers['Authorization'] = accessToken;
        logger.d('🔐 Authorization 헤더 추가: $accessToken');
      }
    } catch (e) {
      logger.e('❌ AccessToken 조회 실패: $e');
    }

    return handler.next(options);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // 401 Unauthorized 에러 처리
    if (err.response?.statusCode == 401) {
      logger.w('⚠️ 401 Unauthorized - 토큰 재발급 시도');

      try {
        // 1. RefreshToken 가져오기
        final refreshToken = await localDataSource.getRefreshToken();

        if (refreshToken == null || refreshToken.isEmpty) {
          logger.e('❌ RefreshToken이 없습니다. 로그아웃 필요.');
          return handler.next(err);
        }

        // 2. 토큰 재발급 API 호출
        final newTokens = await _refreshTokens(refreshToken);

        // 3. 새 토큰 저장
        await localDataSource.saveAccessToken(newTokens['accessToken']!);
        await localDataSource.saveRefreshToken(newTokens['refreshToken']!);

        logger.i('🔑 새 Access Token: ${newTokens['accessToken']!.substring(0, 20)}...');
        logger.i('🔄 새 Refresh Token: ${newTokens['refreshToken']!.substring(0, 20)}...');

        logger.i('✅ 토큰 재발급 성공!');

        // 4. 원래 요청 재시도
        final options = err.requestOptions;
        options.headers['Authorization'] = newTokens['accessToken'];

        final response = await dio.fetch(options);
        return handler.resolve(response);
      } catch (e) {
        logger.e('❌ 토큰 재발급 실패: $e');
        // 재발급 실패 시 로그아웃 처리 필요
        await localDataSource.clearTokens();
        return handler.next(err);
      }
    }

    return handler.next(err);
  }

  /// 토큰 재발급 API 호출
  ///
  /// POST /auth/reissue
  /// Cookie: refreshToken=<refresh_token>
  ///
  /// Returns: {
  ///   'accessToken': String,
  ///   'refreshToken': String,
  /// }
  Future<Map<String, String>> _refreshTokens(String refreshToken) async {
    try {
      logger.i('🔄 토큰 재발급 API 호출...');

      // 별도의 Dio 인스턴스로 재발급 요청 (무한 루프 방지)
      final refreshDio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'refreshToken=$refreshToken',
          },
        ),
      );

      final response = await refreshDio.post(ApiConstants.reissue);

      logger.i('✅ 토큰 재발급 응답 받음');

      // Authorization 헤더에서 새 Access Token 추출
      final newAccessToken = response.headers.value('authorization');
      if (newAccessToken == null) {
        throw Exception('Authorization 헤더가 응답에 포함되지 않았습니다.');
      }

      // Set-Cookie 헤더에서 새 Refresh Token 추출
      final setCookieHeader = response.headers.value('set-cookie');
      String? newRefreshToken;

      if (setCookieHeader != null) {
        final cookieParts = setCookieHeader.split(';');
        for (var part in cookieParts) {
          if (part.trim().startsWith('refreshToken=')) {
            newRefreshToken = part.trim().substring('refreshToken='.length);
            break;
          }
        }
      }

      if (newRefreshToken == null) {
        throw Exception('Set-Cookie 헤더에서 Refresh Token을 찾을 수 없습니다.');
      }

      logger.i('🔑 새 Access Token: ${newAccessToken.substring(0, 20)}...');
      logger.i('🔄 새 Refresh Token: ${newRefreshToken.substring(0, 20)}...');

      return {
        'accessToken': newAccessToken,
        'refreshToken': newRefreshToken,
      };
    } catch (e) {
      logger.e('❌ 토큰 재발급 실패: $e');
      rethrow;
    }
  }
}
