using Microsoft.AspNetCore.Mvc;
using FinovaApi.Data;

namespace FinovaApi.Controllers;

/*
 * Controlador de health check.
 * Verifica que la API y la conexion a base de datos esten operativas.
 */
[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    private readonly FinovaDbContext _context;

    public HealthController(FinovaDbContext context)
    {
        _context = context;
    }

    /*
     * GET /api/health
     * Verifica el estado de la API y la conexion a SQL Server.
     */
    [HttpGet("health")]
    public async Task<ActionResult> Health()
    {
        var status = "ok";
        var dbStatus = "unknown";

        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            dbStatus = canConnect ? "connected" : "disconnected";
        }
        catch
        {
            dbStatus = "error";
        }

        return Ok(new
        {
            status,
            timestamp = DateTime.UtcNow,
            database = dbStatus
        });
    }
}
