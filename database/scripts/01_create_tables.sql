-- ============================================================
-- SCRIPT: 01_create_tables.sql
-- DESCRIPCION: Creacion de todas las tablas del sistema FINOVA
-- AUTOR: FINOVA Dev Team
-- FECHA: 2026-05-23
-- ============================================================

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FinovaDB')
BEGIN
    CREATE DATABASE FinovaDB;
END
GO

USE FinovaDB;
GO

-- ============================================================
-- TABLA: Usuarios
-- Almacena los usuarios del sistema con roles y credenciales
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U'))
BEGIN
    CREATE TABLE Usuarios (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Username        NVARCHAR(50)  NOT NULL UNIQUE,
        PasswordHash    NVARCHAR(255) NOT NULL,
        Nombre          NVARCHAR(100) NOT NULL,
        Role            NVARCHAR(20)  NOT NULL DEFAULT 'user',
        Activo          BIT           NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABLA: Inventario
-- Almacena los productos del inventario con cantidades y costos
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inventario]') AND type in (N'U'))
BEGIN
    CREATE TABLE Inventario (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Codigo          NVARCHAR(20)  NOT NULL,
        Nombre          NVARCHAR(150) NOT NULL,
        Categoria       NVARCHAR(50)  NOT NULL,
        Cantidad        INT           NOT NULL DEFAULT 0,
        CostoUnitario   DECIMAL(12,2) NOT NULL DEFAULT 0,
        StockMinimo     INT           NOT NULL DEFAULT 10,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABLA: Costos
-- Almacena los registros de costos predeterminados calculados
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Costos]') AND type in (N'U'))
BEGIN
    CREATE TABLE Costos (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Producto        NVARCHAR(150) NOT NULL,
        Codigo          NVARCHAR(20)  NULL,
        Cantidad        INT           NOT NULL DEFAULT 0,
        MpCantEst       DECIMAL(12,2) NOT NULL DEFAULT 0,
        MpPrecioEst     DECIMAL(12,2) NOT NULL DEFAULT 0,
        MoCantEst       DECIMAL(12,2) NOT NULL DEFAULT 0,
        MoPrecioEst     DECIMAL(12,2) NOT NULL DEFAULT 0,
        CiCantEst       DECIMAL(12,2) NOT NULL DEFAULT 0,
        CiPrecioEst     DECIMAL(12,2) NOT NULL DEFAULT 0,
        MpCantReal      DECIMAL(12,2) NOT NULL DEFAULT 0,
        MpPrecioReal    DECIMAL(12,2) NOT NULL DEFAULT 0,
        MoCantReal      DECIMAL(12,2) NOT NULL DEFAULT 0,
        MoPrecioReal    DECIMAL(12,2) NOT NULL DEFAULT 0,
        CiCantReal      DECIMAL(12,2) NOT NULL DEFAULT 0,
        CiPrecioReal    DECIMAL(12,2) NOT NULL DEFAULT 0,
        TotalEst        DECIMAL(14,2) NOT NULL DEFAULT 0,
        TotalReal       DECIMAL(14,2) NOT NULL DEFAULT 0,
        Variacion       DECIMAL(14,2) NOT NULL DEFAULT 0,
        Resultado       NVARCHAR(20)  NULL,
        UsuarioId       INT           NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABLA: Proyecciones
-- Cabecera de las proyecciones de inventario
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Proyecciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE Proyecciones (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Fecha           DATETIME2     NOT NULL DEFAULT GETDATE(),
        Periodo         NVARCHAR(100) NULL,
        Crecimiento     DECIMAL(5,2)  NOT NULL DEFAULT 0,
        TotalActual     INT           NOT NULL DEFAULT 0,
        TotalProyectado INT           NOT NULL DEFAULT 0,
        UsuarioId       INT           NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABLA: ProyeccionDetalle
-- Detalle de cada item en una proyeccion de inventario
-- NOTA: Se elimina en cascada cuando se elimina la proyeccion padre
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProyeccionDetalle]') AND type in (N'U'))
BEGIN
    CREATE TABLE ProyeccionDetalle (
        Id                  INT IDENTITY(1,1) PRIMARY KEY,
        ProyeccionId        INT           NOT NULL,
        InventarioId        INT           NULL,
        Codigo              NVARCHAR(20)  NOT NULL,
        Nombre              NVARCHAR(150) NOT NULL,
        Categoria           NVARCHAR(50)  NULL,
        CantidadActual      INT           NOT NULL DEFAULT 0,
        CantidadProyectada  INT           NOT NULL DEFAULT 0,
        Diferencia          INT           NOT NULL DEFAULT 0,
        Porcentaje          NVARCHAR(10)  NULL,
        CostoUnitario       DECIMAL(12,2) NOT NULL DEFAULT 0,
        ValorActual         DECIMAL(14,2) NOT NULL DEFAULT 0,
        ValorProyectado     DECIMAL(14,2) NOT NULL DEFAULT 0
    );
END
GO

-- ============================================================
-- TABLA: AuditoriaLog
-- Registro de auditoria de todas las acciones del sistema
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditoriaLog]') AND type in (N'U'))
BEGIN
    CREATE TABLE AuditoriaLog (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Fecha           DATETIME2     NOT NULL DEFAULT GETDATE(),
        UsuarioId       INT           NULL,
        UsuarioNombre   NVARCHAR(100) NULL,
        Modulo          NVARCHAR(50)  NOT NULL,
        Accion          NVARCHAR(100) NOT NULL,
        Detalle         NVARCHAR(500) NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABLA: Sesiones
-- Sesiones activas con tokens JWT para autenticacion
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sesiones]') AND type in (N'U'))
BEGIN
    CREATE TABLE Sesiones (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId       INT           NOT NULL,
        Token           NVARCHAR(MAX) NOT NULL,
        FechaInicio     DATETIME2     NOT NULL DEFAULT GETDATE(),
        FechaExpiracion DATETIME2     NOT NULL,
        Activa          BIT           NOT NULL DEFAULT 1
    );
END
GO

PRINT '✅ Tablas creadas correctamente en FinovaDB';
GO
