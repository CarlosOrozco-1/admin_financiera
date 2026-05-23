/* ============================================================
   APP - Punto de entrada principal
   Orquesta todos los módulos del sistema de costos
   ============================================================ */

/**
 * Función principal que coordina todos los cálculos.
 * Se ejecuta cada vez que el usuario modifica cualquier input.
 */
function calcularTodo() {
    // 1. Calcular costos estándar
    const estandar = calcularCostosEstandar();
    actualizarTablaEstandar(estandar);

    // 2. Calcular costos reales
    const real = calcularCostosReales();
    actualizarTablaReal(real);

    // 3. Calcular variaciones
    const variaciones = calcularVariaciones(estandar, real);
    const variacion = variaciones.variacionTotal;

    // 4. Actualizar tarjetas de resultados
    actualizarTarjetasResultados(estandar.total, real.total, variacion);

    // 5. Actualizar tabla de variaciones
    actualizarTablaVariaciones(estandar, real, variaciones);

    // 6. Calcular y mostrar costos unitarios
    const cantProd = getVal('cantidadProducida');
    const unitarios = calcularCostosUnitarios(estandar.total, real.total, variacion, cantProd);
    actualizarCostosUnitarios(unitarios);

    // 7. Actualizar informe final
    const nombre = document.getElementById('nombreProducto').value;
    const codigo = document.getElementById('codigoProducto').value;
    actualizarInformeFinal(nombre, codigo, cantProd, estandar.total, real.total, variacion);

    // 8. Generar análisis de texto
    generarAnalisis(
        nombre, codigo, cantProd,
        estandar.total, real.total, variacion,
        estandar.mp, real.mp,
        estandar.mo, real.mo,
        estandar.ci, real.ci
    );
}

/**
 * Abre el diálogo de impresión del navegador.
 * Permite guardar como PDF.
 */
function imprimirPDF() {
    window.print();
}

/**
 * Carga datos de ejemplo para demostrar el funcionamiento.
 */
function cargarEjemplo() {
    document.getElementById('nombreProducto').value = 'Camisa Deportiva';
    document.getElementById('codigoProducto').value = 'CAM-001';
    document.getElementById('cantidadProducida').value = '500';

    // Costos estándar
    document.getElementById('mpCantEst').value = '10';
    document.getElementById('mpPrecioEst').value = '5.00';
    document.getElementById('moCantEst').value = '8';
    document.getElementById('moPrecioEst').value = '12.50';
    document.getElementById('ciCantEst').value = '5';
    document.getElementById('ciPrecioEst').value = '8.00';

    // Costos reales
    document.getElementById('mpCantReal').value = '12';
    document.getElementById('mpPrecioReal').value = '6.00';
    document.getElementById('moCantReal').value = '9';
    document.getElementById('moPrecioReal').value = '13.00';
    document.getElementById('ciCantReal').value = '6';
    document.getElementById('ciPrecioReal').value = '9.50';

    calcularTodo();
    showToast('Datos de ejemplo cargados correctamente');
}

/**
 * Limpia todos los campos del formulario y recalcula.
 */
function limpiarTodo() {
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    inputs.forEach(input => input.value = '');
    calcularTodo();
    showToast('Formulario limpiado');
}

/* ---- INICIALIZACIÓN ---- */
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar observador de navegación
    initNavObserver();

    // Ejecutar cálculo inicial (todo en cero)
    calcularTodo();
});
