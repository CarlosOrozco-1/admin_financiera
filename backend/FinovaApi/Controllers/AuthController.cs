using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Models;
using FinovaApi.Services;
using FinovaApi.Data;

namespace FinovaApi.Controllers;

/*
 * Controlador de autenticacion.
 * Implementa los endpoints para login, logout y obtencion del perfil actual.
 */
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AuditoriaService _auditoriaService;

    public AuthController(AuthService authService, AuditoriaService auditoriaService)
    {
        _authService = authService;
        _auditoriaService = auditoriaService;
    }

    /*
     * POST /api/auth/login
     * Autentica un usuario y devuelve un token JWT.
     */
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.Login(request);

        if (!result.Success)
            return Unauthorized(result);

        // Registrar en auditoria
        if (result.User != null)
        {
            await _auditoriaService.Log("Login", "Inicio de sesión",
                $"Usuario: {result.User.Username}", result.User.Id, result.User.Nombre);
        }

        return Ok(result);
    }

    /*
     * POST /api/auth/logout
     * Cierra la sesion actual invalidando el token.
     */
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout()
    {
        var token = ExtractToken();
        if (string.IsNullOrEmpty(token))
            return BadRequest(new { message = "Token no proporcionado" });

        await _authService.Logout(token);
        return Ok(new { message = "Sesión cerrada correctamente" });
    }

    /*
     * GET /api/auth/me
     * Obtiene la informacion del usuario autenticado.
     */
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfo>> GetCurrentUser()
    {
        var token = ExtractToken();
        if (string.IsNullOrEmpty(token))
            return Unauthorized();

        var user = await _authService.GetCurrentUser(token);
        if (user == null)
            return Unauthorized();

        return Ok(user);
    }

    /*
     * Extrae el token JWT del header Authorization.
     */
    private string? ExtractToken()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        return authHeader?.StartsWith("Bearer ") == true
            ? authHeader["Bearer ".Length..]
            : null;
    }
}
