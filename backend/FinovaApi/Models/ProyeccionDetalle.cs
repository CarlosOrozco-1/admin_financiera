using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinovaApi.Models;

/*
 * Modelo que representa la tabla ProyeccionDetalle.
 * Almacena cada item de una proyeccion con sus cantidades actual y proyectada.
 * Se elimina en cascada cuando se elimina la proyeccion padre.
 */
[Table("ProyeccionDetalle")]
public class ProyeccionDetalle
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int ProyeccionId { get; set; }

    public int? InventarioId { get; set; }

    [Required, MaxLength(20)]
    public string Codigo { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Categoria { get; set; }

    public int CantidadActual { get; set; }
    public int CantidadProyectada { get; set; }
    public int Diferencia { get; set; }

    [MaxLength(10)]
    public string? Porcentaje { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal CostoUnitario { get; set; }

    [Column(TypeName = "decimal(14,2)")]
    public decimal ValorActual { get; set; }

    [Column(TypeName = "decimal(14,2)")]
    public decimal ValorProyectado { get; set; }
}
