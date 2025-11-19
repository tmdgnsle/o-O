# CloudFront Signed URL 설정 가이드

## 문제 상황
S3 Presigned URL이 너무 길어서 (1000~1500자) 클라이언트에서 "too long" 오류 발생

## 해결 방법
CloudFront Signed URL로 전환하여 URL 길이를 150~250자로 단축

---

## 1. AWS CloudFront Distribution 생성

### 1.1 CloudFront Distribution 생성
1. AWS Console → CloudFront 서비스 접속
2. "Create Distribution" 클릭

### 1.2 Origin 설정
```
Origin Domain: o-o-bucket.s3.ap-northeast-2.amazonaws.com
Origin Path: (비워둠 또는 /mindmap)
Name: s3-mindmap-origin

Origin Access:
- Origin Access Control settings (recommended) 선택
- Create new OAC 클릭
  - Name: s3-mindmap-oac
  - Signing behavior: Sign requests (recommended)
  - Origin type: S3
```

### 1.3 Default Cache Behavior 설정
```
Viewer Protocol Policy: Redirect HTTP to HTTPS
Allowed HTTP Methods: GET, HEAD, OPTIONS
Cache key and origin requests: Cache policy and origin request policy (recommended)
Cache Policy: CachingOptimized (또는 CachingDisabled - 최신 이미지 보장 필요시)
```

### 1.4 Settings
```
Price Class: Use only North America and Europe (비용 절감) 또는 Use all edge locations
Alternate Domain Names (CNAMEs): (선택사항) 커스텀 도메인이 있다면 입력
SSL Certificate: Default CloudFront Certificate
```

### 1.5 Distribution 생성 완료
- Distribution 생성 후 Domain Name 확인
  - 예: `d3abcd1234.cloudfront.net`
  - 이 값을 환경 변수 `CLOUDFRONT_DOMAIN`에 설정

---

## 2. S3 Bucket Policy 업데이트 (OAC 사용 시)

CloudFront OAC가 S3 버킷에 접근할 수 있도록 버킷 정책 업데이트:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::o-o-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

**주의:**
- `YOUR_ACCOUNT_ID`: AWS 계정 ID로 변경
- `YOUR_DISTRIBUTION_ID`: CloudFront Distribution ID로 변경 (예: E2QWRTYUIOPLKJ)

---

## 3. CloudFront Key Pair 생성 (Signed URL용)

### 3.1 Trusted Key Groups 생성 (권장 방법)

#### Step 1: Public Key 생성
터미널에서 RSA 키 페어 생성:

```bash
# Private key 생성
openssl genrsa -out cloudfront_private_key.pem 2048

# Public key 추출
openssl rsa -pubout -in cloudfront_private_key.pem -out cloudfront_public_key.pem
```

#### Step 2: AWS Console에서 Public Key 등록
1. CloudFront Console → Public keys → Create public key
2. Key name: `mindmap-cloudfront-key`
3. Key value: `cloudfront_public_key.pem` 파일 내용 복사/붙여넣기
4. Create public key 클릭
5. **Public Key ID 복사** (예: K2ABCDEFGHIJK)
   - 이 값을 환경 변수 `CLOUDFRONT_KEY_PAIR_ID`에 설정

#### Step 3: Key Group 생성
1. CloudFront Console → Key groups → Create key group
2. Key group name: `mindmap-key-group`
3. Public keys: 위에서 생성한 public key 선택
4. Create key group 클릭

#### Step 4: Distribution에 Trusted Key Groups 설정
1. CloudFront Console → Distributions → 생성한 Distribution 선택
2. Behaviors 탭 → Default (*) 선택 → Edit
3. "Restrict viewer access (use signed URLs or signed cookies)" → Yes
4. Trusted key groups: 위에서 생성한 key group 선택
5. Save changes

---

## 4. Private Key 배포

### 4.1 개발 환경
```bash
# Private key를 안전한 경로에 저장
mkdir -p /etc/secrets
cp cloudfront_private_key.pem /etc/secrets/
chmod 600 /etc/secrets/cloudfront_private_key.pem
```

### 4.2 운영 환경 (Kubernetes Secret 사용)
```bash
# Kubernetes Secret 생성
kubectl create secret generic cloudfront-private-key \
  --from-file=cloudfront_private_key.pem \
  -n your-namespace

# deployment.yaml에서 Secret을 Volume으로 마운트
```

```yaml
volumes:
  - name: cloudfront-key
    secret:
      secretName: cloudfront-private-key
      defaultMode: 0400

volumeMounts:
  - name: cloudfront-key
    mountPath: /etc/secrets
    readOnly: true
```

---

## 5. 환경 변수 설정

### 5.1 필수 환경 변수

