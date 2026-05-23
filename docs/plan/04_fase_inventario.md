# Fase 4 — Backend: CRUD Inventario

## Objetivo
Implementar el CRUD completo del módulo de inventario en la API.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/inventario` | Listar productos (filtros: categoria, busqueda) |
| GET | `/api/inventario/{id}` | Obtener producto por ID |
| POST | `/api/inventario` | Crear nuevo producto |
| PUT | `/api/inventario/{id}` | Actualizar producto existente |
| DELETE | `/api/inventario/{id}` | Eliminar producto |
| GET | `/api/inventario/stats` | Estadísticas del inventario |
| GET | `/api/inventario/categorias` | Listar categorías distintas |
| POST | `/api/inventario/import` | Importación masiva desde Excel |

## Estructura
```
backend/FinovaApi/
├── Controllers/
│   └── InventarioController.cs      # CRUD endpoints
├── Models/
│   ├── Inventario.cs                # Entidad Inventario
│   └── InventarioDto.cs             # DTOs para request/response
├── Services/
│   └── InventarioService.cs         # Lógica de negocio
```

## Reglas de Negocio
- No permitir `cantidad` negativa
- `stockMinimo` default = 10
- Al eliminar un producto, verificar que no tenga referencias en proyecciones
- Las estadísticas devuelven: totalItems, totalValue, lowStock, totalUnits

## Auditoría
Cada operación CRUD debe registrar en AuditoriaLog:
- Crear → `Inventario`, `Crear`, `${nombre}`
- Editar → `Inventario`, `Editar`, `${nombre}`
- Eliminar → `Inventario`, `Eliminar`, `${nombre}`

## Próxima Fase
**Fase 5:** CRUD de costos (backend).
