using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Models;
using FinovaApi.Services;

namespace FinovaApi.Controllers;

/*
 * Controlador de inventario.
 * Implementa CRUD completo y consultas del modulo de inventario.
 * Todos los endpoints requieren autenticacion JWT.
 */
[ApiController]
[Route("api/inventario")]
[Authorize]
public class InventarioController : ControllerBase
{
    private readonly InventarioService _service;

    public InventarioController(InventarioService service)
    {
        _service = service;
    }

    /*
     * GET /api/inventario
     * Lista productos con filtros opcionales: ?categoria=&busqueda=
     */
    [HttpGet]
    public async Task<ActionResult<List<Inventario>>> GetAll(
        [FromQuery] string? categoria,
        [FromQuery] string? busqueda)
    {
        return Ok(await _service.GetAll(categoria, busqueda));
    }

    /*
     * GET /api/inventario/{id}
     * Obtiene un producto por su ID.
     */
    [HttpGet("{id}")]
    public async Task<ActionResult<Inventario>> GetById(int id)
    {
        var item = await _service.GetById(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /*
     * POST /api/inventario
     * Crea un nuevo producto.
     */
    [HttpPost]
    public async Task<ActionResult<Inventario>> Create([FromBody] Inventario item)
    {
        var (usuarioId, usuarioNombre) = GetUserInfo();
        var created = await _service.Create(item, usuarioId, usuarioNombre);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /*
     * PUT /api/inventario/{id}
     * Actualiza un producto existente.
     */
    [HttpPut("{id}")]
    public async Task<ActionResult<Inventario>> Update(int id, [FromBody] Inventario data)
    {
        var (usuarioId, usuarioNombre) = GetUserInfo();
        var updated = await _service.Update(id, data, usuarioId, usuarioNombre);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    /*
     * DELETE /api/inventario/{id}
     * Elimina un producto del inventario.
     */
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var (usuarioId, usuarioNombre) = GetUserInfo();
        var deleted = await _service.Delete(id, usuarioId, usuarioNombre);
        if (!deleted) return NotFound();
        return NoContent();
    }

    /*
     * GET /api/inventario/stats
     * Obtiene estadisticas del inventario.
     */
    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        return Ok(await _service.GetStats());
    }

    /*
     * GET /api/inventario/categorias
     * Obtiene lista de categorias distintas.
     */
    [HttpGet("categorias")]
    public async Task<ActionResult<List<string>>> GetCategories()
    {
        return Ok(await _service.GetCategories());
    }

    /*
     * Extrae usuarioId y nombre del token JWT.
     */
    private (int id, string nombre) GetUserInfo()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var nombreClaim = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value;
        return (int.Parse(idClaim ?? "0"), nombreClaim ?? "Sistema");
    }
}
