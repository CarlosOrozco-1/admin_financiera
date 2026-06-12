-- ============================================================
-- SCRIPT: 05_migration_token_nvarcharmax.sql
-- DESCRIPCION: Cambia Token a NVARCHAR(MAX) y elimina la restricción UNIQUE
--              porque el JWT puede superar los límites y no soporta índices.
-- AUTOR: FINOVA Dev Team
-- FECHA: 2026-05-24
-- NOTA: Ejecutar si se obtiene el error de truncado "String or binary data would be truncated"
-- ============================================================

USE FinovaDB;
GO

-- 1. Encontrar el nombre de la restricción UNIQUE asignada a la columna 'Token' y eliminarla
DECLARE @constraintName NVARCHAR(128);

SELECT @constraintName = kc.name
FROM sys.key_constraints kc
JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE kc.type = 'UQ' 
  AND kc.parent_object_id = OBJECT_ID('Sesiones') 
  AND c.name = 'Token';

IF @constraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE Sesiones DROP CONSTRAINT ' + @constraintName + ';');
    PRINT '✅ Restricción UNIQUE (' + @constraintName + ') eliminada exitosamente.';
END
ELSE
BEGIN
    PRINT 'ℹ️ No se encontró ninguna restricción UNIQUE para la columna Token.';
END
GO

-- 2. Alterar la columna Token a NVARCHAR(MAX)
ALTER TABLE Sesiones ALTER COLUMN Token NVARCHAR(MAX) NOT NULL;
PRINT '✅ Columna Token actualizada a NVARCHAR(MAX).';
GO


