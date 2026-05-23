# Fase 8 — Backend: Dashboard

## Objetivo
Implementar el endpoint que consolida las estadísticas del dashboard principal.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Estadísticas consolidadas para el dashboard |

## Estructura
```
backend/FinovaApi/
├── Controllers/
│   └── DashboardController.cs       # Endpoint del dashboard
├── Models/
│   └── DashboardDto.cs              # DTO con stats
├── Services/
│   └── DashboardService.cs          # Lógica para consolidar datos
```

## Datos que Devuelve
```json
{
  "totalProductos": 8,
  "totalRegistrosCostos": 5,
  "totalAccionesAuditoria": 42,
  "ultimoAcceso": "2026-05-23T14:30:00",
  "actividadReciente": [
    {
      "id": 1,
      "fecha": "2026-05-23T14:30:00",
      "modulo": "Inventario",
      "accion": "Crear",
      "detalle": "Tela Algodón",
      "usuario": "admin"
    }
  ],
  "productosStockBajo": 2,
  "valorTotalInventario": 12500.00
}
```

## Próxima Fase
**Fase 9:** Consumo de API desde el frontend.
