using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Services;

namespace FinovaApi.Controllers;

/*
 * Controlador del dashboard principal.
 * Proporciona estadisticas consolidadas de todos los modulos del sistema.
 */
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _service;

    public DashboardController(DashboardService service)
    {
        _service = service;
    }

    /*
     * GET /api/dashboard/stats
     * Obtiene estadisticas consolidadas del sistema.
     */
    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        int? usuarioId = int.TryParse(userIdClaim, out var id) ? id : null;
        return Ok(await _service.GetStats(usuarioId));
    }
}
