# Dockerfile na pasta frete-api-java

# 1. Fase de Build (Compilação): Usa uma imagem com Java e Maven
# Usamos o Eclipse Temurin, que é uma imagem estável com o Java 17/Maven
FROM eclipse-temurin:17-jdk-focal as build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração do Maven e o código-fonte
COPY pom.xml .
COPY src /app/src

# Compila a aplicação Spring Boot
# Usa -DskipTests para pular os testes e acelerar o build
RUN mvn clean package -DskipTests

# 2. Fase de Execução: Usa uma imagem de runtime mais leve
# Usamos o Java JRE para economizar espaço e memória
FROM eclipse-temurin:17-jre-focal

# Define o diretório de trabalho
WORKDIR /app

# Copia o JAR compilado da fase de build
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta que o Spring Boot usa
EXPOSE 8080

# Comando para iniciar a aplicação Spring Boot
CMD ["java", "-jar", "app.jar"]