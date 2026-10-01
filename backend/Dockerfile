# Stage 1: Build application using Maven & Eclipse Temurin JDK 21
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal hardened runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for container security
RUN addgroup -S ideastruct && adduser -S ideastruct -G ideastruct
USER ideastruct

# Copy compiled executable JAR
COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
