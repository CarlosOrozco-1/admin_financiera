# Fase 9 — Frontend: Consumo de API

## Objetivo
Modificar el frontend actual para que consuma la API REST en lugar de localStorage.

## Archivos a Modificar/Crear

### Nuevo Archivo
- `frontend/js/api.js` — Cliente HTTP genérico con fetch(), manejo de JWT y errores

### Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `frontend/js/database.js` | Eliminar o reemplazar con llamadas a API |
| `frontend/js/auth.js` | `login()` llama a `POST /api/auth/login`, almacena JWT |
| `frontend/js/inventory.js` | Reemplazar localStorage por llamadas a API |
| `frontend/js/inventory-projection.js` | Reemplazar `FiNovaDB.save()` por API |
| `frontend/js/audit.js` | Reemplazar localStorage por llamadas a API |
| `frontend/login.html` | Sin cambios estructurales, solo apunta al nuevo auth.js |
| `frontend/dashboard.html` | Reemplazar `FiNovaDB.count()` por `fetch('/api/dashboard/stats')` |
| `frontend/costos.html` | Reemplazar `FiNovaDB.save()` por API |
| `frontend/inventario.html` | Sin cambios estructurales, consume desde inventory.js |
| `frontend/proyeccion.html` | Sin cambios estructurales |
| `frontend/auditoria.html` | Reemplazar `FiNovaAudit.getAll()` por API |

## api.js — Cliente HTTP
```javascript
const FinovaAPI = {
    baseURL: 'http://localhost:5000/api',
    token: null,

    async request(method, path, body = null) { ... },
    async get(path) { ... },
    async post(path, body) { ... },
    async put(path, body) { ... },
    async delete(path) { ... },
    setToken(token) { ... },
    getToken() { ... },
    clearToken() { ... }
};
```

## Flujo de Integración
1. `api.js` se carga primero en todas las páginas
2. Cada módulo llama a `FinovaAPI.get/post/put/delete` según corresponda
3. En cada request se incluye el header `Authorization: Bearer <token>`
4. Si el token expira (401), redirigir a login

## Próxima Fase
**Fase 10:** Pruebas integrales y ajustes finales.
