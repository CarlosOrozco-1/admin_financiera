/* ============================================================
   UI
   Funciones de actualización de la interfaz de usuario
   ============================================================ */

/**
 * Actualiza las celdas de totales en la tabla de costos estándar.
 * @param {{mp: number, mo: number, ci: number, total: number}} costos
 */
function actualizarTablaEstandar(costos) {
    setText('mpTotalEst', formatQ(costos.mp));
    setText('moTotalEst', formatQ(costos.mo));
    setText('ciTotalEst', formatQ(costos.ci));
    setText('totalEstandar', formatQ(costos.total));
}

/**
 * Actualiza las celdas de totales en la tabla de costos reales.
 * @param {{mp: number, mo: number, ci: number, total: number}} costos
 */
function actualizarTablaReal(costos) {
    setText('mpTotalReal', formatQ(costos.mp));
    setText('moTotalReal', formatQ(costos.mo));
    setText('ciTotalReal', formatQ(costos.ci));
    setText('totalReal', formatQ(costos.total));
}

/**
 * Actualiza las tarjetas de resumen de resultados.
 * @param {number} totalEst
 * @param {number} totalReal
 * @param {number} variacion
 */
function actualizarTarjetasResultados(totalEst, totalReal, variacion) {
    setText('resEstandar', formatQ(totalEst));
    setText('resReal', formatQ(totalReal));
    setText('resVariacion', formatQ(Math.abs(variacion)));

    // Badge de resultado
    let statusHTML = '';
    if (totalEst === 0 && totalReal === 0) {
        statusHTML = `<span class="variation-badge neutral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Sin datos</span>`;
    } else if (variacion < 0) {
        statusHTML = `<span class="variation-badge favorable">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
            FAVORABLE</span>`;
    } else if (variacion > 0) {
        statusHTML = `<span class="variation-badge desfavorable">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            DESFAVORABLE</span>`;
    } else {
        statusHTML = `<span class="variation-badge neutral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            SIN VARIACIÓN</span>`;
    }
    setHTML('resStatus', statusHTML);
}

/**
 * Genera el HTML de un badge de variación pequeño para las tablas.
 * @param {{cls: string, label: string}} v - Objeto de variación
 * @returns {string} HTML del badge o '—'
 */
function badgeHTML(v) {
    return v.cls
        ? `<span class="variation-badge ${v.cls}" style="font-size:0.75rem;padding:0.25rem 0.7rem;">${v.label}</span>`
        : '—';
}

/**
 * Actualiza la tabla de desglose de variaciones.
 * @param {{mp: number, mo: number, ci: number, total: number}} estandar
 * @param {{mp: number, mo: number, ci: number, total: number}} real
 * @param {object} variaciones
 */
function actualizarTablaVariaciones(estandar, real, variaciones) {
    // Materia prima
    setText('varMpEst', formatQ(estandar.mp));
    setText('varMpReal', formatQ(real.mp));
    setText('varMpDiff', formatQ(Math.abs(variaciones.mp.diff)));
    setHTML('varMpStatus', badgeHTML(variaciones.mp));

    // Mano de obra
    setText('varMoEst', formatQ(estandar.mo));
    setText('varMoReal', formatQ(real.mo));
    setText('varMoDiff', formatQ(Math.abs(variaciones.mo.diff)));
    setHTML('varMoStatus', badgeHTML(variaciones.mo));

    // Costos indirectos
    setText('varCiEst', formatQ(estandar.ci));
    setText('varCiReal', formatQ(real.ci));
    setText('varCiDiff', formatQ(Math.abs(variaciones.ci.diff)));
    setHTML('varCiStatus', badgeHTML(variaciones.ci));

    // Totales
    setText('varTotalEst', formatQ(estandar.total));
    setText('varTotalReal', formatQ(real.total));
    setText('varTotalDiff', formatQ(Math.abs(variaciones.variacionTotal)));
    setHTML('varTotalStatus', badgeHTML(variaciones.total));
}

/**
 * Actualiza los costos por unidad producida.
 * @param {{unitEst: number, unitReal: number, unitVar: number}} unitarios
 */
function actualizarCostosUnitarios(unitarios) {
    setText('costoUnitEst', formatQ(unitarios.unitEst));
    setText('costoUnitReal', formatQ(unitarios.unitReal));
    setText('costoUnitVar', formatQ(unitarios.unitVar));
}

/**
 * Actualiza la tabla resumen del informe final.
 * @param {string} nombre
 * @param {string} codigo
 * @param {number} cantProd
 * @param {number} totalEst
 * @param {number} totalReal
 * @param {number} variacion
 */
function actualizarInformeFinal(nombre, codigo, cantProd, totalEst, totalReal, variacion) {
    setText('infProducto', nombre || '—');
    setText('infCodigo', codigo || '—');
    setText('infCantidad', cantProd > 0 ? cantProd.toLocaleString('es-GT') + ' unidades' : '—');
    setText('infEstandar', formatQ(totalEst));
    setText('infReal', formatQ(totalReal));

    const infVarEl = document.getElementById('infVariacion');
    infVarEl.textContent = formatQ(Math.abs(variacion));

    const infResEl = document.getElementById('infResultado');
    if (totalEst === 0 && totalReal === 0) {
        infResEl.textContent = '—';
        infResEl.style.color = 'var(--text-muted)';
        infVarEl.style.color = 'var(--text-muted)';
    } else if (variacion < 0) {
        infResEl.textContent = '✓ FAVORABLE';
        infResEl.style.color = 'var(--green)';
        infVarEl.style.color = 'var(--green)';
    } else if (variacion > 0) {
        infResEl.textContent = '✗ DESFAVORABLE';
        infResEl.style.color = 'var(--red)';
        infVarEl.style.color = 'var(--red)';
    } else {
        infResEl.textContent = '= SIN VARIACIÓN';
        infResEl.style.color = 'var(--yellow)';
        infVarEl.style.color = 'var(--yellow)';
    }
}

/**
 * Muestra un toast de notificación.
 * @param {string} message - Mensaje a mostrar
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastText');
    text.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
