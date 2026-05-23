# AGENTS.md — Reglas de Desarrollo FINOVA

## Stack Tecnológico
- **Frontend:** HTML5, CSS3, JavaScript (vanilla), Chart.js, SheetJS (xlsx), jsPDF
- **Backend:** ASP.NET Core Web API (C#)
- **Base de Datos:** SQL Server (T-SQL, SSMS)
- **ORM:** Entity Framework Core (Database First / Code First)
- **Autenticación:** JWT (JSON Web Tokens)
- **API:** RESTful con consumo desde fetch() en el frontend
- **Control de Versiones:** Git (ramas: `desa` → `pro` → `master`)

## Reglas de Desarrollo

### 1. Comentarios en el Código
Todo código nuevo o modificado debe ser comentado:
- **Código nuevo:** Explicar su función y objetivo de implementación.
- **Código modificado:** Explicar el motivo del cambio (qué se corrigió o mejoró y por qué).

### 2. Actualización de Postman
Cada vez que se modifique un endpoint o ruta, se debe actualizar el archivo de Postman (`postman/FinovaAPI.postman_collection.json`), incluyendo la modificación o la implementación de un nuevo endpoint.

### 3. Flujo de Trabajo con Git
- La rama `desa` es la rama de desarrollo activo.
- La rama `pro` es para integración y pre-producción.
- La rama `master` es para producción (solo merges desde `pro`).
- Cada fase de implementación termina con un commit descriptivo en `desa`.
- Formato de commits: `tipo: mensaje descriptivo`
  - `feat:` — Nueva funcionalidad
  - `fix:` — Corrección de errores
  - `docs:` — Documentación
  - `refactor:` — Refactorización
  - `db:` — Cambios en base de datos
  - `chore:` — Tareas de mantenimiento

### 4. Estructura del Proyecto
```
Financiero/
├── frontend/          # Aplicación frontend (HTML/CSS/JS)
├── backend/           # API REST (ASP.NET Core)
│   └── FinovaApi/
│       ├── Controllers/   # Controladores (MVC - Controlador)
│       ├── Models/         # Modelos de datos (MVC - Modelo)
│       ├── Services/       # Lógica de negocio
│       ├── Data/           # DbContext y migraciones EF
│       └── Middleware/     # Middleware personalizado
├── database/          # Scripts SQL
│   └── scripts/
├── docs/              # Documentación
│   └── plan/          # Plan por fases
└── postman/           # Colecciones Postman
```

### 5. Convenciones de Código
- **C# (Backend):** PascalCase para clases, métodos, propiedades. camelCase para parámetros.
- **JavaScript (Frontend):** camelCase para variables y funciones. PascalCase para constructores/módulos.
- **SQL:** UPPER_CASE para palabras reservadas, PascalCase para nombres de tablas y columnas.
- **Rutas API:** plurales y en minúscula: `/api/inventario`, `/api/costos`.

### 6. Base de Datos
- Todos los scripts SQL se almacenan en `database/scripts/` con numeración secuencial.
- Separar creación de tablas, llaves foráneas, y datos iniciales en archivos distintos.
- Cada cambio de esquema debe ser un nuevo script numerado.

### 7. Pruebas
- Probar cada endpoint con Postman antes de integrar con el frontend.
- Verificar integridad referencial en la base de datos.
- Probar todos los flujos críticos: login, CRUD inventario, costos, proyecciones, auditoría.
