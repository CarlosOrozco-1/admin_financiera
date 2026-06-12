/* ============================================================
   CALCULATIONS
   Motor principal de cálculos de costos
   ============================================================ */

/**
 * Calcula los totales de costo estándar.
 * @returns {{mp: number, mo: number, ci: number, total: number}}
 */
function calcularCostosEstandar() {
    const mp = getVal('mpCantEst') * getVal('mpPrecioEst');
    const mo = getVal('moCantEst') * getVal('moPrecioEst');
    const ci = getVal('ciCantEst') * getVal('ciPrecioEst');
    const total = mp + mo + ci;
    return { mp, mo, ci, total };
}

/**
 * Calcula los totales de costo real.
 * @returns {{mp: number, mo: number, ci: number, total: number}}
 */
function calcularCostosReales() {
    const mp = getVal('mpCantReal') * getVal('mpPrecioReal');
    const mo = getVal('moCantReal') * getVal('moPrecioReal');
    const ci = getVal('ciCantReal') * getVal('ciPrecioReal');
    const total = mp + mo + ci;
    return { mp, mo, ci, total };
}

/**
 * Calcula las variaciones entre estándar y real.
 * @param {{mp: number, mo: number, ci: number, total: number}} estandar
 * @param {{mp: number, mo: number, ci: number, total: number}} real
 * @returns {{mp: object, mo: object, ci: object, total: object, variacionTotal: number}}
 */
function calcularVariaciones(estandar, real) {
    return {
        mp: variationStatus(estandar.mp, real.mp),
        mo: variationStatus(estandar.mo, real.mo),
        ci: variationStatus(estandar.ci, real.ci),
        total: variationStatus(estandar.total, real.total),
        variacionTotal: real.total - estandar.total
    };
}

/**
 * Calcula los costos por unidad producida.
 * @param {number} totalEst - Total estándar
 * @param {number} totalReal - Total real
 * @param {number} variacion - Variación total
 * @param {number} cantProd - Cantidad producida
 * @returns {{unitEst: number, unitReal: number, unitVar: number}}
 */
function calcularCostosUnitarios(totalEst, totalReal, variacion, cantProd) {
    if (cantProd <= 0) {
        return { unitEst: 0, unitReal: 0, unitVar: 0 };
    }
    return {
        unitEst: totalEst / cantProd,
        unitReal: totalReal / cantProd,
        unitVar: Math.abs(variacion) / cantProd
    };
}
