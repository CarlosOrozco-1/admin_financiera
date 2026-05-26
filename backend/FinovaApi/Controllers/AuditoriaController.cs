using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Services;

namespace FinovaApi.Controllers;

/*
 * Controlador de auditoria.
 * Permite consultar el historial de acciones del sistema con filtros.
 * Solo administradores pueden limpiar el historial.
 */
[ApiController]
[Route("api/auditoria")]
[Authorize]
public class AuditoriaController : ControllerBase
{
    private readonly AuditoriaService _service;

    public AuditoriaController(AuditoriaService service)
    {
        _service = service;
    }

    /*
     * GET /api/auditoria
     * Lista registros de auditoria con filtros opcionales.
     * Parametros: modulo, usuarioId, fechaDesde, fechaHasta, page, limit.
     */
    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] string? modulo,
        [FromQuery] int? usuarioId,
        [FromQuery] DateTime? fechaDesde,
        [FromQuery] DateTime? fechaHasta,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var logs = await _service.GetAll(modulo, usuarioId, fechaDesde, fechaHasta, page, limit);
        return Ok(logs);
    }

    /*
     * GET /api/auditoria/stats
     * Obtiene estadisticas de auditoria (total, por modulo, usuarios activos).
     */
    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        return Ok(await _service.GetStats());
    }

    /*
     * DELETE /api/auditoria
     * Limpia todo el historial de auditoria (solo admin).
     * Requiere que el usuario autenticado tenga rol "admin".
     */
    [HttpDelete]
    public async Task<ActionResult> ClearAll()
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role != "admin")
            return Forbid();

        await _service.ClearAll();

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value;
        await _service.Log("Auditoria", "Limpiar historial",
            "Historial de auditoria limpiado por administrador",
            int.Parse(userId ?? "0"), userName ?? "Sistema");

        return NoContent();
    }
}
