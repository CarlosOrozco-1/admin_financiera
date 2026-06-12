using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FinovaApi.Data;
using FinovaApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurar Entity Framework Core con SQLite
builder.Services.AddDbContext<FinovaDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("FinovaDB")));

// Configurar autenticacion JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

builder.Services.AddAuthorization();

// Configurar CORS para permitir peticiones del frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Registrar servicios
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AuditoriaService>();
builder.Services.AddScoped<InventarioService>();
builder.Services.AddScoped<CostoService>();
builder.Services.AddScoped<ProyeccionService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<KardexService>();
builder.Services.AddScoped<UsuarioService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<FinovaDbContext>();
    DbInitializer.Initialize(context);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            Process.Start(new ProcessStartInfo("http://localhost:5000/") { UseShellExecute = true });
        }
    }
    catch { /* Ignore */ }
});

app.Run();
