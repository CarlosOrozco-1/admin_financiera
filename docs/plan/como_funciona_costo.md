# ¿Cómo funciona la creación de un costo?

Al hacer `POST /api/costos`, el backend recibe los datos ingresados por el usuario y realiza el cálculo automáticamente **antes de guardar en la base de datos**.

## Datos que ingresa el usuario

| Campo | Descripción |
|-------|-------------|
| `codigo`, `producto` | Identificación del producto |
| `tipoCosto` | Tipo de costo (ej: Predeterminado) |
| `mpCantEst`, `mpPrecioEst` | Cantidad y precio estándar de Materia Prima |
| `mpCantReal`, `mpPrecioReal` | Cantidad y precio real de Materia Prima |
| `moCantEst`, `moPrecioEst` | Cantidad y precio estándar de Mano de Obra |
| `moCantReal`, `moPrecioReal` | Cantidad y precio real de Mano de Obra |
| `ciCantEst`, `ciPrecioEst` | Cantidad y precio estándar de Carga Indirecta |
| `ciCantReal`, `ciPrecioReal` | Cantidad y precio real de Carga Indirecta |

## Cálculos automáticos (backend)

```
TotalEst  = (mpCantEst x mpPrecioEst) + (moCantEst x moPrecioEst) + (ciCantEst x ciPrecioEst)
TotalReal = (mpCantReal x mpPrecioReal) + (moCantReal x moPrecioReal) + (ciCantReal x ciPrecioReal)
Variacion = TotalReal - TotalEst
```

Una vez calculada la variación, se determina el resultado:
- **Variación < 0** → "Favorable" (costos reales menores que los estándar → ahorro)
- **Variación > 0** → "Desfavorable" (costos reales mayores que los estándar → pérdida)
- **Variación = 0** → "Sin variación" (costos exactamente iguales)

## Ejemplo práctico

**Datos ingresados:**
```
MP: 2.5u x Q15.00 (est) | 3.0u x Q14.50 (real)
MO: 1.5h x Q20.00 (est) | 1.5h x Q22.00 (real)
CI: 1.0u x Q5.00 (est)  | 1.0u x Q4.80 (real)
```

**Cálculo realizado por el backend:**
```
TotalEst  = (2.5x15) + (1.5x20) + (1x5)     = 37.50 + 30.00 + 5.00  = 72.50
TotalReal = (3.0x14.50) + (1.5x22) + (1x4.80) = 43.50 + 33.00 + 4.80  = 81.30
Variacion = 81.30 - 72.50 = 8.80 → "Desfavorable"
```

## ¿Qué se guarda en la base de datos?

Se guardan **todos los campos** (los ingresados y los calculados) en la tabla `Costos`. Al hacer `GET /api/costos/{id}`, la API devuelve el registro completo con los cálculos ya realizados.

## Ubicación del código

- **Servicio:** `Services/CostoService.cs` — método `Create()` que realiza los cálculos
- **Modelo:** `Models/Costo.cs` — propiedades TotalEst, TotalReal, Variacion, Resultado
- **Controlador:** `Controllers/CostosController.cs` — endpoints GET, POST, DELETE
