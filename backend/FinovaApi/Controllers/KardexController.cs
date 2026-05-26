using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Models;
using FinovaApi.Services;

namespace FinovaApi.Controllers;

[ApiController]
[Route("api/kardex")]
[Authorize]
public class KardexController : ControllerBase
{
    private readonly KardexService _service;

    public KardexController(KardexService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<Kardex>>> GetAll(
        [FromQuery] int? inventarioId,
        [FromQuery] string? tipo)
    {
        return Ok(await _service.GetAll(inventarioId, tipo));
    }

    [HttpPost]
    public async Task<ActionResult<Kardex>> Registrar([FromBody] Kardex movimiento)
    {
        var (usuarioId, usuarioNombre) = GetUserInfo();
        try
        {
            var res = await _service.RegistrarMovimiento(movimiento, usuarioId, usuarioNombre);
            if (res == null) return NotFound(new { message = "Producto no encontrado." });
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private (int id, string nombre) GetUserInfo()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var nombreClaim = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value;
        return (int.Parse(idClaim ?? "0"), nombreClaim ?? "Sistema");
    }
}
