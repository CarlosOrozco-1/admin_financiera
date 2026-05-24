namespace FinovaApi.Models;

/*
 * DTO para la respuesta de inicio de sesion.
 * Devuelve el token JWT y los datos del usuario autenticado.
 */
public class LoginResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public UserInfo? User { get; set; }
}

/*
 * Informacion basica del usuario para enviar al frontend.
 */
public class UserInfo
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
