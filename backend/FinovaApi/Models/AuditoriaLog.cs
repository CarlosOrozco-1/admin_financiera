using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinovaApi.Models;

/*
 * Modelo que representa la tabla AuditoriaLog en la base de datos.
 * Registra todas las acciones realizadas en el sistema para trazabilidad.
 */
[Table("AuditoriaLog")]
public class AuditoriaLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public int? UsuarioId { get; set; }

    [MaxLength(100)]
    public string? UsuarioNombre { get; set; }

    [Required, MaxLength(50)]
    public string Modulo { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Accion { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Detalle { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
