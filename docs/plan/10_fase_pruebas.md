# Fase 10 — Pruebas Integrales y Ajustes Finales

## Objetivo
Realizar pruebas completas de todos los módulos, corregir errores y preparar el pase a producción.

## Plan de Pruebas

### 1. Autenticación
- [ ] Login con credenciales válidas → obtiene JWT
- [ ] Login con credenciales inválidas → error 401
- [ ] Acceder a endpoint protegido sin token → error 401
- [ ] Acceder a endpoint protegido con token expirado → error 401
- [ ] Cerrar sesión → token invalidado

### 2. Inventario (CRUD)
- [ ] Listar productos (con y sin filtros)
- [ ] Crear producto con datos válidos
- [ ] Crear producto con datos inválidos (nombre vacío) → error
- [ ] Actualizar producto
- [ ] Eliminar producto
- [ ] Verificar que la auditoría registre cada operación

### 3. Costos
- [ ] Guardar registro de costos
- [ ] Listar registros guardados
- [ ] Eliminar registro

### 4. Proyecciones
- [ ] Guardar proyección con items
- [ ] Listar proyecciones guardadas
- [ ] Ver detalle de una proyección (con items)
- [ ] Eliminar proyección (verificar CASCADE en detalle)

### 5. Auditoría
- [ ] Listar registros con filtros (módulo, fechas, usuario)
- [ ] Ver estadísticas de auditoría
- [ ] Limpiar historial (admin)
- [ ] Usuario no-admin no puede limpiar historial

### 6. Dashboard
- [ ] Ver stats correctas (productos, costos, auditoría)
- [ ] Ver actividad reciente (últimos 6 registros)

### 7. Frontend
- [ ] Toda la navegación funciona correctamente
- [ ] Los datos se cargan desde la API
- [ ] El manejo de errores muestra mensajes al usuario
- [ ] Los temas (light/dark/brisa) funcionan
- [ ] Exportación a Excel/PDF funciona

## Criterios de Aceptación
- Todas las pruebas pasan
- No hay regresiones en funcionalidad existente
- La aplicación responde correctamente a errores de red
- Los datos persisten en SQL Server después de recargar la página

## Checklist Final
- [ ] Código comentado según reglas de AGENTS.md
- [ ] Colección de Postman actualizada con todos los endpoints
- [ ] Scripts SQL actualizados
- [ ] Documentación actualizada
- [ ] Merge de `desa` a `pro`
- [ ] Pruebas en entorno de pre-producción
- [ ] Merge de `pro` a `master`
