/* ============================================================
   INVENTORY PROJECTION — Proyección de inventario FINOVA
   ============================================================ */

const FiNovaProjection = (function () {
    'use strict';

    /**
     * Genera datos de proyección
     * @param {Array} items - Inventario actual
     * @param {number} growthPct - % de crecimiento proyectado
     * @returns {Array}
     */
    function generate(items, growthPct) {
        return items.map(item => {
            const actual = item.cantidad || 0;
            const proyectado = Math.round(actual * (1 + growthPct / 100));
            const diferencia = proyectado - actual;
            const pctCambio = actual > 0 ? ((diferencia / actual) * 100).toFixed(1) : '—';

            return {
                id: item.id,
                codigo: item.codigo,
                nombre: item.nombre,
                categoria: item.categoria,
                cantidadActual: actual,
                cantidadProyectada: proyectado,
                diferencia: diferencia,
                porcentaje: pctCambio + '%',
                costoUnitario: item.costoUnitario || 0,
                valorActual: actual * (item.costoUnitario || 0),
                valorProyectado: proyectado * (item.costoUnitario || 0)
            };
        });
    }

    /**
     * Genera proyección personalizada (cantidades editadas manualmente)
     * @param {Array} items - Inventario actual
     * @param {Object} customQuantities - {itemId: cantidadProyectada}
     * @returns {Array}
     */
    function generateCustom(items, customQuantities) {
        return items.map(item => {
            const actual = item.cantidad || 0;
            const proyectado = customQuantities[item.id] !== undefined
                ? parseInt(customQuantities[item.id]) || 0
                : actual;
            const diferencia = proyectado - actual;
            const pctCambio = actual > 0 ? ((diferencia / actual) * 100).toFixed(1) : '0.0';

            return {
                id: item.id,
                codigo: item.codigo,
                nombre: item.nombre,
                categoria: item.categoria,
                cantidadActual: actual,
                cantidadProyectada: proyectado,
                diferencia: diferencia,
                porcentaje: pctCambio + '%',
                costoUnitario: item.costoUnitario || 0,
                valorActual: actual * (item.costoUnitario || 0),
                valorProyectado: proyectado * (item.costoUnitario || 0)
            };
        });
    }

    /**
     * Genera análisis de texto de la proyección
     * @param {Array} projectionData
     * @returns {string}
     */
    function generateAnalysis(projectionData) {
        if (!projectionData || projectionData.length === 0) {
            return 'No hay datos para analizar.';
        }

        const totalActual = projectionData.reduce((s, i) => s + i.cantidadActual, 0);
        const totalProyectado = projectionData.reduce((s, i) => s + i.cantidadProyectada, 0);
        const valorActual = projectionData.reduce((s, i) => s + i.valorActual, 0);
        const valorProyectado = projectionData.reduce((s, i) => s + i.valorProyectado, 0);

        const diffUnits = totalProyectado - totalActual;
        const diffValor = valorProyectado - valorActual;
        const pctUnits = totalActual > 0 ? ((diffUnits / totalActual) * 100).toFixed(1) : 0;

        const mayores = [...projectionData].sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));
        const top = mayores.slice(0, 3);

        let analysis = `<p>La proyección contempla un inventario de <strong>${totalProyectado.toLocaleString('es-GT')} unidades</strong> `;
        analysis += `frente a las <strong>${totalActual.toLocaleString('es-GT')} unidades</strong> actuales, `;
        analysis += `representando un cambio del <strong>${pctUnits}%</strong>.</p>`;

        analysis += `<p>El valor proyectado del inventario es de <strong>Q ${valorProyectado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</strong> `;
        analysis += `comparado con el valor actual de <strong>Q ${valorActual.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</strong>`;

        if (diffValor > 0) {
            analysis += `, lo cual implica una inversión adicional de <strong style="color:var(--accent)">Q ${diffValor.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</strong>.`;
        } else if (diffValor < 0) {
            analysis += `, lo cual representa una reducción de <strong style="color:var(--green)">Q ${Math.abs(diffValor).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</strong>.`;
        } else {
            analysis += `.`;
        }
        analysis += `</p>`;

        if (top.length > 0 && top[0].diferencia !== 0) {
            analysis += `<p>Los productos con mayor variación proyectada son: `;
            analysis += top.map(t => `<strong>${t.nombre}</strong> (${t.diferencia > 0 ? '+' : ''}${t.diferencia} unidades)`).join(', ');
            analysis += '.</p>';
        }

        return analysis;
    }

    function saveProjection(data, growthPct) {
        const record = {
            fecha: new Date().toISOString(),
            crecimiento: growthPct,
            items: data,
            totalActual: data.reduce((s, i) => s + i.cantidadActual, 0),
            totalProyectado: data.reduce((s, i) => s + i.cantidadProyectada, 0)
        };
        FiNovaDB.save(FiNovaDB.COLLECTIONS.PROYECCIONES, record);
        FiNovaAudit.log('Proyección', 'Guardar', `Proyección con ${growthPct}% de crecimiento, ${data.length} productos`);
        return record;
    }

    return {
        generate,
        generateCustom,
        generateAnalysis,
        saveProjection
    };
})();
