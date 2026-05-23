/* ============================================================
   ANALYSIS
   Generador del texto de análisis del informe final
   ============================================================ */

/**
 * Genera el texto de análisis automático basado en los costos.
 * @param {string} nombre - Nombre del producto
 * @param {string} codigo - Código del producto
 * @param {number} cantProd - Cantidad producida
 * @param {number} totalEst - Total estándar
 * @param {number} totalReal - Total real
 * @param {number} variacion - Variación total (real - estándar)
 * @param {number} mpEst - Materia prima estándar
 * @param {number} mpReal - Materia prima real
 * @param {number} moEst - Mano de obra estándar
 * @param {number} moReal - Mano de obra real
 * @param {number} ciEst - Costos indirectos estándar
 * @param {number} ciReal - Costos indirectos real
 */
function generarAnalisis(nombre, codigo, cantProd, totalEst, totalReal, variacion, mpEst, mpReal, moEst, moReal, ciEst, ciReal) {
    const container = document.getElementById('analisisTexto');

    // Si no hay datos, mostrar mensaje placeholder
    if (totalEst === 0 && totalReal === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Ingrese los datos del producto y los costos para generar el análisis automático.</p>';
        return;
    }

    // Calcular porcentaje de variación
    const pctVar = totalEst !== 0 ? ((variacion / totalEst) * 100) : 0;
    const absVar = Math.abs(variacion);
    const absPct = Math.abs(pctVar).toFixed(2);

    // Determinar tipo de variación y generar explicación
    let colorVar = '';
    let explicacion = '';

    if (variacion < 0) {
        colorVar = 'var(--green)';
        explicacion = `La empresa logró un ahorro de <strong style="color:${colorVar}">${formatQ(absVar)}</strong> (${absPct}%) respecto al costo presupuestado. Esto indica una gestión eficiente de los recursos durante el proceso productivo.`;
    } else if (variacion > 0) {
        colorVar = 'var(--red)';
        explicacion = `Se incurrió en un sobrecosto de <strong style="color:${colorVar}">${formatQ(absVar)}</strong> (${absPct}%) respecto al costo presupuestado. Es necesario revisar los procesos para identificar las causas del incremento en los costos.`;
    } else {
        colorVar = 'var(--yellow)';
        explicacion = 'Los costos reales coinciden exactamente con los costos estándar presupuestados. Esto refleja una planificación precisa del proceso productivo.';
    }

    // Identificar concepto con mayor desviación
    const desviaciones = [
        { nombre: 'Materia Prima', est: mpEst, real: mpReal, diff: Math.abs(mpReal - mpEst) },
        { nombre: 'Mano de Obra', est: moEst, real: moReal, diff: Math.abs(moReal - moEst) },
        { nombre: 'Costos Indirectos', est: ciEst, real: ciReal, diff: Math.abs(ciReal - ciEst) },
    ];
    desviaciones.sort((a, b) => b.diff - a.diff);

    let detalleConcepto = '';
    if (desviaciones[0].diff > 0) {
        const mayor = desviaciones[0];
        const dirMayor = mayor.real > mayor.est ? 'un incremento' : 'una reducción';
        detalleConcepto = `<br><br>El concepto con mayor impacto en la variación es <strong>${mayor.nombre}</strong>, con ${dirMayor} de <strong>${formatQ(mayor.diff)}</strong> respecto al estándar.`;
    }

    // Detalle por unidad producida
    let detalleCantidad = '';
    if (cantProd > 0) {
        detalleCantidad = `<br><br>Para una producción de <strong>${cantProd.toLocaleString('es-GT')} unidades</strong>, el costo estándar por unidad es de <strong>${formatQ(totalEst / cantProd)}</strong> y el costo real por unidad es de <strong>${formatQ(totalReal / cantProd)}</strong>.`;
    }

    container.innerHTML = `<p>${explicacion}${detalleConcepto}${detalleCantidad}</p>`;
}
