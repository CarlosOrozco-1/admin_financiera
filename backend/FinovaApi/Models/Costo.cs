using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinovaApi.Models;

/*
 * Modelo que representa la tabla Costos en la base de datos.
 * Almacena los registros de costos predeterminados (estandar vs real).
 */
[Table("Costos")]
public class Costo
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Producto { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Codigo { get; set; }

    public int Cantidad { get; set; }

    // Costos estandar
    [Column(TypeName = "decimal(12,2)")]
    public decimal MpCantEst { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal MpPrecioEst { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal MoCantEst { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal MoPrecioEst { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal CiCantEst { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal CiPrecioEst { get; set; }

    // Costos reales
    [Column(TypeName = "decimal(12,2)")]
    public decimal MpCantReal { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal MpPrecioReal { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal MoCantReal { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal MoPrecioReal { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal CiCantReal { get; set; }
    [Column(TypeName = "decimal(12,2)")]
    public decimal CiPrecioReal { get; set; }

    // Totales calculados
    [Column(TypeName = "decimal(14,2)")]
    public decimal TotalEst { get; set; }
    [Column(TypeName = "decimal(14,2)")]
    public decimal TotalReal { get; set; }
    [Column(TypeName = "decimal(14,2)")]
    public decimal Variacion { get; set; }

    [MaxLength(20)]
    public string? Resultado { get; set; }

    public int? UsuarioId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
