using System.ComponentModel.DataAnnotations;

namespace FinovaApi.Models;

/*
 * DTO para la solicitud de inicio de sesion.
 * Recibe las credenciales del usuario desde el frontend.
 */
public class LoginRequest
{
    [Required(ErrorMessage = "El usuario es requerido")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    public string Password { get; set; } = string.Empty;
}
