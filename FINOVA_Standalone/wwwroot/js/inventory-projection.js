/* ============================================================
   INVENTORY PROJECTION — Proyeccion de inventario FINOVA
   Consume la API REST a traves de FinovaAPI
   Compatible con localStorage como fallback
   ============================================================ */

const FiNovaProjection = (function () {
    'use strict';

    var useAPI = typeof FinovaAPI !== 'undefined';

    /**
     * Genera datos de proyeccion
     * @param {Array} items - Inventario actual
     * @param {number} growthPct - % de crecimiento proyectado
     * @returns {Array}
     */
    function generate(items, growthPct) {
        return items.map(function (item) {
            var actual = item.cantidad || 0;
            var proyectado = Math.round(actual * (1 + growthPct / 100));
            var diferencia = proyectado - actual;
            var pctCambio = actual > 0 ? ((diferencia / actual) * 100).toFixed(1) : '2014';

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
     * Genera proyeccion personalizada (cantidades editadas manualmente)
     * @param {Array} items - Inventario actual
     * @param {Object} customQuantities - {itemId: cantidadProyectada}
     * @returns {Array}
     */
    function generateCustom(items, customQuantities) {
        return items.map(function (item) {
            var actual = item.cantidad || 0;
            var proyectado = customQuantities[item.id] !== undefined
                ? parseInt(customQuantities[item.id]) || 0
                : actual;
            var diferencia = proyectado - actual;
            var pctCambio = actual > 0 ? ((diferencia / actual) * 100).toFixed(1) : '0.0';

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
     * Genera analisis de texto de la proyeccion
     * @param {Array} projectionData
     * @returns {string}
     */
    function generateAnalysis(projectionData) {
        if (!projectionData || projectionData.length === 0) {
            return 'No hay datos para analizar.';
        }

        var totalActual = projectionData.reduce(function (s, i) { return s + i.cantidadActual; }, 0);
        var totalProyectado = projectionData.reduce(function (s, i) { return s + i.cantidadProyectada; }, 0);
        var valorActual = projectionData.reduce(function (s, i) { return s + i.valorActual; }, 0);
        var valorProyectado = projectionData.reduce(function (s, i) { return s + i.valorProyectado; }, 0);

        var diffUnits = totalProyectado - totalActual;
        var diffValor = valorProyectado - valorActual;
        var pctUnits = totalActual > 0 ? ((diffUnits / totalActual) * 100).toFixed(1) : 0;

        var mayores = [].concat(projectionData).sort(function (a, b) { return Math.abs(b.diferencia) - Math.abs(a.diferencia); });
        var top = mayores.slice(0, 3);

        var analysis = '<p>La proyeccion contempla un inventario de <strong>' + totalProyectado.toLocaleString('es-GT') + ' unidades</strong> ';
        analysis += 'frente a las <strong>' + totalActual.toLocaleString('es-GT') + ' unidades</strong> actuales, ';
        analysis += 'representando un cambio del <strong>' + pctUnits + '%</strong>.</p>';

        analysis += '<p>El valor proyectado del inventario es de <strong>Q ' + valorProyectado.toLocaleString('es-GT', { minimumFractionDigits: 2 }) + '</strong> ';
        analysis += 'comparado con el valor actual de <strong>Q ' + valorActual.toLocaleString('es-GT', { minimumFractionDigits: 2 }) + '</strong>';

        if (diffValor > 0) {
            analysis += ', lo cual implica una inversion adicional de <strong style="color:var(--accent)">Q ' + diffValor.toLocaleString('es-GT', { minimumFractionDigits: 2 }) + '</strong>.';
        } else if (diffValor < 0) {
            analysis += ', lo cual representa una reduccion de <strong style="color:var(--green)">Q ' + Math.abs(diffValor).toLocaleString('es-GT', { minimumFractionDigits: 2 }) + '</strong>.';
        } else {
            analysis += '.';
        }
        analysis += '</p>';

        if (top.length > 0 && top[0].diferencia !== 0) {
            analysis += '<p>Los productos con mayor variacion proyectada son: ';
            analysis += top.map(function (t) { return '<strong>' + t.nombre + '</strong> (' + (t.diferencia > 0 ? '+' : '') + t.diferencia + ' unidades)'; }).join(', ');
            analysis += '.</p>';
        }

        return analysis;
    }

    /**
     * Guarda una proyeccion via API
     * @param {Array} projectionData - Datos de proyeccion generados
     * @param {number} growthPct - % de crecimiento
     * @returns {Promise<object>}
     */
    async function saveProjection(projectionData, growthPct) {
        if (useAPI) {
            /*
             * La API espera: { periodo, crecimiento, items: [...] }
             * donde items tiene: inventarioId, codigo, nombre, categoria,
             * cantidadActual, cantidadProyectada, costoUnitario
             */
            var payload = {
                periodo: new Date().toLocaleDateString('es-GT'),
                crecimiento: growthPct,
                items: projectionData.map(function (i) {
                    return {
                        inventarioId: i.id,
                        codigo: i.codigo,
                        nombre: i.nombre,
                        categoria: i.categoria,
                        cantidadActual: i.cantidadActual,
                        cantidadProyectada: i.cantidadProyectada,
                        costoUnitario: i.costoUnitario
                    };
                })
            };
            var result = await FinovaAPI.proyecciones.create(payload);
            if (result.ok && typeof FiNovaAudit !== 'undefined') {
                FiNovaAudit.log('Proyeccion', 'Guardar', 'Proyeccion con ' + growthPct + '% de crecimiento, ' + projectionData.length + ' productos');
            }
            return result.ok ? result.data : null;
        }

        var record = {
            fecha: new Date().toISOString(),
            crecimiento: growthPct,
            items: projectionData,
            totalActual: projectionData.reduce(function (s, i) { return s + i.cantidadActual; }, 0),
            totalProyectado: projectionData.reduce(function (s, i) { return s + i.cantidadProyectada; }, 0)
        };
        FiNovaDB.save(FiNovaDB.COLLECTIONS.PROYECCIONES, record);
        if (typeof FiNovaAudit !== 'undefined') {
            FiNovaAudit.log('Proyeccion', 'Guardar', 'Proyeccion con ' + growthPct + '% de crecimiento, ' + projectionData.length + ' productos');
        }
        return record;
    }

    return {
        generate,
        generateCustom,
        generateAnalysis,
        saveProjection
    };
})();
