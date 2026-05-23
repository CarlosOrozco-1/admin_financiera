# Fase 6 — Backend: CRUD Proyecciones

## Objetivo
Implementar el módulo de proyecciones de inventario en la API.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/proyecciones` | Listar proyecciones guardadas |
| GET | `/api/proyecciones/{id}` | Obtener proyección con detalle |
| POST | `/api/proyecciones` | Guardar nueva proyección |
| DELETE | `/api/proyecciones/{id}` | Eliminar proyección |

## Estructura
```
backend/FinovaApi/
├── Controllers/
│   └── ProyeccionesController.cs    # Endpoints de proyecciones
├── Models/
│   ├── Proyeccion.cs                # Entidad cabecera
│   ├── ProyeccionDetalle.cs         # Entidad detalle
│   └── ProyeccionDto.cs             # DTOs
├── Services/
│   └── ProyeccionService.cs         # Lógica de negocio
```

## Relación
- `Proyecciones` 1 → N `ProyeccionDetalle`
- Al guardar, se recibe un array de items y se guardan en la tabla detalle
- Cada item del detalle referencia al `Inventario.Id` (opcional, por si se elimina el producto)

## Auditoría
- Guardar → `Proyección`, `Guardar`, `Proyección con ${pct}% de crecimiento`

## Próxima Fase
**Fase 7:** CRUD de auditoría (backend).
