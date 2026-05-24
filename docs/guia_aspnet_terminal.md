# Guía: Crear APIs con ASP.NET Core desde la Terminal

> Autor: FINOVA Dev Team
> Fecha: 2026-05-23
> Propósito: Documentar el proceso de creación de APIs REST con ASP.NET Core
> usando solo la terminal (sin Visual Studio), compatible con Linux (Fedora) y Windows.

---

## Requisitos Previos

### En Fedora Linux
```bash
# Instalar .NET SDK 10.0
sudo dnf install dotnet-sdk-10.0

# Verificar instalacion
dotnet --version
# Output esperado: 10.0.x
```

### En Windows
```bash
# Descargar e instalar desde: https://dotnet.microsoft.com/download
# O usando winget:
winget install Microsoft.DotNet.SDK.10

# Verificar instalacion
dotnet --version
```

---

## 1. Crear el Proyecto

### 1.1 Crear el directorio y el proyecto

```bash
# Crear carpeta del proyecto
mkdir -p ~/proyectos/FinovaApi
cd ~/proyectos/FinovaApi

# Crear el proyecto Web API
dotnet new webapi --no-https --use-controllers
```

**Explicacion de parametros:**
- `dotnet new webapi` — Plantilla de ASP.NET Core Web API
- `--no-https` — Desactiva HTTPS (para desarrollo local simple)
- `--use-controllers` — Usa controladores (MVC) en vez de Minimal API

### 1.2 Probar que compila

```bash
dotnet build
```

### 1.3 Ejecutar el proyecto

```bash
dotnet run
# Por defecto corre en: http://localhost:5000
```

### 1.4 Especificar puerto personalizado

```bash
dotnet run --urls http://localhost:5000
```

---

## 2. Estructura Generada

```
FinovaApi/
├── Controllers/          # Controladores (endpoints REST)
├── Models/               # Clases de entidades y DTOs
├── Services/             # Logica de negocio
├── Data/                 # DbContext y configuracion EF Core
├── Middleware/            # Middleware personalizado (JWT, errores, etc.)
├── Program.cs            # Punto de entrada y configuracion del servidor
├── appsettings.json      # Configuracion (connection strings, JWT, etc.)
└── FinovaApi.csproj      # Archivo de proyecto (dependencias NuGet)
```

---

## 3. Agregar Paquetes NuGet

Los paquetes NuGet son como las dependencias de npm/pip. Se agregan desde la terminal:

```bash
# Entity Framework Core para SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer

# Autenticacion JWT
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Manejo de tokens JWT
dotnet add package System.IdentityModel.Tokens.Jwt
```

**Comandos utiles de NuGet:**
```bash
# Ver paquetes instalados
dotnet list package

# Remover un paquete
dotnet remove package Microsoft.AspNetCore.OpenApi

# Actualizar paquetes
dotnet restore
```

---

## 4. El Flujo de Trabajo (MVC)

### 4.1 Modelo — `Models/`
Las clases que representan las tablas de la base de datos:

```csharp
// Ejemplo: Models/Usuario.cs
[Table("Usuarios")]
public class Usuario
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;
    // ...
}
```

### 4.2 DbContext — `Data/`
Configura la conexion entre las entidades C# y las tablas SQL Server:

```csharp
// Ejemplo: Data/FinovaDbContext.cs
public class FinovaDbContext : DbContext
{
    public FinovaDbContext(DbContextOptions<FinovaDbContext> options)
        : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
}
```

### 4.3 Servicio — `Services/`
Contiene la logica de negocio (reglas de la aplicacion):

```csharp
// Ejemplo: Services/AuthService.cs
public class AuthService
{
    private readonly FinovaDbContext _context;

    public AuthService(FinovaDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetUser(string username)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Username == username);
    }
}
```

### 4.4 Controlador — `Controllers/`
Expone los endpoints REST que consume el frontend:

```csharp
// Ejemplo: Controllers/AuthController.cs
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        // Logica de autenticacion
        return Ok(new { token = "jwt..." });
    }
}
```

---

## 5. Configurar Program.cs

`Program.cs` es el corazon de la aplicacion. Aqui se registran los servicios, middleware y configuracion:

