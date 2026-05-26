using System.ComponentModel.DataAnnotations;

namespace FinovaApi.Models;

/*
 * DTO para recibir la creacion de una proyeccion desde el frontend.
 */
public class CreateProyeccionRequest
{
    [MaxLength(100)]
    public string? Periodo { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal Crecimiento { get; set; }

    [Required, MinLength(1)]
    public List<ProyeccionItemDto> Items { get; set; } = new();
}

/*
 * DTO para cada item del detalle de la proyeccion.
 */
public class ProyeccionItemDto
{
    public int? InventarioId { get; set; }

    [Required, MaxLength(20)]
    public string Codigo { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Categoria { get; set; }

    public int CantidadActual { get; set; }
    public int CantidadProyectada { get; set; }

    [Range(0, double.MaxValue)]
    public decimal CostoUnitario { get; set; }
}
