using Microsoft.EntityFrameworkCore;
using FinovaApi.Data;
using FinovaApi.Models;

namespace FinovaApi.Services;

/*
 * Servicio de auditoria.
 * Proporciona metodos para registrar y consultar acciones del sistema.
 */
public class AuditoriaService
{
    private readonly FinovaDbContext _context;

    public AuditoriaService(FinovaDbContext context)
    {
        _context = context;
    }

    /*
     * Registra una accion en el log de auditoria.
     */
    public async Task Log(string modulo, string accion, string detalle, int? usuarioId = null, string? usuarioNombre = null)
    {
        var log = new AuditoriaLog
        {
            Modulo = modulo,
            Accion = accion,
            Detalle = detalle,
            UsuarioId = usuarioId,
            UsuarioNombre = usuarioNombre,
            Fecha = DateTime.UtcNow
        };

        _context.AuditoriaLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    /*
     * Obtiene registros de auditoria con filtros opcionales.
     */
    public async Task<List<AuditoriaLog>> GetAll(string? modulo, int? usuarioId, DateTime? fechaDesde, DateTime? fechaHasta, int page, int limit)
    {
        var query = _context.AuditoriaLogs.AsQueryable();

        if (!string.IsNullOrEmpty(modulo) && modulo != "Todos")
            query = query.Where(a => a.Modulo == modulo);

        if (usuarioId.HasValue)
            query = query.Where(a => a.UsuarioId == usuarioId);

        if (fechaDesde.HasValue)
            query = query.Where(a => a.Fecha >= fechaDesde.Value);

        if (fechaHasta.HasValue)
            query = query.Where(a => a.Fecha <= fechaHasta.Value);

        return await query
            .OrderByDescending(a => a.Fecha)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();
    }

    /*
     * Obtiene estadisticas de auditoria.
     */
    public async Task<object> GetStats()
    {
        var total = await _context.AuditoriaLogs.CountAsync();
        var byModule = await _context.AuditoriaLogs
            .GroupBy(a => a.Modulo)
            .Select(g => new { modulo = g.Key, count = g.Count() })
            .ToListAsync();
        var usuarios = await _context.AuditoriaLogs
            .Where(a => a.UsuarioNombre != null)
            .Select(a => a.UsuarioNombre!)
            .Distinct()
            .CountAsync();

        return new { total, byModule, usuariosActivos = usuarios };
    }

    /*
     * Limpia todo el historial de auditoria (solo admin).
     */
    public async Task ClearAll()
    {
        _context.AuditoriaLogs.RemoveRange(_context.AuditoriaLogs);
        await _context.SaveChangesAsync();
    }
}
