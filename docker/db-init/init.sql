-- Crea la base si no existe.
-- Motivo: garantizar que los scripts versionados puedan ejecutarse sobre una base existente.
IF DB_ID('$(DB_NAME)') IS NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX) = 'CREATE DATABASE [' + '$(DB_NAME)' + ']';
    EXEC (@sql);
END
GO
