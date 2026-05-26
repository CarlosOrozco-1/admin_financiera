using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinovaApi.Models;

/*
 * Modelo que representa un movimiento en el Kardex.
 */
[Table("Kardex")]
public class Kardex
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int InventarioId { get; set; }

    [Required, MaxLength(20)]
    public string TipoMovimiento { get; set; } = string.Empty; // "INGRESO" o "EGRESO"

    [Required]
    public int Cantidad { get; set; }

    [Required]
    [Column(TypeName = "decimal(12,2)")]
    public decimal CostoUnitario { get; set; }

    [MaxLength(255)]
    public string? Detalle { get; set; }

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Required]
    public int UsuarioId { get; set; }

    [ForeignKey("InventarioId")]
    public Inventario? Inventario { get; set; }

    [ForeignKey("UsuarioId")]
    public Usuario? Usuario { get; set; }
}
