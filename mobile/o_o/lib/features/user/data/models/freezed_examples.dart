/// Freezed 사용 예제 모음
///
/// 이 파일은 Freezed의 다양한 사용법을 보여주는 예제입니다.
/// 실제 프로젝트에서는 필요없는 파일이므로 참고만 하세요.

import 'user_model.dart';
import '../../domain/entities/user_entity.dart';

void freezedExamples() {
  // ============================================
  // 1. 기본 사용법 - 불변 객체 생성
  // ============================================
  const user = UserEntity(
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true,
  );

  print(user.name); // John Doe

  // ============================================
  // 2. copyWith - 일부 값만 변경
  // ============================================
  final updatedUser = user.copyWith(
    name: 'Jane Doe', // name만 변경
  ); // id, email, isActive는 그대로 유지

  print(updatedUser.name); // Jane Doe
  print(updatedUser.email); // john@example.com (변경 안됨)

  // ============================================
  // 3. == 연산자 (자동 생성됨)
  // ============================================
  const user2 = UserEntity(
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true,
  );

  print(user == user2); // true (값이 같으면 같은 객체로 판단)

  // ============================================
  // 4. toString (자동 생성됨)
  // ============================================
  print(user.toString());
  // UserEntity(id: 1, name: John Doe, email: john@example.com, ...)

  // ============================================
  // 5. Custom methods
  // ============================================
  print(user.displayName); // Custom getter 사용

  // ============================================
  // 6. JSON 직렬화/역직렬화
  // ============================================
  const model = UserModel(
    id: '1',
    name: 'John',
    email: 'john@example.com',
  );

  // toJson
  final json = model.toJson();
  print(json);
  // {id: 1, name: John, email: john@example.com, avatar_url: null, is_active: false}

  // fromJson
  final modelFromJson = UserModel.fromJson({
    'id': '2',
    'name': 'Jane',
    'email': 'jane@example.com',
    'avatar_url': 'https://example.com/avatar.jpg',
    'is_active': true,
  });
  print(modelFromJson.name); // Jane

  // ============================================
  // 7. Nullable과 Default 값
  // ============================================
  const userWithDefaults = UserEntity(
    id: '3',
    name: 'Bob',
    email: 'bob@example.com',
    // avatarUrl: null,  // 생략 가능 (nullable)
    // isActive: false,  // 생략 가능 (default: false)
  );

  print(userWithDefaults.avatarUrl); // ''  (기본값)
  print(userWithDefaults.isActive); // false (기본값)
}
