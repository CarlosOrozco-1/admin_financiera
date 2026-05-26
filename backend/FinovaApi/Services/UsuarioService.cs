using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using FinovaApi.Data;
using FinovaApi.Models;

namespace FinovaApi.Services;

public class UsuarioService
{
    private readonly FinovaDbContext _context;

    public UsuarioService(FinovaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Usuario>> GetAll()
    {
        return await _context.Usuarios
            .Select(u => new Usuario
            {
                Id = u.Id,
                Username = u.Username,
                Nombre = u.Nombre,
                Role = u.Role,
                Activo = u.Activo,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
                // No devolvemos PasswordHash por seguridad
            })
            .OrderBy(u => u.Nombre)
            .ToListAsync();
    }

    public async Task<Usuario> Create(Usuario request, string rawPassword)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Username == request.Username))
            throw new Exception("El nombre de usuario ya está en uso.");

        var nuevoUsuario = new Usuario
        {
            Username = request.Username,
            Nombre = request.Nombre,
            Role = request.Role,
            Activo = true,
            PasswordHash = ComputeSha256Hash(rawPassword),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Usuarios.Add(nuevoUsuario);
        await _context.SaveChangesAsync();
        
        nuevoUsuario.PasswordHash = ""; // Limpiar antes de devolver
        return nuevoUsuario;
    }

    public async Task<Usuario?> Update(int id, Usuario request, string? newRawPassword)
    {
        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return null;

        // Verificar que si cambia el username, no choque con otro
        if (user.Username != request.Username && await _context.Usuarios.AnyAsync(u => u.Username == request.Username))
            throw new Exception("El nombre de usuario ya está en uso por otra cuenta.");

        user.Username = request.Username;
        user.Nombre = request.Nombre;
        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(newRawPassword))
        {
            user.PasswordHash = ComputeSha256Hash(newRawPassword);
        }

        await _context.SaveChangesAsync();

        var safeUser = new Usuario
        {
            Id = user.Id, Username = user.Username, Nombre = user.Nombre, Role = user.Role, Activo = user.Activo
        };
        return safeUser;
    }

    public async Task<Usuario?> ToggleStatus(int id)
    {
        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return null;

        // No permitir que el admin principal se desactive a si mismo (suponiendo Id=1)
        if (id == 1 && user.Role == "admin")
            throw new Exception("No puedes deshabilitar al administrador principal del sistema.");

        user.Activo = !user.Activo;
        user.UpdatedAt = DateTime.UtcNow;

        // Si se deshabilita, se podria invalidar sus sesiones actuales (Opcional, pero recomendado)
        if (!user.Activo)
        {
            var sesiones = await _context.Sesiones.Where(s => s.UsuarioId == id && s.Activa).ToListAsync();
            foreach (var s in sesiones) s.Activa = false;
        }

        await _context.SaveChangesAsync();

        return new Usuario { Id = user.Id, Activo = user.Activo };
    }

    /*
     * Mismo algoritmo que AuthService.cs para asegurar compatibilidad en login
     */
    private static string ComputeSha256Hash(string rawData)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawData));
        return Convert.ToHexString(bytes);
    }
}
