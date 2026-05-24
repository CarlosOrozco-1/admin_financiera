using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinovaApi.Models;

/*
 * Modelo que representa la tabla Inventario en la base de datos.
 * Almacena los productos del inventario con cantidades y costos.
 */
[Table("Inventario")]
public class Inventario
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string Codigo { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Categoria { get; set; } = string.Empty;

    public int Cantidad { get; set; } = 0;

    [Column(TypeName = "decimal(12,2)")]
    public decimal CostoUnitario { get; set; } = 0;

    public int StockMinimo { get; set; } = 10;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
