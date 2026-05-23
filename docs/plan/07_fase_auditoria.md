# Fase 7 — Backend: CRUD Auditoría

## Objetivo
Implementar el módulo de auditoría en la API.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auditoria` | Listar registros con filtros (modulo, usuario, fechas) |
| GET | `/api/auditoria/stats` | Estadísticas de auditoría |
| DELETE | `/api/auditoria` | Limpiar todo el historial (solo admin) |

## Estructura
```
backend/FinovaApi/
├── Controllers/
│   └── AuditoriaController.cs       # Endpoints de auditoría
├── Models/
│   ├── AuditoriaLog.cs              # Entidad
│   └── AuditoriaDto.cs              # DTOs
├── Services/
│   └── AuditoriaService.cs          # Lógica de negocio
```

## Filtros
- `modulo` — Filtrar por módulo (Login, Costos, Inventario, Proyección, Auditoría, Sistema)
- `usuarioId` — Filtrar por usuario
- `fechaDesde` / `fechaHasta` — Rango de fechas
- `page` / `limit` — Paginación

## Reglas
- Solo admin puede limpiar el historial
- Las estadísticas devuelven: total, count by module, count by action, count by user
- El servicio de auditoría debe ser inyectado en los demás servicios para registrar acciones

## Próxima Fase
**Fase 8:** Dashboard endpoint.
