import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/error/exceptions.dart';

/// 인증 토큰을 로컬에 저장/관리하는 DataSource
abstract class AuthLocalDataSource {
  /// Access Token 저장
  Future<void> saveAccessToken(String token);

  /// Access Token 가져오기
  Future<String?> getAccessToken();

  /// Refresh Token 저장
  Future<void> saveRefreshToken(String token);

  /// Refresh Token 가져오기
  Future<String?> getRefreshToken();

  /// User ID 저장
  Future<void> saveUserId(int userId);

  /// User ID 가져오기
  Future<int?> getUserId();

  /// 모든 토큰 삭제 (로그아웃)
  Future<void> clearTokens();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SharedPreferences sharedPreferences;

  static const String _accessTokenKey = 'ACCESS_TOKEN';
  static const String _refreshTokenKey = 'REFRESH_TOKEN';
  static const String _userIdKey = 'USER_ID';

  AuthLocalDataSourceImpl({required this.sharedPreferences});

  @override
  Future<void> saveAccessToken(String token) async {
    try {
      await sharedPreferences.setString(_accessTokenKey, token);
    } catch (e) {
      throw CacheException('Access Token 저장 실패: $e');
    }
  }

  @override
  Future<String?> getAccessToken() async {
    try {
      return sharedPreferences.getString(_accessTokenKey);
    } catch (e) {
      throw CacheException('Access Token 조회 실패: $e');
    }
  }

  @override
  Future<void> saveRefreshToken(String token) async {
    try {
      await sharedPreferences.setString(_refreshTokenKey, token);
    } catch (e) {
      throw CacheException('Refresh Token 저장 실패: $e');
    }
  }

  @override
  Future<String?> getRefreshToken() async {
    try {
      return sharedPreferences.getString(_refreshTokenKey);
    } catch (e) {
      throw CacheException('Refresh Token 조회 실패: $e');
    }
  }

  @override
  Future<void> saveUserId(int userId) async {
    try {
      await sharedPreferences.setInt(_userIdKey, userId);
    } catch (e) {
      throw CacheException('User ID 저장 실패: $e');
    }
  }

  @override
  Future<int?> getUserId() async {
    try {
      return sharedPreferences.getInt(_userIdKey);
    } catch (e) {
      throw CacheException('User ID 조회 실패: $e');
    }
  }

  @override
  Future<void> clearTokens() async {
    try {
      await Future.wait([
        sharedPreferences.remove(_accessTokenKey),
        sharedPreferences.remove(_refreshTokenKey),
        sharedPreferences.remove(_userIdKey),
      ]);
    } catch (e) {
      throw CacheException('토큰 삭제 실패: $e');
    }
  }
}
