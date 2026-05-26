using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Models;
using FinovaApi.Services;

namespace FinovaApi.Controllers;

/*
 * Controlador de costos predeterminados.
 * Implementa CRUD para registros de costos estandar vs reales.
 * Todos los endpoints requieren autenticacion JWT.
 */
[ApiController]
[Route("api/costos")]
[Authorize]
public class CostosController : ControllerBase
{
    private readonly CostoService _service;

    public CostosController(CostoService service)
    {
        _service = service;
    }

    /*
     * GET /api/costos
     * Lista todos los registros de costos guardados.
     */
    [HttpGet]
    public async Task<ActionResult<List<Costo>>> GetAll()
    {
        return Ok(await _service.GetAll());
    }

    /*
     * GET /api/costos/{id}
     * Obtiene un registro de costo por su ID.
     */
    [HttpGet("{id}")]
    public async Task<ActionResult<Costo>> GetById(int id)
    {
        var item = await _service.GetById(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /*
     * POST /api/costos
     * Crea un nuevo registro de costos.
     * Los campos TotalEst, TotalReal, Variacion y Resultado se calculan automaticamente.
     */
    [HttpPost]
    public async Task<ActionResult<Costo>> Create([FromBody] Costo data)
    {
        var (usuarioId, usuarioNombre) = GetUserInfo();
        var created = await _service.Create(data, usuarioId, usuarioNombre);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /*
     * DELETE /api/costos/{id}
     * Elimina un registro de costos.
     */
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var (usuarioId, usuarioNombre) = GetUserInfo();
        var deleted = await _service.Delete(id, usuarioId, usuarioNombre);
        if (!deleted) return NotFound();
        return NoContent();
    }

    private (int id, string nombre) GetUserInfo()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var nombreClaim = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value;
        return (int.Parse(idClaim ?? "0"), nombreClaim ?? "Sistema");
    }
}
