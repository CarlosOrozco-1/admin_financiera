-- ============================================================
-- SCRIPT: 06_create_kardex_table.sql
-- DESCRIPCION: Creacion de la tabla Kardex para registrar ingresos y egresos
-- AUTOR: FINOVA Dev Team
-- ============================================================

USE FinovaDB;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Kardex]') AND type in (N'U'))
BEGIN
    CREATE TABLE Kardex (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        InventarioId    INT           NOT NULL,
        TipoMovimiento  NVARCHAR(20)  NOT NULL, -- 'INGRESO' o 'EGRESO'
        Cantidad        INT           NOT NULL,
        CostoUnitario   DECIMAL(12,2) NOT NULL,
        Detalle         NVARCHAR(255) NULL,
        Fecha           DATETIME2     NOT NULL DEFAULT GETDATE(),
        UsuarioId       INT           NOT NULL
    );
    PRINT '✅ Tabla Kardex creada';
END
GO

-- FK: Kardex -> Inventario
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Kardex_Inventario')
BEGIN
    ALTER TABLE Kardex
        ADD CONSTRAINT FK_Kardex_Inventario
        FOREIGN KEY (InventarioId) REFERENCES Inventario(Id)
        ON DELETE CASCADE; -- Si se elimina un producto, se elimina su kardex
    PRINT '✅ FK_Kardex_Inventario creada';
END
GO

-- FK: Kardex -> Usuarios
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Kardex_Usuarios')
BEGIN
    ALTER TABLE Kardex
        ADD CONSTRAINT FK_Kardex_Usuarios
        FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id);
    PRINT '✅ FK_Kardex_Usuarios creada';
END
GO

-- INDICE para optimizar busquedas por producto
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Kardex_InventarioId')
BEGIN
    CREATE INDEX IX_Kardex_InventarioId ON Kardex(InventarioId);
    PRINT '✅ IX_Kardex_InventarioId creado';
END
GO


