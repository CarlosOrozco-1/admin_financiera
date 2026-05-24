-- ============================================================
-- SCRIPT: 04_migration_token_size.sql
-- DESCRIPCION: Corrige el tamano de la columna Token en Sesiones
--              El JWT generado supera los 255 caracteres originales
-- AUTOR: FINOVA Dev Team
-- FECHA: 2026-05-24
-- ============================================================

USE FinovaDB;
GO

ALTER TABLE Sesiones
ALTER COLUMN Token NVARCHAR(500) NOT NULL;
GO

PRINT '✅ Columna Token actualizada a NVARCHAR(500)';
GO