```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Entity Framework Core
builder.Services.AddDbContext<FinovaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FinovaDB")));

// 2. Autenticacion JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* config */ });

// 3. CORS (permite peticiones del frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// 4. Registrar servicios (para inyeccion de dependencias)
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AuditoriaService>();

// 5. Controladores
builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 6. Configurar appsettings.json

```json
{
  "ConnectionStrings": {
    "FinovaDB": "Server=localhost;Database=FinovaDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "SecretKey": "Tu_Clave_Secreta_Muy_Larga_Aqui_Minimo_256_bits!",
    "Issuer": "FinovaAPI",
    "Audience": "FinovaApp",
    "ExpirationHours": 8
  }
}
```

En **Linux (Fedora)** la connection string cambia porque SQL Server usa autenticacion por usuario/contraseña:

```json
{
  "ConnectionStrings": {
    "FinovaDB": "Server=localhost,1433;Database=FinovaDB;User Id=sa;Password=TuPassword;TrustServerCertificate=True;"
  }
}
```

---

## 7. Ciclo de Desarrollo en Terminal

```bash
# 1. Crear modelo
touch Models/MiEntidad.cs

# 2. Crear servicio
touch Services/MiServicio.cs

# 3. Registrar servicio en Program.cs
# (editar manualmente: builder.Services.AddScoped<MiServicio>();)

# 4. Crear controlador
touch Controllers/MiControlador.cs

# 5. Compilar
dotnet build

# 6. Ejecutar
dotnet run --urls http://localhost:5000
```

---

## 8. Herramientas Recomendadas para Linux

| Herramienta | Uso |
|-------------|-----|
| **Visual Studio Code** | Editor de codigo con extension C# |
| **C# Dev Kit** | Extension de VS Code para .NET |
| **Postman / Insomnia** | Probar endpoints REST |
| **Azure Data Studio** | Alternativa a SSMS para Linux |
| **Docker** | Ejecutar SQL Server en contenedor |

### Ejecutar SQL Server con Docker en Fedora

```bash
# Descargar imagen de SQL Server 2022
sudo docker pull mcr.microsoft.com/mssql/server:2022-latest

# Ejecutar contenedor
sudo docker run -e "ACCEPT_EULA=Y" \
                -e "MSSQL_SA_PASSWORD=TuPassword123!" \
                -p 1433:1433 \
                --name sqlserver \
                -d mcr.microsoft.com/mssql/server:2022-latest

# Conectarse desde Azure Data Studio o con sqlcmd
sudo docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P "TuPassword123!"
```

---

## 9. Comandos Rapidos (Cheat Sheet)

```bash
# Crear proyecto
dotnet new webapi --no-https --use-controllers -n MiApi

# Agregar paquete
dotnet add package Microsoft.EntityFrameworkCore.SqlServer

# Compilar
dotnet build

# Ejecutar
dotnet run --urls http://localhost:5000

# Publicar (para produccion)
dotnet publish -c Release -o ./publish

# Ver proyectos plantilla disponibles
dotnet new list

# Ver ayuda de comandos
dotnet new webapi --help
```

---

## Diferencia Clave: Terminal vs Visual Studio

| Aspecto | Visual Studio | Terminal |
|---------|--------------|----------|
| Crear proyecto | File > New Project > ASP.NET Core Web API | `dotnet new webapi` |
| Agregar paquete | Tools > NuGet Package Manager | `dotnet add package ...` |
| Compilar | Build > Build Solution | `dotnet build` |
| Ejecutar | Press F5 | `dotnet run` |
| Depurar | Breakpoints + F5 | `dotnet run` + logs en consola |
| Agregar archivo | Right-click > Add > Class | `touch Models/Clase.cs` |

En Linux no hay Visual Studio, pero **VS Code + C# Dev Kit** da una experiencia
similar con IntelliSense, resaltado de sintaxis y depuracion integrada.

---

## Resumen

1. `dotnet new webapi` — Crea el proyecto
2. `dotnet add package` — Agrega dependencias
3. Editar `Program.cs` — Configurar servicios
4. Crear `Models/`, `Services/`, `Controllers/` — Logica MVC
5. `dotnet build` — Compilar
6. `dotnet run` — Ejecutar
7. Probar con Postman

Todo se puede hacer desde la terminal, sin Visual Studio, tanto en Windows como en Linux.
