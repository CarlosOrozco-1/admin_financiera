# Fase 3 — Backend: Autenticación (JWT)

## Objetivo
Implementar el módulo de autenticación en el backend con ASP.NET Core Web API y JWT.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión, devuelve JWT |
| POST | `/api/auth/logout` | Cerrar sesión (invalida token) |
| GET | `/api/auth/me` | Obtener información del usuario autenticado |

## Estructura
```
backend/FinovaApi/
├── Controllers/
│   └── AuthController.cs       # Endpoints de autenticación
├── Models/
│   ├── Usuario.cs              # Entidad Usuario
│   ├── Sesion.cs               # Entidad Sesión
│   ├── LoginRequest.cs         # DTO para login
│   └── LoginResponse.cs        # DTO para respuesta
├── Services/
│   └── AuthService.cs          # Lógica de autenticación, hash, JWT
├── Data/
│   └── FinovaDbContext.cs      # DbContext de EF Core
├── Middleware/
│   └── JwtMiddleware.cs        # Validación de tokens en requests
└── appsettings.json            # Configuración JWT (Secret, Issuer, etc.)
```

## Flujo de Login
1. Cliente envía `{ username, password }` a `POST /api/auth/login`
2. Servicio busca usuario en BD, verifica hash
3. Si es válido, genera JWT y crea registro en `Sesiones`
4. Devuelve `{ token, usuario { id, username, nombre, role } }`
5. Cliente almacena token en `sessionStorage`

## Flujo de Requests Autenticados
1. Cliente envía token en header `Authorization: Bearer <token>`
2. Middleware JWT valida token en cada request protegido
3. Si expiró o es inválido, devuelve 401 Unauthorized

## Próxima Fase
**Fase 4:** CRUD de inventario (backend).
