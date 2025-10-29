# Freezed 사용 가이드

Freezed는 Dart에서 불변(immutable) 클래스를 쉽게 만들 수 있게 해주는 코드 생성 패키지입니다.

## 왜 Freezed를 사용하나요?

Freezed를 사용하면 다음이 자동으로 생성됩니다:
- `copyWith` 메서드
- `==` 연산자와 `hashCode`
- `toString` 메서드
- JSON 직렬화/역직렬화 (json_serializable과 함께)
- Union types (sealed classes)

## 설치

`pubspec.yaml`에 이미 추가되어 있습니다:

```yaml
dependencies:
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

dev_dependencies:
  freezed: ^2.4.7
  json_serializable: ^6.7.1
  build_runner: ^2.4.6
```

## 기본 사용법

### 1. 간단한 데이터 클래스

**파일**: `lib/features/user/domain/entities/user_entity.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_entity.freezed.dart';

@freezed
class UserEntity with _$UserEntity {
  const factory UserEntity({
    required String id,
    required String name,
    required String email,
    String? avatarUrl,
    @Default(false) bool isActive,
  }) = _UserEntity;
}
```

### 2. JSON 직렬화가 포함된 모델

**파일**: `lib/features/user/data/models/user_model.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';  // JSON 직렬화용

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    @JsonKey(name: 'avatar_url') String? avatarUrl,  // JSON 키 매핑
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

### 3. Union Types (Sealed Classes)

**파일**: `lib/features/user/presentation/bloc/user_state.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_state.freezed.dart';

@freezed
class UserState with _$UserState {
  const factory UserState.initial() = UserInitial;
  const factory UserState.loading() = UserLoading;
  const factory UserState.loaded({required UserEntity user}) = UserLoaded;
  const factory UserState.error({required String message}) = UserError;
}
```

## 코드 생성

Freezed 클래스를 작성한 후 다음 명령어를 실행하세요:

```bash
# 한 번만 실행
dart run build_runner build

# 파일 변경 감지 (개발 중 권장)
dart run build_runner watch

# 기존 생성 파일 삭제 후 재생성
dart run build_runner build --delete-conflicting-outputs
```

> **참고**: `flutter pub run` 명령어는 deprecated 되었습니다. 대신 `dart run`을 사용하세요.

## 주요 기능

### copyWith

불변 객체의 일부 값만 변경한 새 객체 생성:

```dart
final user = UserEntity(
  id: '1',
  name: 'John',
  email: 'john@example.com',
);

final updatedUser = user.copyWith(name: 'Jane');
// id와 email은 그대로, name만 'Jane'으로 변경
```

### when/map으로 상태 처리

**when**: 각 케이스의 값에만 접근

```dart
state.when(
  initial: () => Text('Initial'),
  loading: () => CircularProgressIndicator(),
  loaded: (user) => Text(user.name),  // user 값에 직접 접근
  error: (message) => Text(message),
);
```

**map**: state 객체 전체에 접근

```dart
state.map(
  initial: (_) => Text('Initial'),
  loading: (_) => CircularProgressIndicator(),
  loaded: (state) => Text(state.user.name),  // state.user로 접근
  error: (state) => Text(state.message),
);
```

**maybeWhen**: 일부 케이스만 처리

```dart
state.maybeWhen(
  loading: () => CircularProgressIndicator(),
  error: (message) => Text('Error: $message'),
  orElse: () => Text('Other state'),  // 나머지 모든 케이스
);
```

### 기본값 설정

```dart
@freezed
class UserSettings with _$UserSettings {
  const factory UserSettings({
    @Default(true) bool notifications,
    @Default('en') String language,
    @Default([]) List<String> tags,
  }) = _UserSettings;
}
```

### JSON 키 매핑

```dart
@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    @JsonKey(name: 'user_id') required String id,
    @JsonKey(name: 'full_name') required String name,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

### 커스텀 메서드 추가

```dart
@freezed
class UserEntity with _$UserEntity {
  const factory UserEntity({
    required String id,
    required String name,
    required String email,
  }) = _UserEntity;

  // Private constructor 필요
  const UserEntity._();

  // 커스텀 getter
  String get displayName => name.isEmpty ? email : name;

  // 커스텀 메서드
  bool isEmailValid() {
    return email.contains('@');
  }
}
```

## BLoC에서 Freezed 사용

### Event