```bash
# CloudFront Distribution Domain (CloudFront Console에서 확인)
CLOUDFRONT_DOMAIN=d3abcd1234.cloudfront.net

# CloudFront Public Key ID (Public Keys에서 확인)
CLOUDFRONT_KEY_PAIR_ID=K2ABCDEFGHIJK

# CloudFront Private Key 파일 경로
CLOUDFRONT_PRIVATE_KEY_PATH=/etc/secrets/cloudfront_private_key.pem
```

### 5.2 개발 환경 (.env 파일)
```env
CLOUDFRONT_DOMAIN=d3abcd1234.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K2ABCDEFGHIJK
CLOUDFRONT_PRIVATE_KEY_PATH=/etc/secrets/cloudfront_private_key.pem
```

### 5.3 운영 환경 (Kubernetes ConfigMap/Secret)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mindmap-service-config
data:
  CLOUDFRONT_DOMAIN: "d3abcd1234.cloudfront.net"
  CLOUDFRONT_KEY_PAIR_ID: "K2ABCDEFGHIJK"
  CLOUDFRONT_PRIVATE_KEY_PATH: "/etc/secrets/cloudfront_private_key.pem"
```

---

## 6. 배포 및 테스트

### 6.1 의존성 설치
```bash
./gradlew clean build
```

### 6.2 애플리케이션 시작
```bash
./gradlew bootRun
```

### 6.3 CloudFront URL 테스트
```bash
# 로그에서 CloudFront Signed URL 확인
# 예시:
# https://d3abcd1234.cloudfront.net/mindmap/image/uuid.png?Expires=1700000000&Signature=XXX&Key-Pair-Id=K2ABCDEFGHIJK

# URL 길이 확인 (보통 150~250자)
# S3 Presigned URL 대비 85% 이상 단축됨
```

### 6.4 브라우저에서 테스트
생성된 CloudFront Signed URL을 브라우저에 붙여넣어서 이미지가 정상적으로 표시되는지 확인

---

## 7. 트러블슈팅

### 문제 1: "403 Forbidden" 에러
**원인:** S3 버킷 정책이 CloudFront OAC를 허용하지 않음

**해결:**
- S3 버킷 정책 확인 (위 2번 참고)
- CloudFront Distribution의 Origin Access Control 설정 확인

### 문제 2: "Private key file not found"
**원인:** Private key 파일 경로가 잘못됨

**해결:**
```bash
# Private key 파일 존재 확인
ls -la /etc/secrets/cloudfront_private_key.pem

# 파일 권한 확인 (600 또는 400)
chmod 600 /etc/secrets/cloudfront_private_key.pem

# 환경 변수 확인
echo $CLOUDFRONT_PRIVATE_KEY_PATH
```

### 문제 3: "SignatureDoesNotMatch" 에러
**원인:** Private key와 Public key가 매칭되지 않음

**해결:**
- Public key가 Private key에서 올바르게 추출되었는지 확인
- Key Pair ID가 올바른지 확인

### 문제 4: URL이 여전히 길다
**원인:** 여전히 S3 Presigned URL을 사용 중

**해결:**
- 로그 확인: `CloudFrontUrlService` 사용 여부 확인
- `ImageService`가 `CloudFrontUrlService`를 주입받았는지 확인

---

## 8. 성능 및 비용

### URL 길이 비교
- **S3 Presigned URL:** 1000~1500자
- **CloudFront Signed URL:** 150~250자
- **단축률:** 약 85% 이상

### CloudFront 비용
- 데이터 전송 비용: S3 direct access 대비 약간 높음
- 요청 비용: HTTP/HTTPS 요청당 과금
- 캐싱으로 인한 S3 요청 감소 효과
- 전체적으로 비용 차이는 크지 않으며, 성능 향상과 URL 길이 단축 효과가 더 큼

### 성능 향상
- Edge Location에서 캐싱되므로 응답 속도 향상
- S3 direct access 대비 글로벌 사용자에게 더 빠른 응답

---

## 9. 보안 고려사항

1. **Private Key 보안**
   - Private key는 절대 Git에 커밋하지 말 것
   - .gitignore에 `*.pem` 추가
   - Kubernetes Secret 또는 AWS Secrets Manager 사용 권장

2. **URL 만료 시간**
   - 현재 설정: 1시간 (Duration.ofHours(1))
   - 필요에 따라 조정 가능
   - 너무 길면 보안 위험, 너무 짧으면 사용자 경험 저하

3. **HTTPS 강제**
   - CloudFront에서 "Redirect HTTP to HTTPS" 설정 필수

---

## 10. 참고 자료

- [AWS CloudFront Signed URLs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html)
- [AWS CloudFront Key Groups](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-trusted-signers.html)
- [AWS SDK for Java - CloudFront URL Signer](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/examples-cloudfront.html)
