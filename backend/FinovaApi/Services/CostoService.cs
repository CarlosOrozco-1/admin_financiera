using Microsoft.EntityFrameworkCore;
using FinovaApi.Data;
using FinovaApi.Models;

namespace FinovaApi.Services;

/*
 * Servicio de costos predeterminados.
 * Implementa operaciones CRUD para registros de costos estandar vs reales,
 * incluyendo calculo automatico de totales, variaciones y resultado.
 */
public class CostoService
{
    private readonly FinovaDbContext _context;
    private readonly AuditoriaService _auditoria;

    public CostoService(FinovaDbContext context, AuditoriaService auditoria)
    {
        _context = context;
        _auditoria = auditoria;
    }

    /*
     * Obtiene todos los registros de costos guardados, ordenados por fecha descendente.
     */
    public async Task<List<Costo>> GetAll()
    {
        return await _context.Costos
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    /*
     * Obtiene un registro de costo por su ID.
     */
    public async Task<Costo?> GetById(int id)
    {
        return await _context.Costos.FindAsync(id);
    }

    /*
     * Crea un nuevo registro de costos.
     * Calcula automaticamente: totalEst, totalReal, variacion y resultado.
     */
    public async Task<Costo> Create(Costo data, int usuarioId, string usuarioNombre)
    {
        // Calcular totales
        data.TotalEst = (data.MpCantEst * data.MpPrecioEst)
                      + (data.MoCantEst * data.MoPrecioEst)
                      + (data.CiCantEst * data.CiPrecioEst);

        data.TotalReal = (data.MpCantReal * data.MpPrecioReal)
                       + (data.MoCantReal * data.MoPrecioReal)
                       + (data.CiCantReal * data.CiPrecioReal);

        data.Variacion = data.TotalReal - data.TotalEst;

        // Determinar resultado
        data.Resultado = data.Variacion < 0
            ? "Favorable"
            : data.Variacion > 0
                ? "Desfavorable"
                : "Sin variacion";

        data.UsuarioId = usuarioId;
        data.CreatedAt = DateTime.UtcNow;
        data.UpdatedAt = DateTime.UtcNow;

        _context.Costos.Add(data);
        await _context.SaveChangesAsync();

        await _auditoria.Log("Costos", "Guardar en BD",
            $"Producto: {data.Producto} (Código: {data.Codigo})",
            usuarioId, usuarioNombre);

        return data;
    }

    /*
     * Elimina un registro de costos.
     */
    public async Task<bool> Delete(int id, int usuarioId, string usuarioNombre)
    {
        var item = await _context.Costos.FindAsync(id);
        if (item == null) return false;

        _context.Costos.Remove(item);
        await _context.SaveChangesAsync();

        await _auditoria.Log("Costos", "Eliminar",
            $"Producto: {item.Producto} (ID: {id})",
            usuarioId, usuarioNombre);

        return true;
    }
}