```dart
@freezed
class UserEvent with _$UserEvent {
  const factory UserEvent.getUser({required String id}) = GetUserEvent;
  const factory UserEvent.createUser({required UserEntity user}) = CreateUserEvent;
  const factory UserEvent.deleteUser({required String id}) = DeleteUserEvent;
}
```

### State

```dart
@freezed
class UserState with _$UserState {
  const factory UserState.initial() = UserInitial;
  const factory UserState.loading() = UserLoading;
  const factory UserState.success({required UserEntity user}) = UserSuccess;
  const factory UserState.error({required String message}) = UserError;
}
```

### BLoC

```dart
class UserBloc extends Bloc<UserEvent, UserState> {
  UserBloc() : super(const UserState.initial()) {
    on<UserEvent>((event, emit) async {
      await event.when(
        getUser: (id) => _onGetUser(id, emit),
        createUser: (user) => _onCreateUser(user, emit),
        deleteUser: (id) => _onDeleteUser(id, emit),
      );
    });
  }

  Future<void> _onGetUser(String id, Emitter<UserState> emit) async {
    emit(const UserState.loading());
    // ... 로직
    emit(UserState.success(user: user));
  }
}
```

## 복잡한 예제

### Nested Models

**파일**: `lib/features/user/data/models/api_response.dart`

```dart
@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String userId,
    required UserSettings settings,  // Nested freezed object
    @Default([]) List<String> tags,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}

@freezed
class UserSettings with _$UserSettings {
  const factory UserSettings({
    @Default(true) bool notifications,
  }) = _UserSettings;

  factory UserSettings.fromJson(Map<String, dynamic> json) =>
      _$UserSettingsFromJson(json);
}
```

### Generic Union Types

```dart
@freezed
class ApiResponse<T> with _$ApiResponse<T> {
  const factory ApiResponse.success({required T data}) = ApiSuccess<T>;
  const factory ApiResponse.error({required String message}) = ApiError<T>;
  const factory ApiResponse.loading() = ApiLoading<T>;
}

// 사용
ApiResponse<UserEntity> response = ApiResponse.success(data: user);

response.when(
  success: (data) => print('User: ${data.name}'),
  error: (message) => print('Error: $message'),
  loading: () => print('Loading...'),
);
```

## 프로젝트 구조에서의 위치

```
lib/features/your_feature/
├── domain/
│   └── entities/
│       └── user_entity.dart              # Freezed (JSON 없음)
├── data/
│   └── models/
│       └── user_model.dart               # Freezed + JSON
└── presentation/
    └── bloc/
        ├── user_event.dart               # Freezed Union
        └── user_state.dart               # Freezed Union
```

## 팁과 주의사항

1. **part 파일 선언을 잊지 마세요**
   ```dart
   part 'file_name.freezed.dart';  // 항상 필요
   part 'file_name.g.dart';        // JSON 직렬화 시 필요
   ```

2. **커스텀 메서드는 private constructor 아래에**
   ```dart
   const factory User(...) = _User;
   const User._();  // 이게 있어야 커스텀 메서드 추가 가능
   ```

3. **Equatable vs Freezed**
   - Freezed가 더 많은 기능 제공
   - JSON 직렬화가 필요하면 Freezed 권장
   - 단순 비교만 필요하면 Equatable도 충분

4. **build_runner watch 사용**
   - 개발 중에는 `build_runner watch` 실행
   - 파일 변경 시 자동으로 재생성

5. **생성된 파일은 Git에 커밋**
   - `.freezed.dart`와 `.g.dart` 파일은 커밋하세요
   - 다른 개발자가 build_runner 없이도 빌드 가능

## 자주 발생하는 에러

### 1. "part 'xxx.freezed.dart' not found"
**해결**: `dart run build_runner build` 실행

### 2. "Conflicting outputs"
**해결**: `dart run build_runner build --delete-conflicting-outputs`

### 3. JSON 직렬화가 안 됨
**해결**: `part 'xxx.g.dart';` 추가했는지 확인

### 4. "flutter pub run is deprecated"
**해결**: `dart run`을 사용하세요. `flutter pub run build_runner`는 더 이상 사용되지 않습니다.

## 참고 자료

- [Freezed 공식 문서](https://pub.dev/packages/freezed)
- [json_serializable 문서](https://pub.dev/packages/json_serializable)
- 프로젝트 예제:
  - `lib/features/user/` - 완전한 Freezed 예제
  - `lib/features/user/data/models/api_response.dart` - Union types 예제
