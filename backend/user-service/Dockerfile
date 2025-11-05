# ===== BUILD =====
FROM gradle:8.10.2-jdk21 AS build
WORKDIR /workspace
COPY build.gradle settings.gradle gradlew gradle/ ./
COPY src ./src
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew clean bootJar -x test --no-daemon
RUN JAR_PATH=$(ls build/libs/*SNAPSHOT.jar 2>/dev/null || ls build/libs/*.jar | grep -v plain | head -n1) \
 && cp "$JAR_PATH" /app.jar

# ===== RUNTIME =====
FROM eclipse-temurin:21-jre-alpine
ENV TZ=Asia/Seoul \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"
WORKDIR /app
COPY --from=build /app.jar /app/app.jar
EXPOSE 8081
# Actuator 사용 시 경로 맞추기
HEALTHCHECK --interval=15s --timeout=3s --retries=10 CMD wget -qO- http://127.0.0.1:8080/actuator/health || exit 1
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
