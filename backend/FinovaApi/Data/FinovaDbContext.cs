using Microsoft.EntityFrameworkCore;
using FinovaApi.Models;

namespace FinovaApi.Data;

/*
 * Contexto de Entity Framework Core para la base de datos FinovaDB.
 * Configura las entidades y sus relaciones con la base de datos SQL Server.
 */
public class FinovaDbContext : DbContext
{
    public FinovaDbContext(DbContextOptions<FinovaDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Sesion> Sesiones { get; set; }
    public DbSet<Inventario> Inventario { get; set; }
    public DbSet<Costo> Costos { get; set; }
    public DbSet<Proyeccion> Proyecciones { get; set; }
    public DbSet<ProyeccionDetalle> ProyeccionDetalles { get; set; }
    public DbSet<AuditoriaLog> AuditoriaLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuracion de indices para mejorar rendimiento en busquedas frecuentes
        modelBuilder.Entity<Inventario>()
            .HasIndex(i => i.Categoria)
            .HasDatabaseName("IX_Inventario_Categoria");

        modelBuilder.Entity<Inventario>()
            .HasIndex(i => i.Codigo)
            .HasDatabaseName("IX_Inventario_Codigo");

        modelBuilder.Entity<AuditoriaLog>()
            .HasIndex(a => a.Modulo)
            .HasDatabaseName("IX_AuditoriaLog_Modulo");

        modelBuilder.Entity<AuditoriaLog>()
            .HasIndex(a => a.Fecha)
            .HasDatabaseName("IX_AuditoriaLog_Fecha")
            .IsDescending();

        modelBuilder.Entity<AuditoriaLog>()
            .HasIndex(a => a.UsuarioId)
            .HasDatabaseName("IX_AuditoriaLog_UsuarioId");

        // FK: ProyeccionDetalle -> Proyecciones (eliminacion en cascada)
        modelBuilder.Entity<ProyeccionDetalle>()
            .HasOne<Proyeccion>()
            .WithMany(p => p.Detalles)
            .HasForeignKey(pd => pd.ProyeccionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
