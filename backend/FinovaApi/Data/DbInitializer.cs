using FinovaApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace FinovaApi.Data;

public static class DbInitializer
{
    public static void Initialize(FinovaDbContext context)
    {
        // Esto creara la base de datos Sqlite con las tablas basadas en los modelos.
        context.Database.EnsureCreated();

        // Verificar si la base de datos ya tiene usuarios
        if (context.Usuarios.Any())
        {
            return; // DB ya fue sembrada
        }

        // 1. Usuarios por defecto
        var admin = new Usuario
        {
            Username = "admin",
            PasswordHash = ComputeSha256Hash("admin123"),
            Nombre = "Administrador",
            Role = "admin",
            Activo = true
        };

        var user = new Usuario
        {
            Username = "usuario",
            PasswordHash = ComputeSha256Hash("user123"),
            Nombre = "Usuario Estandar",
            Role = "user",
            Activo = true
        };

        context.Usuarios.AddRange(admin, user);

        // 2. Inventario de ejemplo
        var productos = new Inventario[]
        {
            new() { Codigo = "MP-001", Nombre = "Tela Algodon", Categoria = "Materia Prima", Cantidad = 500, CostoUnitario = 12.50m, StockMinimo = 100 },
            new() { Codigo = "MP-002", Nombre = "Hilo Industrial", Categoria = "Materia Prima", Cantidad = 1200, CostoUnitario = 3.75m, StockMinimo = 200 },
            new() { Codigo = "MP-003", Nombre = "Botones Metalicos", Categoria = "Materia Prima", Cantidad = 3000, CostoUnitario = 0.50m, StockMinimo = 500 },
            new() { Codigo = "MP-004", Nombre = "Zipper (Cremallera)", Categoria = "Materia Prima", Cantidad = 800, CostoUnitario = 2.25m, StockMinimo = 150 },
            new() { Codigo = "PT-001", Nombre = "Camisa Deportiva", Categoria = "Producto Terminado", Cantidad = 150, CostoUnitario = 45.00m, StockMinimo = 30 },
            new() { Codigo = "PT-002", Nombre = "Pantalon Formal", Categoria = "Producto Terminado", Cantidad = 80, CostoUnitario = 65.00m, StockMinimo = 20 },
            new() { Codigo = "IN-001", Nombre = "Aceite para Maquinas", Categoria = "Insumo", Cantidad = 25, CostoUnitario = 18.00m, StockMinimo = 10 },
            new() { Codigo = "IN-002", Nombre = "Agujas Industriales (paq)", Categoria = "Insumo", Cantidad = 50, CostoUnitario = 8.50m, StockMinimo = 15 }
        };

        context.Inventario.AddRange(productos);

        context.SaveChanges();
    }

    private static string ComputeSha256Hash(string rawData)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawData));
        return Convert.ToHexString(bytes);
    }
}
