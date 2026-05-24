using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FinovaApi.Data;
using FinovaApi.Models;

namespace FinovaApi.Services;

/*
 * Servicio de autenticacion.
 * Implementa la logica de login, generacion de JWT, y gestion de sesiones.
 */
public class AuthService
{
    private readonly FinovaDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(FinovaDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /*
     * Autentica un usuario con username y password.
     * Retorna un LoginResponse con token JWT si las credenciales son correctas.
     */
    public async Task<LoginResponse> Login(LoginRequest request)
    {
        // Buscar usuario por username
        var user = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.Activo);

        if (user == null)
            return new LoginResponse { Success = false, Message = "Usuario o contraseña incorrectos" };

        // Verificar password contra el hash almacenado
        var passwordHash = ComputeSha256Hash(request.Password);
        if (user.PasswordHash != passwordHash)
            return new LoginResponse { Success = false, Message = "Usuario o contraseña incorrectos" };

        // Generar token JWT
        var token = GenerateJwtToken(user);

        // Guardar sesion en base de datos
        var sesion = new Sesion
        {
            UsuarioId = user.Id,
            Token = token,
            FechaInicio = DateTime.UtcNow,
            FechaExpiracion = DateTime.UtcNow.AddHours(8),
            Activa = true
        };

        _context.Sesiones.Add(sesion);
        await _context.SaveChangesAsync();

        return new LoginResponse
        {
            Success = true,
            Message = "Inicio de sesión exitoso",
            Token = token,
            User = new UserInfo
            {
                Id = user.Id,
                Username = user.Username,
                Nombre = user.Nombre,
                Role = user.Role
            }
        };
    }

    /*
     * Cierra la sesion invalidando el token en la base de datos.
     */
    public async Task<bool> Logout(string token)
    {
        var sesion = await _context.Sesiones
            .FirstOrDefaultAsync(s => s.Token == token && s.Activa);

        if (sesion == null) return false;

        sesion.Activa = false;
        await _context.SaveChangesAsync();
        return true;
    }

    /*
     * Obtiene la informacion del usuario autenticado a partir del token.
     */
    public async Task<UserInfo?> GetCurrentUser(string token)
    {
        var sesion = await _context.Sesiones
            .Include(s => s.Usuario)
            .FirstOrDefaultAsync(s => s.Token == token && s.Activa && s.FechaExpiracion > DateTime.UtcNow);

        if (sesion?.Usuario == null) return null;

        return new UserInfo
        {
            Id = sesion.Usuario.Id,
            Username = sesion.Usuario.Username,
            Nombre = sesion.Usuario.Nombre,
            Role = sesion.Usuario.Role
        };
    }

    /*
     * Genera un token JWT con los claims del usuario.
     */
    private string GenerateJwtToken(Usuario user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.GivenName, user.Nombre),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /*
     * Calcula el hash SHA256 de una contrasena y lo devuelve en formato hexadecimal.
     */
    private static string ComputeSha256Hash(string rawData)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawData));
        return Convert.ToHexStringLower(bytes);
    }
}
