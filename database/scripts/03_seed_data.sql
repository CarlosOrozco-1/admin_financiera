-- ============================================================
-- SCRIPT: 03_seed_data.sql
-- DESCRIPCION: Datos iniciales para el sistema FINOVA
-- AUTOR: FINOVA Dev Team
-- FECHA: 2026-05-23
-- NOTA: Ejecutar despues de 01_create_tables.sql y 02_create_foreign_keys.sql
-- ============================================================

USE FinovaDB;
GO

-- ============================================================
// USUARIOS POR DEFECTO
// Password: admin123 / user123 (hasheadas con SHA2_256)
// ============================================================
IF NOT EXISTS (SELECT * FROM Usuarios WHERE Username = 'admin')
BEGIN
    INSERT INTO Usuarios (Username, PasswordHash, Nombre, Role)
    VALUES ('admin',   HASHBYTES('SHA2_256', 'admin123'), 'Administrador',   'admin'),
           ('usuario', HASHBYTES('SHA2_256', 'user123'),  'Usuario Estandar', 'user');
END
GO

-- ============================================================
// INVENTARIO DE EJEMPLO
// Datos iniciales para pruebas del modulo de inventario
// ============================================================
IF NOT EXISTS (SELECT * FROM Inventario)
BEGIN
    INSERT INTO Inventario (Codigo, Nombre, Categoria, Cantidad, CostoUnitario, StockMinimo)
    VALUES
        ('MP-001', 'Tela Algodon',      'Materia Prima',      500,  12.50, 100),
        ('MP-002', 'Hilo Industrial',   'Materia Prima',      1200, 3.75,  200),
        ('MP-003', 'Botones Metalicos',  'Materia Prima',      3000, 0.50,  500),
        ('MP-004', 'Zipper (Cremallera)', 'Materia Prima',    800,  2.25,  150),
        ('PT-001', 'Camisa Deportiva',   'Producto Terminado', 150,  45.00, 30),
        ('PT-002', 'Pantalon Formal',    'Producto Terminado', 80,   65.00, 20),
        ('IN-001', 'Aceite para Maquinas', 'Insumo',          25,   18.00, 10),
        ('IN-002', 'Agujas Industriales (paq)', 'Insumo',     50,   8.50,  15);
END
GO
