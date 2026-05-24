-- ============================================================
-- SCRIPT: 05_migration_token_nvarcharmax.sql
-- DESCRIPCION: Cambia Token a NVARCHAR(MAX) y elimina UNIQUE
--              porque el JWT puede superar 255/500 caracteres
-- AUTOR: FINOVA Dev Team
-- FECHA: 2026-05-24
-- NOTA: NVARCHAR(MAX) + UNIQUE no es compatible, se elimina UNIQUE
-- ============================================================

USE FinovaDB;
GO

-- Eliminar constraint UNIQUE existente si existe (nombre generado automaticamente por SQL Server)
DECLARE @uqName NVARCHAR(128) = (
    SELECT TOP 1 i.name FROM sys.indexes i
    INNER JOIN sys.objects t ON i.object_id = t.object_id
    WHERE t.name = 'Sesiones' AND i.is_unique = 1 AND i.is_primary_key = 0
);
IF @uqName IS NOT NULL
    EXEC('DROP INDEX ' + @uqName + ' ON Sesiones;');
GO

-- Cambiar columna a NVARCHAR(MAX)
ALTER TABLE Sesiones ALTER COLUMN Token NVARCHAR(MAX) NOT NULL;
GO

PRINT '✅ Columna Token actualizada a NVARCHAR(MAX)';
GO
