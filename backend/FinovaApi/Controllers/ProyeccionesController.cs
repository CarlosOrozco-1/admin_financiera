using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinovaApi.Models;
using FinovaApi.Services;

namespace FinovaApi.Controllers;

/*
 * Controlador de proyecciones de inventario.
 * Implementa CRUD completo para proyecciones con calculo automatico de detalles.
 * Todos los endpoints requieren autenticacion JWT.
 */
[ApiController]
[Route("api/proyecciones")]
[Authorize]
public class ProyeccionesController : ControllerBase
{
    private readonly ProyeccionService _service;

    public ProyeccionesController(ProyeccionService service)
    {
        _service = service;
    }

    /*
     * GET /api/proyecciones
     * Lista todas las proyecciones guardadas con sus detalles.
     */
    [HttpGet]
    public async Task<ActionResult<List<Proyeccion>>> GetAll()
    {
        return Ok(await _service.GetAll());
    }

    /*
     * GET /api/proyecciones/{id}
     * Obtiene una proyeccion completa con sus detalles por ID.
     */
    [HttpGet("{id}")]
    public async Task<ActionResult<Proyeccion>> GetById(int id)
    {
        var item = await _service.GetById(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /*
     * POST /api/proyecciones
     * Crea una nueva proyeccion.
     * Recibe un array de items con cantidades actual y proyectada,
     * el backend calcula automaticamente diferencia, porcentaje y valores.
     */
    [HttpPost]
    public async Task<ActionResult<Proyeccion>> Create([FromBody] CreateProyeccionRequest request)
    {
        var (usuarioId, usuarioNombre) = GetUserInfo();
        var created = await _service.Create(request, usuarioId, usuarioNombre);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /*
     * DELETE /api/proyecciones/{id}
     * Elimina una proyeccion y sus detalles en cascada.
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
