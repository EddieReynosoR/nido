# Troubleshooting: IntelliJ + WSL + Maven

Notas de guerra para el backend de `nido` (Spring Boot 4.0.4, Java 21, Maven) desarrollado
en **WSL/Ubuntu** con **IntelliJ IDEA corriendo en Windows** y el proyecto abierto por ruta UNC
(`\\wsl.localhost\Ubuntu\home\<usuario>\projects\nido\backend`).

---

## El síntoma clásico

IntelliJ marca errores de compilación que **no existen**:

```
java: package jakarta.validation does not exist
```

...aunque:

- El `pom.xml` declara `spring-boot-starter-validation` (que trae `jakarta.validation-api` transitivamente).
- El jar está descargado en `~/.m2/repository/jakarta/validation/jakarta.validation-api/...`.
- `mvn compile` desde la terminal da **BUILD SUCCESS**.

Y en el Build Output aparece un **nombre de módulo que no es el tuyo**:

```
Updating dependency information… [orderly-backend]
Errors occurred while compiling module 'orderly-backend'
```

---

## Regla de oro: primero descartar que sea problema real

Antes de tocar nada del IDE, compila fuera de él:

```bash
cd ~/projects/nido/backend
mvn clean compile
```

| Resultado | Diagnóstico |
|---|---|
| `BUILD SUCCESS` | El código y las dependencias están bien. **El problema es del IDE.** |
| Falla | El problema es real: revisa `pom.xml`, versiones, imports. |

Si Maven compila bien, no pierdas tiempo revisando dependencias — ve directo a la caché del IDE.

---

## La causa raíz (el punto clave)

Cuando **IntelliJ corre en Windows** pero el **proyecto vive en WSL**, el proceso de build
(JPS, *JavaProject System*) se ejecuta **del lado de Linux**. Por lo tanto:

> La caché y la configuración de build viven en `~/.cache/JetBrains/` **dentro de WSL**,
> **NO** en `C:\Users\<user>\AppData\`.

Esto es lo que hace que el problema sea tan difícil de encontrar: puedes borrar `.idea/`,
vaciar `AppData`, hacer *Invalidate Caches* y **el fantasma sigue vivo**, porque el archivo
que el builder realmente lee está en otro sistema de archivos.

Cómo confirmarlo: en `Help → Show Log in Explorer` (o `idea.log`), busca la línea:

```
Build process started. Classpath: /home/<usuario>/.cache/JetBrains/IdeaIC<version>/jps-IC-.../backend.<hash>/jps-launcher.jar
```

Si la ruta empieza con `/home/...` → **el build corre en WSL** → la caché está en WSL.

### Por qué aparecía `orderly-backend`

El proyecto `nido` se creó **copiando un proyecto anterior llamado `orderly`**.
La carpeta `.idea/` copiada registró el módulo con el nombre viejo, y ese nombre quedó
persistido en la caché de JPS. El builder leía un `modules.xml` que apuntaba a un
`orderly-backend.iml` inexistente → classpath fantasma → errores falsos.

---

## Diagnóstico paso a paso

### 1. Buscar el nombre fantasma en TODOS los lugares posibles

```bash
# Lado WSL (el que casi siempre importa)
grep -ril "orderly" ~/.cache/JetBrains/ 2>/dev/null
grep -ril "orderly" ~/.config/JetBrains/ 2>/dev/null
grep -ril "orderly" ~/.local/share/JetBrains/ 2>/dev/null

# Dentro del proyecto
grep -ril "orderly" ~/projects/nido/ 2>/dev/null

# Lado Windows (menos probable si el build corre en WSL)
grep -ril "orderly" /mnt/c/Users/<usuario>/AppData/ 2>/dev/null
```

> Ojo con los falsos positivos: binarios como `adb.exe` pueden contener el string por casualidad.

### 2. Inspeccionar el archivo culpable

```bash
cat ~/.cache/JetBrains/IdeaIC2025.1/jps-IC-*/backend.*/external_build_system/project/modules.xml
```

Si ves algo como esto, ese es el problema:

```xml
<module fileurl="file://$PROJECT_DIR$/orderly-backend.iml"
        filepath="$PROJECT_DIR$/orderly-backend.iml" />
