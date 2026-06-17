# Compila el proyecto con Maven y genera el .jar
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# 1) Copiamos solo lo necesario para descargar dependencias primero.
#    Esto aprovecha la cache de Docker: si no cambia el pom.xml,
#    no vuelve a bajar dependencias en cada build.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# 2) Ahora sí copiamos el código y compilamos.
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ---- Runtime stage ----
# Imagen final ligera: solo el JRE + el .jar, sin Maven ni JDK.
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Usuario sin privilegios
RUN addgroup --system spring && adduser --system --ingroup spring spring

# Copiamos el .jar generado en el build stage
COPY --from=build /app/target/*.jar app.jar

USER spring
EXPOSE 9000
ENTRYPOINT ["java", "-jar", "app.jar"]