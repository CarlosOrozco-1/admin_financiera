using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinovaApi.Models;

/*
 * Modelo que representa la tabla Sesiones en la base de datos.
 * Almacena los tokens JWT activos para control de sesion.
 */
[Table("Sesiones")]
public class Sesion
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    [Required]
    public string Token { get; set; } = string.Empty;

    public DateTime FechaInicio { get; set; } = DateTime.UtcNow;

    public DateTime FechaExpiracion { get; set; }

    public bool Activa { get; set; } = true;

    [ForeignKey("UsuarioId")]
    public Usuario? Usuario { get; set; }
}
