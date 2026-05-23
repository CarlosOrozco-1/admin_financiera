# Fase 5 — Backend: CRUD Costos

## Objetivo
Implementar el módulo de costos predeterminados en la API.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/costos` | Listar registros de costos guardados |
| GET | `/api/costos/{id}` | Obtener registro por ID |
| POST | `/api/costos` | Guardar nuevo registro de costos |
| DELETE | `/api/costos/{id}` | Eliminar registro de costos |

## Estructura
```
backend/FinovaApi/
├── Controllers/
│   └── CostosController.cs          # Endpoints de costos
├── Models/
│   ├── Costo.cs                     # Entidad Costo
│   └── CostoDto.cs                  # DTOs
├── Services/
│   └── CostoService.cs              # Lógica de negocio
```

## Campos de un Registro de Costo
- `producto`, `codigo`, `cantidad` (datos del producto)
- `mpCantEst`, `mpPrecioEst`, `moCantEst`, `moPrecioEst`, `ciCantEst`, `ciPrecioEst` (estándar)
- `mpCantReal`, `mpPrecioReal`, `moCantReal`, `moPrecioReal`, `ciCantReal`, `ciPrecioReal` (real)
- `totalEst`, `totalReal`, `variacion`, `resultado` (calculados)
- `usuarioId` (relación con usuario que guardó)

## Auditoría
- Guardar → `Costos`, `Guardar en BD`, `Producto: ${nombre}`

## Próxima Fase
**Fase 6:** CRUD de proyecciones (backend).
