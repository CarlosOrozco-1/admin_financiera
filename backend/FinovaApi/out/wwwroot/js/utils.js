/* ============================================================
   UTILS
   Funciones utilitarias reutilizables
   ============================================================ */

/**
 * Obtiene el valor numérico de un input por su ID.
 * Retorna 0 si el valor no es un número válido.
 * @param {string} id - ID del elemento input
 * @returns {number}
 */
function getVal(id) {
    const v = parseFloat(document.getElementById(id).value);
    return isNaN(v) ? 0 : v;
}

/**
 * Formatea un número como moneda guatemalteca (Quetzales).
 * @param {number} n - Número a formatear
 * @returns {string} Ej: "Q 1,250.00"
 */
function formatQ(n) {
    return 'Q ' + n.toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Establece el contenido de texto de un elemento.
 * @param {string} id - ID del elemento
 * @param {string} text - Texto a establecer
 */
function setText(id, text) {
    document.getElementById(id).textContent = text;
}

/**
 * Establece el HTML interno de un elemento.
 * @param {string} id - ID del elemento
 * @param {string} html - HTML a establecer
 */
function setHTML(id, html) {
    document.getElementById(id).innerHTML = html;
}

/**
 * Determina el estado de variación entre estándar y real.
 * @param {number} est - Valor estándar
 * @param {number} real - Valor real
 * @returns {{diff: number, label: string, cls: string}}
 */
function variationStatus(est, real) {
    const diff = real - est;
    if (est === 0 && real === 0) return { diff: 0, label: '—', cls: '' };
    if (diff < 0) return { diff, label: '✓ Favorable', cls: 'favorable' };
    if (diff > 0) return { diff, label: '✗ Desfavorable', cls: 'desfavorable' };
    return { diff: 0, label: '= Igual', cls: 'neutral' };
}
