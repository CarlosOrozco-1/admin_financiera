# FINOVA — Referencia de Estado de API y Base de Datos

## URLs principales

| Servicio | URL | Puerto | Estado |
|----------|-----|--------|--------|
| **API REST (Backend)** | `http://localhost:5000` | 5000 | En el login verás indicador |
| **Frontend (AdmonExamen)** | `http://localhost:8080` | 8080 | Siempre disponible |
| **SQL Server (BD)** | `localhost:1433` | 1433 | Verificado automáticamente |

## Indicador de estado en el login

En la esquina inferior derecha de la página de login hay un indicador que muestra:

### Estados posibles:
- 🟢 **Verde (Online)**: API operativa y BD conectada
- 🟠 **Naranja (Unknown)**: API responde pero BD con problemas
- 🔴 **Rojo (Offline)**: API no disponible o sin conexión

**El indicador se actualiza automáticamente cada 30 segundos.**

## Health Check (Verificación de Estado)

La API tiene un endpoint de health check que verifica:
- ✅ Estado de la API
- ✅ Conexión a la base de datos SQL Server

### Endpoint público (sin autenticación):
```
GET http://localhost:5000/api/health
```

### Respuesta exitosa:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-06-02T15:30:45.123Z"
}
```

## Cómo verificar el estado manualmente

### Opción 1: En el navegador
1. Ve a `http://localhost:5000/api/health`
2. Si ves JSON con `"database": "connected"`, todo está bien

### Opción 2: En la terminal
```bash
curl http://localhost:5000/api/health
```

### Opción 3: Con Postman
1. Abre Postman
2. Crea una petición **GET** a `http://localhost:5000/api/health`
3. Envía la petición (sin autenticación necesaria)

## Posibles problemas

### API offline (Error de conexión)
- Verifica que Docker esté ejecutándose
- Ejecuta: `docker compose ps`
- Si el contenedor `finova-api` no está corriendo, ejecuta: `docker compose up -d`

### BD desconectada (Error en health check)
- Verifica que SQL Server esté corriendo
- Ejecuta: `docker compose logs finova-sqlserver`
- Reinicia con: `docker compose restart finova-sqlserver`

### Puerto ocupado
- Si el puerto 5000 ya está en uso, cambia el valor `API_PORT` en `.env`
- Luego ejecuta: `docker compose down && docker compose up -d`

## Variables de entorno (.env)

Las siguientes variables controlan los puertos y conexiones:

```
API_PORT=5000              # Puerto del backend
FRONTEND_PORT=8080         # Puerto del frontend
DB_PORT=1433              # Puerto de SQL Server
SA_PASSWORD=YourPassword  # Contraseña de admin BD
JWT_KEY=your-secret-key   # Clave para JWT
```

## Script para levantar servicios

```bash
# Desde la raíz del proyecto (admin_financiera/)

# 1. Construir contenedores
docker compose build

# 2. Levantar servicios
docker compose up -d

# 3. Verificar estado
docker compose ps

# 4. Ver logs de la API
docker compose logs finova-api
```

## URLs útiles durante desarrollo

- **Health Check**: `http://localhost:5000/api/health`
- **Login**: `http://localhost:8080/login.html`
- **Dashboard**: `http://localhost:8080/dashboard.html`
- **Postman Collection**: `postman/FinovaAPI.postman_collection.json`

---

**Última actualización**: Junio 2, 2026
