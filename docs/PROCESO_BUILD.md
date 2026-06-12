# Proceso de Build: Aplicación Standalone (.exe) con SQLite

Este documento detalla el proceso implementado para convertir la aplicación web FINOVA (anteriormente ejecutada en contenedores con SQL Server) en un único ejecutable (`.exe`) portátil para Windows que funciona sin dependencias externas complejas.

## 1. Migración de Base de Datos (De SQL Server a SQLite)

Para que la aplicación sea verdaderamente portátil y no requiera que el usuario final instale un motor de base de datos pesado como SQL Server, se migró el proveedor de datos de Entity Framework Core a **SQLite**.

**Pasos realizados:**
- Se eliminó el paquete NuGet de SQL Server (`Microsoft.EntityFrameworkCore.SqlServer`).
- Se instaló el paquete de SQLite (`Microsoft.EntityFrameworkCore.Sqlite`).
- Se actualizó el archivo `appsettings.json` para utilizar una cadena de conexión local: `"DefaultConnection": "Data Source=finova.db"`.
- Se configuró la inyección de dependencias en `Program.cs` para usar SQLite en lugar de SQL Server.

## 2. Inicialización Automática de Datos (Seed Data)

Dado que SQLite crea un archivo local, la aplicación debe ser capaz de construir su propia estructura de tablas e insertar datos iniciales en caso de ejecutarse en un entorno nuevo.

**Pasos realizados:**
- Se creó una clase `DbInitializer` en la carpeta `Data`.
- Al iniciar la aplicación, `Program.cs` ejecuta este inicializador, el cual valida si la base de datos existe usando `context.Database.EnsureCreated()`.
- Si es una instalación nueva, automáticamente se crean los usuarios administrador predeterminados, los registros iniciales y las configuraciones base.

## 3. Integración de Backend y Frontend (Archivos Estáticos)

Para tener un solo punto de entrada, el backend de C# asume también el rol de servidor web para los archivos del frontend (HTML, CSS, JS).

**Pasos realizados:**
- Se copió el contenido del frontend (la carpeta `AdmonExamen`) dentro de una nueva carpeta llamada `wwwroot` en el proyecto del backend (`FinovaApi`).
- Se añadieron las directivas `app.UseDefaultFiles();` y `app.UseStaticFiles();` en `Program.cs`. 
- Esto le indica al servidor ASP.NET Core que sirva los archivos HTML estáticos de `wwwroot` cuando el usuario accede a la ruta raíz (`http://localhost:5000`).

## 4. Apertura Automática del Navegador

Para lograr que, al dar doble clic, el ejecutable inicie la API y simultáneamente abra el frontend en el navegador del usuario final, se agregó un evento al ciclo de vida de la aplicación.

**Pasos realizados:**
En `Program.cs` se registró el evento `ApplicationStarted`:
```csharp
app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            Process.Start(new ProcessStartInfo("http://localhost:5000/") { UseShellExecute = true });
        }
    }
    catch { /* Manejo de excepciones en caso el navegador no responda */ }
});
```
Esto elimina la necesidad de usar un archivo `.bat` separado. El propio archivo `.exe` es el encargado de disparar el navegador una vez que el servidor web interno está levantado y listo para recibir peticiones.

## 5. Compilación del Ejecutable Autónomo (Self-Contained Build)

Finalmente, para que el usuario no deba instalar .NET en su máquina, se compila la aplicación en modo `Self-Contained` (autocontenida) y `SingleFile` (archivo único).

**Comando utilizado:**
```bash
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o out
```

- `-c Release`: Optimiza el código para producción.
- `-r win-x64`: Especifica que el objetivo es Windows 64 bits.
- `--self-contained true`: Incluye el runtime de .NET dentro de la compilación.
- `-p:PublishSingleFile=true`: Empaqueta todo (dependencias, dlls, etc.) en un solo archivo `.exe`.
- `-o out`: Carpeta de destino.

*(Nota: Los archivos estáticos en `wwwroot` y la base de datos `finova.db` deben acompañar al `.exe` en la carpeta final).*

## Distribución al Usuario Final

Para entregar la aplicación, el usuario final solo necesita recibir una carpeta que contenga:
1. El archivo `FinovaApi.exe`
2. La carpeta `wwwroot` (con el frontend)
3. (Opcional) El archivo `appsettings.json`

**Instrucciones para el Usuario Final:**
- Copiar la carpeta a su escritorio o ubicación preferida.
- Dar doble clic en `FinovaApi.exe`.
- Una consola negra se abrirá (manteniendo el servidor en ejecución) y automáticamente se lanzará su navegador web predeterminado cargando la aplicación lista para usarse.

# Comando para proceder con la Build
-Moverse al directorio del backend (finovaApi)
-cd backend\FinovaApi
-correr el comando para la build
(dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o out)
