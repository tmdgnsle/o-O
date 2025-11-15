# Flutter Clean Architecture with BLoC

이 프로젝트는 Clean Architecture 원칙과 BLoC 패턴을 사용합니다.

## 디렉토리 구조

```
lib/
├── core/
│   ├── error/
│   │   ├── exceptions.dart        # Exception 클래스들
│   │   └── failures.dart          # Failure 클래스들
│   ├── network/
│   │   └── network_info.dart      # 네트워크 연결 확인 인터페이스
│   ├── usecases/
│   │   └── usecase.dart           # UseCase 베이스 클래스
│   ├── utils/                     # 유틸리티 함수들
│   └── constants/                 # 상수 정의
│
└── features/
    └── [feature_name]/
        ├── data/
        │   ├── models/            # JSON 직렬화/역직렬화 모델
        │   ├── datasources/       # Remote/Local 데이터 소스
        │   └── repositories/      # Repository 구현체
        │
        ├── domain/
        │   ├── entities/          # 순수 Dart 엔티티
        │   ├── repositories/      # Repository 인터페이스
        │   └── usecases/          # 비즈니스 로직
        │
        └── presentation/
            ├── bloc/              # BLoC (Event, State, Bloc)
            ├── pages/             # 화면 페이지
            └── widgets/           # 재사용 가능한 위젯
```

## 계층 설명

### 1. Domain Layer (도메인 계층)
- **Entities**: 비즈니스 로직의 핵심 객체
- **Repositories**: 데이터 접근을 위한 인터페이스 (구현은 Data Layer에서)
- **Use Cases**: 하나의 비즈니스 로직을 담당

### 2. Data Layer (데이터 계층)
- **Models**: Entity를 확장하여 JSON 변환 기능 추가
- **Data Sources**:
  - Remote: API 통신
  - Local: 로컬 캐시 (SharedPreferences, Hive, SQLite 등)
- **Repository Implementation**: Domain의 Repository 인터페이스 구현

### 3. Presentation Layer (프레젠테이션 계층)
- **BLoC**:
  - Event: 사용자 액션
  - State: UI 상태
  - Bloc: Event를 받아 UseCase 실행 후 State 방출
- **Pages**: 화면 단위 위젯
- **Widgets**: 재사용 가능한 컴포넌트

## 의존성 방향

```
Presentation → Domain ← Data
```

- Presentation과 Data는 Domain에만 의존
- Domain은 다른 계층에 의존하지 않음 (순수 Dart)
- 외부 패키지 의존성은 Data와 Presentation에만 존재

## 필수 패키지

```yaml
dependencies:
  flutter_bloc: ^8.1.3         # BLoC 상태관리
  equatable: ^2.0.5            # 값 비교
  dartz: ^0.10.1               # Either (성공/실패 처리)
  get_it: ^7.6.4               # 의존성 주입
  freezed_annotation: ^2.4.1   # Freezed 어노테이션
  json_annotation: ^4.8.1      # JSON 직렬화 어노테이션

dev_dependencies:
  bloc_test: ^9.1.5            # BLoC 테스트
  mockito: ^5.4.2              # 목 객체 생성
  freezed: ^2.4.7              # 불변 클래스 생성
  json_serializable: ^6.7.1    # JSON 직렬화 생성
  build_runner: ^2.4.6         # 코드 생성 실행
```

## Freezed 사용

이 프로젝트는 Freezed를 사용하여 불변 클래스를 생성합니다.

**코드 생성 명령어:**
```bash
# 한 번만 실행
dart run build_runner build

# 파일 변경 감지 (개발 중 권장)
dart run build_runner watch

# 충돌 발생 시
dart run build_runner build --delete-conflicting-outputs
```

> **참고**: `flutter pub run`은 deprecated 되었습니다. `dart run`을 사용하세요.

**자세한 사용법은 `FREEZED_GUIDE.md`를 참고하세요.**

## 새로운 Feature 추가 방법

1. **Domain Layer 작성**
   ```
   features/your_feature/domain/
   ├── entities/your_entity.dart
   ├── repositories/your_repository.dart
   └── usecases/get_your_entity.dart
   ```

2. **Data Layer 작성**
   ```
   features/your_feature/data/
   ├── models/your_model.dart
   ├── datasources/your_remote_data_source.dart
   ├── datasources/your_local_data_source.dart
   └── repositories/your_repository_impl.dart
   ```

3. **Presentation Layer 작성**
   ```
   features/your_feature/presentation/
   ├── bloc/your_event.dart
   ├── bloc/your_state.dart
   ├── bloc/your_bloc.dart
   ├── pages/your_page.dart
   └── widgets/your_widget.dart
   ```

## BLoC 사용 예시

```dart
// 1. BLoC 제공
BlocProvider(
  create: (context) => YourBloc(
    useCase: getIt<YourUseCase>(),
  ),
  child: YourPage(),
)

// 2. Event 발생
context.read<YourBloc>().add(GetYourEvent());

// 3. State 구독
BlocBuilder<YourBloc, YourState>(
  builder: (context, state) {
    if (state is YourLoading) return CircularProgressIndicator();
    if (state is YourLoaded) return YourWidget(data: state.data);
    if (state is YourError) return Text(state.message);
    return SizedBox();
  },
)
```

## 에러 처리

- **Exceptions**: Data Layer에서 발생 (ServerException, CacheException 등)
- **Failures**: Domain Layer로 변환 (ServerFailure, CacheFailure 등)
- **Either<Failure, Success>**: dartz 패키지를 사용한 함수형 에러 처리

## 테스트

각 계층별로 독립적인 테스트 작성:
- **Unit Tests**: Domain (UseCase, Entity)
- **Widget Tests**: Presentation (Widget, Page)
- **Integration Tests**: 전체 플로우

## 참고 자료

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Flutter BLoC Documentation](https://bloclibrary.dev/)
- [Reso Coder's Flutter TDD Clean Architecture](https://resocoder.com/flutter-clean-architecture-tdd/)