```

---

## La solución

**Cierra IntelliJ por completo antes de borrar nada.** Si el IDE está abierto, mantiene la
configuración en memoria y la reescribe al cerrarse — borrar con el IDE abierto no sirve de nada.

```bash
# Verificar que no quede nada corriendo
tasklist.exe | grep -i "idea"
```

Luego borra la caché de JPS del lado WSL (es 100% regenerable, no toca tu código):

```bash
rm -rf ~/.cache/JetBrains/IdeaIC2025.1
```

O quirúrgicamente, solo las carpetas afectadas:

```bash
rm -rf ~/.cache/JetBrains/IdeaIC2025.1/jps-IC-*/backend.*
rm -rf ~/.cache/JetBrains/IdeaIC2025.1/jps-IC-*/orderly-backend.*
rm -rf ~/.cache/JetBrains/IdeaIC2025.1/compile-server/backend_*
rm -rf ~/.cache/JetBrains/IdeaIC2025.1/compile-server/orderly-backend_*
```

Después:

1. Abre IntelliJ.
2. Espera a que **termine** la importación de Maven (barra de progreso abajo a la derecha).
3. `Build → Rebuild Project`.
4. Verifica que el Build Output diga ahora `nido-backend`.

---

## Prevención

- **Al copiar un proyecto para arrancar otro: borra `.idea/` ANTES de abrirlo por primera vez en el IDE.**
  Es la única forma de que no herede el nombre de módulo del original.

  ```bash
  cp -r ~/projects/viejo ~/projects/nuevo
  rm -rf ~/projects/nuevo/.idea
  # recién ahora: File → Open → pom.xml
  ```

- Abre siempre el proyecto vía **File → Open → `pom.xml` → "Open as Project"**, no seleccionando
  la carpeta. Así IntelliJ deriva el nombre del módulo del `<artifactId>` del pom.

- Considera **JetBrains Remote Development / WSL backend** en vez de acceder por ruta UNC.
  Elimina de raíz los desajustes de traducción de rutas Windows↔Linux.

---

## Cheat sheet: dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Dependencias descargadas | `~/.m2/repository/` (WSL) |
| Config del proyecto (IDE) | `<proyecto>/.idea/` |
| Caché de build (JPS) — **proyecto en WSL** | `~/.cache/JetBrains/IdeaIC<ver>/` |
| Caché de build — proyecto en Windows | `C:\Users\<user>\AppData\Local\JetBrains\IdeaIC<ver>\` |
| Config global del IDE | `C:\Users\<user>\AppData\Roaming\JetBrains\IdeaIC<ver>\` |
| Log del IDE | `Help → Show Log` |

---

## Comandos útiles de verificación

```bash
# ¿Está la dependencia en el repo local?
find ~/.m2/repository -iname "*jakarta*validation*" -name "*.jar"

# ¿La usa realmente el proyecto?
mvn dependency:tree | grep -i jakarta

# ¿El artifactId es el correcto?
grep -A1 "<artifactId>" pom.xml | head -5

# Compilación limpia fuera del IDE (la prueba de fuego)
mvn clean compile
```

---

## Otras trampas de este setup (ya vividas)

- **Tests fallando por variables de entorno:** el plugin EnvFile solo inyecta variables en las
  *run configurations* de IntelliJ, **no** en Surefire. Solución: perfil `test` con su propio
  datasource en `src/test/resources/application-test.properties`.

- **`-pl` sin `-am` en proyectos multi-módulo:** produce `package X does not exist` porque los
  módulos de los que dependes no se construyen. Correcto: `mvn package -pl 'module1' -am`.
  *(No aplica a `nido`, que es un módulo único — pero vale conocerlo.)*