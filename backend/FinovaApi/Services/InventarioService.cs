using Microsoft.EntityFrameworkCore;
using FinovaApi.Data;
using FinovaApi.Models;

namespace FinovaApi.Services;

/*
 * Servicio de inventario.
 * Implementa las operaciones CRUD y consultas del modulo de inventario.
 */
public class InventarioService
{
    private readonly FinovaDbContext _context;
    private readonly AuditoriaService _auditoria;

    public InventarioService(FinovaDbContext context, AuditoriaService auditoria)
    {
        _context = context;
        _auditoria = auditoria;
    }

    /*
     * Obtiene todos los productos con filtros opcionales por categoria y busqueda.
     */
    public async Task<List<Inventario>> GetAll(string? categoria, string? busqueda)
    {
        var query = _context.Inventario.AsQueryable();

        if (!string.IsNullOrEmpty(categoria))
            query = query.Where(i => i.Categoria == categoria);

        if (!string.IsNullOrEmpty(busqueda))
            query = query.Where(i =>
                i.Nombre.Contains(busqueda) || i.Codigo.Contains(busqueda));

        return await query.OrderBy(i => i.Codigo).ToListAsync();
    }

    /*
     * Obtiene un producto por su ID.
     */
    public async Task<Inventario?> GetById(int id)
    {
        return await _context.Inventario.FindAsync(id);
    }

    /*
     * Crea un nuevo producto en el inventario.
     */
    public async Task<Inventario> Create(Inventario item, int usuarioId, string usuarioNombre)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        _context.Inventario.Add(item);
        await _context.SaveChangesAsync();

        await _auditoria.Log("Inventario", "Crear",
            $"Producto: {item.Nombre} (Código: {item.Codigo})",
            usuarioId, usuarioNombre);

        return item;
    }

    /*
     * Actualiza un producto existente.
     */
    public async Task<Inventario?> Update(int id, Inventario data, int usuarioId, string usuarioNombre)
    {
        var item = await _context.Inventario.FindAsync(id);
        if (item == null) return null;

        item.Codigo = data.Codigo;
        item.Nombre = data.Nombre;
        item.Categoria = data.Categoria;
        item.Cantidad = data.Cantidad;
        item.CostoUnitario = data.CostoUnitario;
        item.StockMinimo = data.StockMinimo;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditoria.Log("Inventario", "Editar",
            $"Producto: {item.Nombre} (Código: {item.Codigo})",
            usuarioId, usuarioNombre);

        return item;
    }

    /*
     * Elimina un producto del inventario.
     */
    public async Task<bool> Delete(int id, int usuarioId, string usuarioNombre)
    {
        var item = await _context.Inventario.FindAsync(id);
        if (item == null) return false;

        var nombre = item.Nombre;
        var codigo = item.Codigo;

        _context.Inventario.Remove(item);
        await _context.SaveChangesAsync();

        await _auditoria.Log("Inventario", "Eliminar",
            $"Producto: {nombre} (Código: {codigo})",
            usuarioId, usuarioNombre);

        return true;
    }

    /*
     * Obtiene estadisticas del inventario.
     */
    public async Task<object> GetStats()
    {
        var items = await _context.Inventario.ToListAsync();

        return new
        {
            totalItems = items.Count,
            totalValue = items.Sum(i => i.Cantidad * i.CostoUnitario),
            lowStock = items.Count(i => i.Cantidad <= i.StockMinimo),
            totalUnits = items.Sum(i => i.Cantidad)
        };
    }

    /*
     * Obtiene lista de categorias distintas.
     */
    public async Task<List<string>> GetCategories()
    {
        return await _context.Inventario
            .Select(i => i.Categoria)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }
}
