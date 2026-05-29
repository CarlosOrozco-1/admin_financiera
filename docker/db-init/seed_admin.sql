-- Semilla de administrador idempotente.
-- Motivo: permitir login inicial en cualquier equipo sin duplicar usuarios en reinicios.
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Username = '$(ADMIN_USER)')
    BEGIN
        INSERT INTO dbo.Usuarios (Nombre, Username, PasswordHash, Rol, Activo, FechaCreacion)
        VALUES ('$(ADMIN_NOMBRE)', '$(ADMIN_USER)', '$(ADMIN_PASSWORD)', 'Admin', 1, GETDATE());
    END
END
GO
