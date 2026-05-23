-- ============================================================
-- SCRIPT: 02_create_foreign_keys.sql
-- DESCRIPCION: Creacion de llaves foraneas e indices entre tablas
-- AUTOR: FINOVA Dev Team
-- FECHA: 2026-05-23
-- NOTA: Ejecutar despues de 01_create_tables.sql
-- ============================================================

USE FinovaDB;
GO

-- ============================================================
// LLAVES FORANEAS - Tabla Costos
// ============================================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Costos_Usuarios')
BEGIN
    ALTER TABLE Costos
        ADD CONSTRAINT FK_Costos_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
END
GO

-- ============================================================
// LLAVES FORANEAS - Tabla Proyecciones
// ============================================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Proyecciones_Usuarios')
BEGIN
    ALTER TABLE Proyecciones
        ADD CONSTRAINT FK_Proyecciones_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
END
GO

-- ============================================================
// LLAVES FORANEAS - Tabla ProyeccionDetalle
// ============================================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProyeccionDetalle_Proyecciones')
BEGIN
    ALTER TABLE ProyeccionDetalle
        ADD CONSTRAINT FK_ProyeccionDetalle_Proyecciones
        FOREIGN KEY (ProyeccionId) REFERENCES Proyecciones(Id)
        ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProyeccionDetalle_Inventario')
BEGIN
    ALTER TABLE ProyeccionDetalle
        ADD CONSTRAINT FK_ProyeccionDetalle_Inventario
        FOREIGN KEY (InventarioId) REFERENCES Inventario(Id);
END
GO

-- ============================================================
// LLAVES FORANEAS - Tabla AuditoriaLog
// ============================================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AuditoriaLog_Usuarios')
BEGIN
    ALTER TABLE AuditoriaLog
        ADD CONSTRAINT FK_AuditoriaLog_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
END
GO

-- ============================================================
// LLAVES FORANEAS - Tabla Sesiones
// ============================================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Sesiones_Usuarios')
BEGIN
    ALTER TABLE Sesiones
        ADD CONSTRAINT FK_Sesiones_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
END
GO

-- ============================================================
// INDICES - Mejora de rendimiento en busquedas frecuentes
// ============================================================

-- Indice para busquedas por categoria en inventario
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventario_Categoria')
    CREATE INDEX IX_Inventario_Categoria ON Inventario(Categoria);
GO

-- Indice para busquedas por codigo en inventario
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventario_Codigo')
    CREATE INDEX IX_Inventario_Codigo ON Inventario(Codigo);
GO

-- Indice para busquedas por producto en costos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Costos_Producto')
    CREATE INDEX IX_Costos_Producto ON Costos(Producto);
GO

-- Indice para busquedas por usuario en costos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Costos_UsuarioId')
    CREATE INDEX IX_Costos_UsuarioId ON Costos(UsuarioId);
GO

-- Indice para busquedas por modulo en auditoria
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditoriaLog_Modulo')
    CREATE INDEX IX_AuditoriaLog_Modulo ON AuditoriaLog(Modulo);
GO

-- Indice para busquedas por fecha en auditoria (orden descendente)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditoriaLog_Fecha')
    CREATE INDEX IX_AuditoriaLog_Fecha ON AuditoriaLog(Fecha DESC);
GO

-- Indice para busquedas por usuario en auditoria
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditoriaLog_UsuarioId')
    CREATE INDEX IX_AuditoriaLog_UsuarioId ON AuditoriaLog(UsuarioId);
GO

-- Indice para busquedas por token en sesiones
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Sesiones_Token')
    CREATE INDEX IX_Sesiones_Token ON Sesiones(Token);
GO

-- Indice para busquedas por usuario en sesiones
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Sesiones_UsuarioId')
    CREATE INDEX IX_Sesiones_UsuarioId ON Sesiones(UsuarioId);
GO
