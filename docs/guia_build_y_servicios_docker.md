# Guía de Build y Levantamiento de Servicios (Docker)

Este documento explica cómo preparar y ejecutar FINOVA en un equipo nuevo después de clonar el repositorio.

## 1) Requisitos previos

- Git instalado.
- Docker Desktop instalado y en ejecución.
- Puertos disponibles en el host:
  - `1433` (SQL Server)
  - `5000` (API)
  - `8080` (Frontend)

## 2) Clonar el repositorio

```bash
git clone https://github.com/CarlosOrozco-1/admin_financiera.git
cd admin_financiera
```

Si trabajarás sobre desarrollo:

```bash
git checkout desa
```

## 3) Crear archivo de entorno

Crear `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Editar `.env` y ajustar valores si es necesario. Valores base:

- `SA_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `API_PORT`
- `FRONTEND_PORT`
- `JWT_KEY`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `ADMIN_NOMBRE`

## 4) Build de contenedores

Desde la raíz del proyecto:

```bash
docker compose build
```

Este comando construye:

- `api` desde `backend/FinovaApi/Dockerfile`
- `frontend` desde `AdmonExamen/Dockerfile`

## 5) Levantar servicios

```bash
docker compose up -d
```

Servicios esperados:

- `finova-sqlserver`
- `finova-db-init` (se ejecuta una vez para inicialización)
- `finova-api`
- `finova-frontend`

## 6) Verificación rápida

Ver estado de contenedores:

```bash
docker compose ps
```

Ver logs (opcional):

```bash
docker compose logs -f
```

Accesos por defecto:

- Frontend: `http://localhost:8080`
- API: `http://localhost:5000`

## 7) Apagar servicios

```bash
docker compose down
```

Si se requiere limpiar también volúmenes de datos:

```bash
docker compose down -v
```

## 8) Reinicio limpio recomendado (opcional)

Cuando quieras reconstruir todo desde cero:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## 9) Notas útiles

- El contenedor `db-init` depende de que SQL Server esté healthy y luego crea/inicializa la base.
- Si cambias scripts SQL en `database/scripts/`, normalmente conviene reiniciar con `down -v` para re-aplicar desde cero en entorno local.
- Si un puerto está ocupado, modifica el valor correspondiente en `.env` y vuelve a levantar servicios.
