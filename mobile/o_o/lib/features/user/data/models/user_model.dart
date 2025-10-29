import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/user_entity.dart';

// 2개의 part 파일 선언
// - freezed가 생성할 파일
// - json_serializable이 생성할 파일
part 'user_model.freezed.dart';
part 'user_model.g.dart';

/// User model using Freezed + JSON Serialization
///
/// @freezed 어노테이션만으로 다음이 자동 생성됩니다:
/// - fromJson/toJson (json_serializable)
/// - copyWith
/// - == 연산자
/// - hashCode
/// - toString
@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required String email,
    @JsonKey(name: 'avatar_url') String? avatarUrl, // JSON 키 매핑 예제
    @Default(false) @JsonKey(name: 'is_active') bool isActive,
  }) = _UserModel;

  // fromJson factory - json_serializable이 자동 생성
  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  // Private constructor for custom methods
  const UserModel._();

  // Entity로 변환하는 메서드
  UserEntity toEntity() {
    return UserEntity(
      id: id,
      name: name,
      email: email,
      avatarUrl: avatarUrl,
      isActive: isActive,
    );
  }

  // Entity에서 Model로 변환하는 factory
  factory UserModel.fromEntity(UserEntity entity) {
    return UserModel(
      id: entity.id,
      name: entity.name,
      email: entity.email,
      avatarUrl: entity.avatarUrl,
      isActive: entity.isActive,
    );
  }
}
