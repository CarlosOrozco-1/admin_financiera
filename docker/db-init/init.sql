-- Crea la base si no existe.
IF DB_ID('FinovaDb') IS NULL
BEGIN
    CREATE DATABASE FinovaDb;
END
GO

USE FinovaDb;
GO

-- Semilla de administrador idempotente.
-- Motivo: permitir login inicial en cualquier equipo al levantar con docker compose.
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Username = 'admin')
BEGIN
    INSERT INTO Usuarios (Nombre, Username, PasswordHash, Rol, Activo, FechaCreacion)
    VALUES (
        'Administrador General',
        'admin',
        'Admin123!',
        'Admin',
        1,
        GETDATE()
    );
END
GO