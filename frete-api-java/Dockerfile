# Dockerfile na pasta frete-api-java

# 1. Fase de Build (Compilação): USA IMAGEM COM MAVEN PRÉ-INSTALADO
# A imagem 'maven:3.8.6-jdk-17' já contém o Maven e o Java 17, resolvendo o erro 'mvn: not found'.
FROM maven:3.8.6-jdk-17 AS build

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