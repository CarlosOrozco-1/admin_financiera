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
-- LLAVES FORANEAS
-- ============================================================

-- FK: Costos -> Usuarios
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Costos_Usuarios')
BEGIN
    ALTER TABLE Costos
        ADD CONSTRAINT FK_Costos_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
    PRINT '✅ FK_Costos_Usuarios creada';
END
GO

-- FK: Proyecciones -> Usuarios
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Proyecciones_Usuarios')
BEGIN
    ALTER TABLE Proyecciones
        ADD CONSTRAINT FK_Proyecciones_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
    PRINT '✅ FK_Proyecciones_Usuarios creada';
END
GO

-- FK: ProyeccionDetalle -> Proyecciones (con eliminacion en cascada)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProyeccionDetalle_Proyecciones')
BEGIN
    ALTER TABLE ProyeccionDetalle
        ADD CONSTRAINT FK_ProyeccionDetalle_Proyecciones
        FOREIGN KEY (ProyeccionId) REFERENCES Proyecciones(Id)
        ON DELETE CASCADE;
    PRINT '✅ FK_ProyeccionDetalle_Proyecciones creada (CASCADE)';
END
GO

-- FK: ProyeccionDetalle -> Inventario
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProyeccionDetalle_Inventario')
BEGIN
    ALTER TABLE ProyeccionDetalle
        ADD CONSTRAINT FK_ProyeccionDetalle_Inventario
        FOREIGN KEY (InventarioId) REFERENCES Inventario(Id);
    PRINT '✅ FK_ProyeccionDetalle_Inventario creada';
END
GO

-- FK: AuditoriaLog -> Usuarios
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AuditoriaLog_Usuarios')
BEGIN
    ALTER TABLE AuditoriaLog
        ADD CONSTRAINT FK_AuditoriaLog_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
    PRINT '✅ FK_AuditoriaLog_Usuarios creada';
END
GO

-- FK: Sesiones -> Usuarios
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Sesiones_Usuarios')
BEGIN
    ALTER TABLE Sesiones
        ADD CONSTRAINT FK_Sesiones_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
    PRINT '✅ FK_Sesiones_Usuarios creada';
END
GO

-- ============================================================
-- INDICES
-- Mejora de rendimiento en busquedas frecuentes
-- ============================================================

-- Indice para busquedas por categoria en inventario
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventario_Categoria')
BEGIN
    CREATE INDEX IX_Inventario_Categoria ON Inventario(Categoria);
    PRINT '✅ IX_Inventario_Categoria creado';
END
GO

-- Indice para busquedas por codigo en inventario
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventario_Codigo')
BEGIN
    CREATE INDEX IX_Inventario_Codigo ON Inventario(Codigo);
    PRINT '✅ IX_Inventario_Codigo creado';
END
GO

-- Indice para busquedas por producto en costos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Costos_Producto')
BEGIN
    CREATE INDEX IX_Costos_Producto ON Costos(Producto);
    PRINT '✅ IX_Costos_Producto creado';
END
GO

-- Indice para busquedas por usuario en costos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Costos_UsuarioId')
BEGIN
    CREATE INDEX IX_Costos_UsuarioId ON Costos(UsuarioId);
    PRINT '✅ IX_Costos_UsuarioId creado';
END
GO

-- Indice para busquedas por modulo en auditoria
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditoriaLog_Modulo')
BEGIN
    CREATE INDEX IX_AuditoriaLog_Modulo ON AuditoriaLog(Modulo);
    PRINT '✅ IX_AuditoriaLog_Modulo creado';
END
GO

-- Indice para busquedas por fecha en auditoria (orden descendente)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditoriaLog_Fecha')
BEGIN
    CREATE INDEX IX_AuditoriaLog_Fecha ON AuditoriaLog(Fecha DESC);
    PRINT '✅ IX_AuditoriaLog_Fecha creado';
END
GO

-- Indice para busquedas por usuario en auditoria
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditoriaLog_UsuarioId')
BEGIN
    CREATE INDEX IX_AuditoriaLog_UsuarioId ON AuditoriaLog(UsuarioId);
    PRINT '✅ IX_AuditoriaLog_UsuarioId creado';
END
GO

-- Indice para busquedas por token en sesiones
-- NOTA: Comentado porque no se puede crear un índice sobre columnas NVARCHAR(MAX)
-- IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Sesiones_Token')
-- BEGIN
--     CREATE INDEX IX_Sesiones_Token ON Sesiones(Token);
--     PRINT '✅ IX_Sesiones_Token creado';
-- END
-- GO

-- Indice para busquedas por usuario en sesiones
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Sesiones_UsuarioId')
BEGIN
    CREATE INDEX IX_Sesiones_UsuarioId ON Sesiones(UsuarioId);
    PRINT '✅ IX_Sesiones_UsuarioId creado';
END
GO

PRINT '========================================';
PRINT '✅ Todas las llaves foraneas e indices creados correctamente';
PRINT '========================================';
GO


