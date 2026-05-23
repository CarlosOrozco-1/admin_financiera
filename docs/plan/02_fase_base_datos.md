# Fase 2 — Base de Datos: Esquema Inicial

## Objetivo
Crear la base de datos y todas las tablas del sistema FINOVA en SQL Server.

## Tablas a Crear
| Tabla | Descripción |
|-------|-------------|
| Usuarios | Usuarios del sistema (admin, user) |
| Inventario | Productos en inventario con cantidades y costos |
| Costos | Registros de costos predeterminados guardados |
| Proyecciones | Cabecera de proyecciones de inventario |
| ProyeccionDetalle | Detalle de cada proyección (items) |
| AuditoriaLog | Registro de auditoría de acciones |
| Sesiones | Sesiones activas con tokens JWT |

## Scripts SQL
- `database/scripts/01_create_tables.sql` — Creación de todas las tablas con columnas, tipos,约束 y defaults
- `database/scripts/02_create_foreign_keys.sql` — Creación de llaves foráneas entre tablas
- `database/scripts/03_seed_data.sql` — Datos iniciales (usuarios, inventario de ejemplo)

## Decisiones Técnicas
- Passwords almacenados con hash SHA2_256
- `INT IDENTITY` como llave primaria en todas las tablas
- `DATETIME2` para campos de fecha
- `DECIMAL(12,2)` para campos monetarios
- Índices en columnas de búsqueda frecuente (categoría, módulo, fechas)
- `ON DELETE CASCADE` en ProyeccionDetalle al eliminar una proyección

## Relaciones
```
Usuarios.Id ────< AuditoriaLog.UsuarioId
Usuarios.Id ────< Costos.UsuarioId
Usuarios.Id ────< Proyecciones.UsuarioId
Usuarios.Id ────< Sesiones.UsuarioId
Proyecciones.Id ────< ProyeccionDetalle.ProyeccionId (CASCADE)
Inventario.Id ────< ProyeccionDetalle.InventarioId
```

## Próxima Fase
**Fase 3:** Creación del backend con autenticación JWT.
