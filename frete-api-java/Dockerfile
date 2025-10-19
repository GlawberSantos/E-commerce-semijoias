# Dockerfile na pasta frete-api-java

# 1. Fase de Build (Compilação): CORREÇÃO DA IMAGEM BASE PARA 3.9.9
# Usamos a imagem oficial do Maven com OpenJDK 17.
FROM maven:3.9.9-eclipse-temurin-17 AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do Maven e o código-fonte
COPY pom.xml .
COPY src /app/src

# Compila a aplicação Spring Boot
RUN mvn clean package -DskipTests

# 2. Fase de Execução: Usa uma imagem de runtime mais leve
# Usamos o JRE (Java Runtime Environment) para economizar espaço e memória
FROM eclipse-temurin:17-jre-focal

# Define o diretório de trabalho
WORKDIR /app

# Copia o JAR compilado da fase de build
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta que o Spring Boot usa
EXPOSE 8080

# Comando para iniciar a aplicação Spring Boot
CMD ["java", "-jar", "app.jar"]