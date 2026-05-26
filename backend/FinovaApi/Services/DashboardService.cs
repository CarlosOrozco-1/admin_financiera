using Microsoft.EntityFrameworkCore;
using FinovaApi.Data;

namespace FinovaApi.Services;

/*
 * Servicio de dashboard.
 * Consolida las estadisticas de todos los modulos para la pantalla principal.
 */
public class DashboardService
{
    private readonly FinovaDbContext _context;

    public DashboardService(FinovaDbContext context)
    {
        _context = context;
    }

    /*
     * Obtiene estadisticas consolidadas del sistema.
     */
    public async Task<object> GetStats(int? usuarioId)
    {
        var totalProductos = await _context.Inventario.CountAsync();
        var totalCostos = await _context.Costos.CountAsync();
        var totalAuditoria = await _context.AuditoriaLogs.CountAsync();
        var totalProyecciones = await _context.Proyecciones.CountAsync();

        var ultimoAcceso = await _context.AuditoriaLogs
            .Where(a => a.Modulo == "Login")
            .OrderByDescending(a => a.Fecha)
            .Select(a => (DateTime?)a.Fecha)
            .FirstOrDefaultAsync();

        var actividadReciente = await _context.AuditoriaLogs
            .OrderByDescending(a => a.Fecha)
            .Take(10)
            .Select(a => new
            {
                a.Id,
                a.Fecha,
                a.Modulo,
                a.Accion,
                a.Detalle,
                a.UsuarioNombre
            })
            .ToListAsync();

        var productosStockBajo = await _context.Inventario
            .CountAsync(i => i.Cantidad <= i.StockMinimo);

        var valorTotalInventario = await _context.Inventario
            .SumAsync(i => i.Cantidad * i.CostoUnitario);

        return new
        {
            totalProductos,
            totalCostos,
            totalAuditoria,
            totalProyecciones,
            ultimoAcceso,
            actividadReciente,
            productosStockBajo,
            valorTotalInventario
        };
    }
}
