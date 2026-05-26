using Microsoft.EntityFrameworkCore;
using FinovaApi.Data;
using FinovaApi.Models;

namespace FinovaApi.Services;

/*
 * Servicio de proyecciones de inventario.
 * Gestiona la creacion y consulta de proyecciones con sus detalles,
 * calculando automaticamente diferencias, porcentajes y valores proyectados.
 */
public class ProyeccionService
{
    private readonly FinovaDbContext _context;
    private readonly AuditoriaService _auditoria;

    public ProyeccionService(FinovaDbContext context, AuditoriaService auditoria)
    {
        _context = context;
        _auditoria = auditoria;
    }

    /*
     * Obtiene todas las proyecciones (cabecera) ordenadas por fecha descendente.
     */
    public async Task<List<Proyeccion>> GetAll()
    {
        return await _context.Proyecciones
            .Include(p => p.Detalles)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    /*
     * Obtiene una proyeccion completa con sus detalles por ID.
     */
    public async Task<Proyeccion?> GetById(int id)
    {
        return await _context.Proyecciones
            .Include(p => p.Detalles)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    /*
     * Crea una nueva proyeccion a partir de los items recibidos.
     * Calcula automaticamente: diferencia, porcentaje, valorActual, valorProyectado.
     */
    public async Task<Proyeccion> Create(CreateProyeccionRequest request, int usuarioId, string usuarioNombre)
    {
        int totalActual = 0;
        int totalProyectado = 0;
        var detalles = new List<ProyeccionDetalle>();

        foreach (var item in request.Items)
        {
            var diferencia = item.CantidadProyectada - item.CantidadActual;
            var porcentaje = item.CantidadActual > 0
                ? $"{Math.Round((decimal)diferencia / item.CantidadActual * 100, 1)}%"
                : "0%";

            var valorActual = item.CantidadActual * item.CostoUnitario;
            var valorProyectado = item.CantidadProyectada * item.CostoUnitario;

            totalActual += item.CantidadActual;
            totalProyectado += item.CantidadProyectada;

            detalles.Add(new ProyeccionDetalle
            {
                InventarioId = item.InventarioId,
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                Categoria = item.Categoria,
                CantidadActual = item.CantidadActual,
                CantidadProyectada = item.CantidadProyectada,
                Diferencia = diferencia,
                Porcentaje = porcentaje,
                CostoUnitario = item.CostoUnitario,
                ValorActual = valorActual,
                ValorProyectado = valorProyectado
            });
        }

        var proyeccion = new Proyeccion
        {
            Fecha = DateTime.UtcNow,
            Periodo = request.Periodo,
            Crecimiento = request.Crecimiento,
            TotalActual = totalActual,
            TotalProyectado = totalProyectado,
            UsuarioId = usuarioId,
            CreatedAt = DateTime.UtcNow,
            Detalles = detalles
        };

        _context.Proyecciones.Add(proyeccion);
        await _context.SaveChangesAsync();

        await _auditoria.Log("Proyeccion", "Guardar",
            $"Proyeccion con {request.Crecimiento}% de crecimiento",
            usuarioId, usuarioNombre);

        /*
         * Volver a cargar la proyeccion con sus detalles desde la BD
         * para asegurar que los IDs generados por Identity esten presentes.
         */
        return (await _context.Proyecciones
            .Include(p => p.Detalles)
            .FirstOrDefaultAsync(p => p.Id == proyeccion.Id))!;
    }

    /*
     * Elimina una proyeccion y sus detalles en cascada.
     */
    public async Task<bool> Delete(int id, int usuarioId, string usuarioNombre)
    {
        var item = await _context.Proyecciones.FindAsync(id);
        if (item == null) return false;

        _context.Proyecciones.Remove(item);
        await _context.SaveChangesAsync();

        await _auditoria.Log("Proyeccion", "Eliminar",
            $"Proyeccion ID: {id} ({item.Periodo})",
            usuarioId, usuarioNombre);

        return true;
    }
}
