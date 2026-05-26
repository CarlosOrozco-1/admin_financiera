using Microsoft.EntityFrameworkCore;
using FinovaApi.Data;
using FinovaApi.Models;

namespace FinovaApi.Services;

public class KardexService
{
    private readonly FinovaDbContext _context;

    public KardexService(FinovaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Kardex>> GetAll(int? inventarioId = null, string? tipoMovimiento = null)
    {
        var query = _context.KardexMovimientos
            .Include(k => k.Inventario)
            .Include(k => k.Usuario)
            .AsQueryable();

        if (inventarioId.HasValue)
            query = query.Where(k => k.InventarioId == inventarioId.Value);

        if (!string.IsNullOrEmpty(tipoMovimiento) && tipoMovimiento != "Todos")
            query = query.Where(k => k.TipoMovimiento == tipoMovimiento);

        return await query.OrderByDescending(k => k.Fecha).ToListAsync();
    }

    public async Task<Kardex?> RegistrarMovimiento(Kardex movimiento, int usuarioId, string usuarioNombre)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var producto = await _context.Inventario.FindAsync(movimiento.InventarioId);
            if (producto == null) return null;

            if (movimiento.Cantidad <= 0)
                throw new Exception("La cantidad debe ser mayor a 0.");

            if (movimiento.TipoMovimiento == "INGRESO")
            {
                producto.Cantidad += movimiento.Cantidad;
            }
            else if (movimiento.TipoMovimiento == "EGRESO")
            {
                if (producto.Cantidad < movimiento.Cantidad)
                    throw new Exception("Stock insuficiente para realizar el egreso.");
                producto.Cantidad -= movimiento.Cantidad;
            }
            else
            {
                throw new Exception("Tipo de movimiento inválido.");
            }

            movimiento.CostoUnitario = producto.CostoUnitario;
            movimiento.UsuarioId = usuarioId;
            movimiento.Fecha = DateTime.UtcNow;

            _context.KardexMovimientos.Add(movimiento);
            
            // Log auditoria
            var audit = new AuditoriaLog
            {
                UsuarioId = usuarioId,
                UsuarioNombre = usuarioNombre,
                Modulo = "Kardex",
                Accion = movimiento.TipoMovimiento,
                Detalle = $"{movimiento.Cantidad} uds. de {producto.Nombre} ({producto.Codigo})"
            };
            _context.AuditoriaLogs.Add(audit);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return movimiento;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
