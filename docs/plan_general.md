# Plan General de Implementación — FINOVA

## Objetivo
Migrar la aplicación FINOVA de almacenamiento local (localStorage) a una arquitectura profesional con **SQL Server + API REST + Frontend**, siguiendo el patrón **Modelo-Vista-Controlador (MVC)**.

## Arquitectura
```
Cliente (HTML/JS) → API REST (ASP.NET Core) → SQL Server (SSMS)
                        ↓
               Entity Framework Core
```

## Módulos del Sistema
| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | Autenticación | Login/logout con JWT, roles admin/user |
| 2 | Inventario | CRUD productos, categorías, stock |
| 3 | Costos | Cálculo y guardado de costos predeterminados |
| 4 | Proyecciones | Proyección de inventario con porcentaje de crecimiento |
| 5 | Auditoría | Registro de todas las acciones del sistema |
| 6 | Dashboard | Estadísticas consolidadas y actividad reciente |

## Fases de Implementación
| Fase | Nombre | Estado |
|------|--------|--------|
| 1 | Configuración inicial del proyecto | ✅ Completada |
| 2 | Base de datos — esquema inicial | ⬜ Pendiente |
| 3 | Backend — autenticación (JWT) | ⬜ Pendiente |
| 4 | Backend — CRUD inventario | ⬜ Pendiente |
| 5 | Backend — CRUD costos | ⬜ Pendiente |
| 6 | Backend — CRUD proyecciones | ⬜ Pendiente |
| 7 | Backend — CRUD auditoría | ⬜ Pendiente |
| 8 | Backend — dashboard | ⬜ Pendiente |
| 9 | Frontend — consumo de API | ⬜ Pendiente |
| 10 | Pruebas integrales y ajustes | ⬜ Pendiente |

## Modelo de Datos (Entidades)
```
Usuarios ────< AuditoriaLog
Usuarios ────< Costos
Usuarios ────< Sesiones
Inventario ────< ProyeccionDetalle
Proyecciones ────< ProyeccionDetalle
```

## Convenciones
- **Ramas Git:** `desa` → desarrollo, `pro` → pre-producción, `master` → producción
- **Commits:** `tipo: mensaje` (feat, fix, docs, refactor, db, chore)
- **Postman:** Actualizar colección en cada cambio de endpoint
