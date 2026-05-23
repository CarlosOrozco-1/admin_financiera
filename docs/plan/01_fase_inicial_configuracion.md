# Fase 1 — Configuración Inicial del Proyecto

## Objetivo
Establecer la estructura del proyecto, control de versiones, y las bases organizativas para el desarrollo.

## Tareas Realizadas
- [x] Inicializar repositorio Git
- [x] Crear ramas `desa` y `pro`
- [x] Crear estructura de carpetas del proyecto
- [x] Crear `.gitignore`
- [x] Crear `AGENTS.md` con reglas de desarrollo
- [x] Crear carpeta `docs/` con plan general y plan por fases
- [x] Crear carpeta `database/scripts/` para scripts SQL
- [x] Crear carpeta `postman/` para colecciones de Postman
- [x] Crear carpeta `backend/` con estructura MVC (Controllers, Models, Services, Data, Middleware)
- [x] Crear carpeta `frontend/`

## Estructura Generada
```
Financiero/
├── frontend/                  # Aplicación frontend
├── backend/                   # API REST (ASP.NET Core)
│   └── FinovaApi/
│       ├── Controllers/       # Controladores
│       ├── Models/            # Modelos de datos
│       ├── Services/          # Lógica de negocio
│       ├── Data/              # DbContext EF Core
│       └── Middleware/        # Middleware (JWT, etc.)
├── database/                  # Scripts SQL
│   └── scripts/
│       ├── 01_create_tables.sql
│       ├── 02_create_foreign_keys.sql
│       └── 03_seed_data.sql
├── docs/                      # Documentación
│   ├── plan/                  # Plan por fases
│   └── plan_general.md        # Plan general
├── postman/                   # Colecciones Postman
│   └── FinovaAPI.postman_collection.json
├── AGENTS.md                  # Reglas de desarrollo
└── .gitignore
```

## Próxima Fase
**Fase 2:** Creación del esquema de base de datos en SQL Server.
