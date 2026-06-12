# Registro de Errores y Soluciones Implementadas

Este documento detalla los problemas identificados durante la etapa de pruebas de la versión 1 de FINOVA y las soluciones aplicadas para garantizar la estabilidad del ejecutable (Build Standalone).

## 1. Problema: Base de datos SQL Server inaccesible en otros equipos
**Descripción:** La aplicación originalmente dependía de SQL Server (a través de contenedores Docker), lo que requería que el usuario final tuviera instalado Docker, scripts de base de datos o un servidor SQL activo.
**Solución:** 
- Se migró el motor de Entity Framework Core de SQL Server a **SQLite**.
- Se configuró el archivo `FinovaApi.csproj` y `Program.cs` para utilizar el proveedor de SQLite.
- Se implementó la clase `DbInitializer.cs` para crear automáticamente el archivo físico `finova.db` (en la misma carpeta del ejecutable) y poblarlo con el usuario administrador por defecto al iniciar por primera vez.

## 2. Problema: Enlaces duplicados en el menú lateral (Sidebar)
**Descripción:** Al navegar entre módulos (ej. Inventario a Costos), la barra lateral mostraba enlaces duplicados, específicamente en los apartados "Kardex", "Proyección" y la sección "Sistema".
**Solución:**
- Se detectó que las estructuras `<nav class="sidebar-nav">` diferían entre los archivos HTML.
- Se creó un script (`fix_ui.py`) que estandarizó la estructura del menú, eliminando las redundancias en todos los archivos `.html` de la carpeta `AdmonExamen` y actualizando automáticamente la carpeta `wwwroot` de la API.

## 3. Problema: El botón de colapsar Sidebar desaparecía
**Descripción:** En pantallas de escritorio, el botón superior izquierdo para colapsar o expandir el menú solo funcionaba en `dashboard.html`. En los demás módulos, el botón se volvía invisible.
**Solución:**
- Se unificó la lógica de la función `toggleSidebar()` en todos los archivos HTML.
- Se añadió la clase CSS `always-visible` al botón en el HTML de todos los módulos para forzar su aparición en pantallas de escritorio.

## 4. Problema: Colapso de la aplicación (Cierre inmediato de la consola negra)
**Descripción:** Al crear la build de único archivo (`PublishSingleFile=true`) e intentar abrir `FinovaApi.exe` en la carpeta `FINOVA_Standalone`, la aplicación colapsaba instantáneamente debido a una excepción `System.DllNotFoundException` relacionada con `e_sqlite3.dll`.
**Solución:**
- En .NET 5+, la publicación de único archivo no extrae automáticamente librerías nativas por defecto.
- Se agregó la etiqueta `<IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>` en el archivo `FinovaApi.csproj`. Esto obligó al compilador a incrustar el motor en C de SQLite dentro del ejecutable y extraerlo dinámicamente en tiempo de ejecución.

## 5. Problema: Color de texto/fondo invisible en botón de Registrar (Kardex Modal)
**Descripción:** Al intentar registrar un Ingreso o Egreso en el módulo de Inventario bajo los temas "Claro" o "Brisa", el botón principal del modal perdía visibilidad (fondo y texto se perdían).
**Solución:**
- La función JavaScript `openMovModal()` en `inventario.html` intentaba aplicar las variables CSS `var(--success)` y `var(--danger)` como color de fondo. 
- Dado que el sistema de tokens de FINOVA usa `var(--green)` y `var(--red)`, la propiedad quedaba inválida y arruinaba el contraste con el texto blanco de la clase base `.btn-primary`.
- Se eliminó el cambio dinámico de color de fondo, delegando todo el diseño del botón a las clases CSS estándar de los temas.

---
**Estado Actual:** Todas estas correcciones se encuentran integradas en la rama `build/standalone-sqlite` y la compilación final se ubica en la carpeta `FINOVA_Standalone`.
