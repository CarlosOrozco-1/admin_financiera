using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinovaApi.Models;

/*
 * Modelo que representa la tabla Proyecciones (cabecera).
 * Almacena la informacion general de cada proyeccion de inventario.
 */
[Table("Proyecciones")]
public class Proyeccion
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string? Periodo { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal Crecimiento { get; set; }

    public int TotalActual { get; set; }
    public int TotalProyectado { get; set; }

    public int? UsuarioId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relacion: una proyeccion tiene muchos detalles
    public List<ProyeccionDetalle> Detalles { get; set; } = new();
}
