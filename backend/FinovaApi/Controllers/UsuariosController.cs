using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Models;
using FinovaApi.Services;

namespace FinovaApi.Controllers;

public class CrearUsuarioRequest : Usuario
{
    public string Password { get; set; } = string.Empty;
}

public class ActualizarUsuarioRequest : Usuario
{
    public string? NewPassword { get; set; }
}

[ApiController]
[Route("api/usuarios")]
[Authorize] // En un entorno real se recomendaria [Authorize(Roles = "admin")]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService _service;
    private readonly AuditoriaService _auditoria;

    public UsuariosController(UsuarioService service, AuditoriaService auditoria)
    {
        _service = service;
        _auditoria = auditoria;
    }

    [HttpGet]
    public async Task<ActionResult<List<Usuario>>> GetAll()
    {
        var (role, _) = GetUserInfo();
        if (role != "admin") return Forbid(); // Solo admin puede listar
        return Ok(await _service.GetAll());
    }

    [HttpPost]
    public async Task<ActionResult<Usuario>> Create([FromBody] CrearUsuarioRequest request)
    {
        var (role, authId) = GetUserInfo();
        if (role != "admin") return Forbid();

        try
        {
            if (string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "La contraseña es requerida para un usuario nuevo." });

            var res = await _service.Create(request, request.Password);
            await _auditoria.Log("Usuarios", "Crear", $"Usuario creado: {request.Username}", authId, "Admin");
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Usuario>> Update(int id, [FromBody] ActualizarUsuarioRequest request)
    {
        var (role, authId) = GetUserInfo();
        if (role != "admin") return Forbid();

        try
        {
            var res = await _service.Update(id, request, request.NewPassword);
            if (res == null) return NotFound(new { message = "Usuario no encontrado." });
            await _auditoria.Log("Usuarios", "Editar", $"Usuario editado: {request.Username}", authId, "Admin");
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/toggle")]
    public async Task<ActionResult> ToggleStatus(int id)
    {
        var (role, authId) = GetUserInfo();
        if (role != "admin") return Forbid();

        try
        {
            var res = await _service.ToggleStatus(id);
            if (res == null) return NotFound(new { message = "Usuario no encontrado." });
            await _auditoria.Log("Usuarios", "ToggleEstado", $"Estado cambiado para ID: {id}. Nuevo estado: {(res.Activo ? "Activo" : "Inactivo")}", authId, "Admin");
            return Ok(new { message = "Estado actualizado correctamente", activo = res.Activo });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private (string role, int id) GetUserInfo()
    {
        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "user";
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0";
        return (roleClaim, int.Parse(idClaim));
    }
}
