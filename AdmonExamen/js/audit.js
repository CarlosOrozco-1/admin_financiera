/* ============================================================
   AUDIT — Sistema de auditoría FINOVA
   Registro de todas las acciones del sistema
   ============================================================ */

const FiNovaAudit = (function () {
    'use strict';

    const COLLECTION = 'finova_audit_log';

    /**
     * Registra una acción en el log de auditoría
     * @param {string} modulo - Módulo donde ocurrió (Login, Costos, Inventario, Proyección, Auditoría, Sistema)
     * @param {string} accion - Tipo de acción (Crear, Editar, Eliminar, Exportar, Importar, etc.)
     * @param {string} detalle - Descripción detallada
     */
    function log(modulo, accion, detalle) {
        try {
            const records = JSON.parse(localStorage.getItem(COLLECTION) || '[]');
            const username = typeof FiNovaAuth !== 'undefined' ? FiNovaAuth.getCurrentUsername() : 'sistema';

            records.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                fecha: new Date().toISOString(),
                usuario: username || 'sistema',
                modulo: modulo,
                accion: accion,
                detalle: detalle
            });

            // Mantener máximo 500 registros
            if (records.length > 500) {
                records.splice(0, records.length - 500);
            }

            localStorage.setItem(COLLECTION, JSON.stringify(records));
        } catch (e) {
            console.error('Error al registrar auditoría:', e);
        }
    }

    /**
     * Obtiene todos los registros de auditoría
     * @returns {Array}
     */
    function getAll() {
        try {
            return JSON.parse(localStorage.getItem(COLLECTION) || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * Obtiene registros filtrados
     * @param {object} filters - {modulo, usuario, fechaDesde, fechaHasta}
     * @returns {Array}
     */
    function getFiltered(filters) {
        let records = getAll();

        if (filters.modulo && filters.modulo !== 'Todos') {
            records = records.filter(r => r.modulo === filters.modulo);
        }
        if (filters.usuario && filters.usuario !== 'Todos') {
            records = records.filter(r => r.usuario === filters.usuario);
        }
        if (filters.fechaDesde) {
            records = records.filter(r => r.fecha >= filters.fechaDesde);
        }
        if (filters.fechaHasta) {
            const hasta = new Date(filters.fechaHasta);
            hasta.setDate(hasta.getDate() + 1);
            records = records.filter(r => r.fecha <= hasta.toISOString());
        }

        return records;
    }

    /**
     * Obtiene los últimos N registros
     * @param {number} n
     * @returns {Array}
     */
    function getRecent(n) {
        const records = getAll();
        return records.slice(-n).reverse();
    }

    /**
     * Obtiene estadísticas de auditoría
     * @returns {object}
     */
    function getStats() {
        const records = getAll();
        const byModule = {};
        const byAction = {};
        const byUser = {};

        records.forEach(r => {
            byModule[r.modulo] = (byModule[r.modulo] || 0) + 1;
            byAction[r.accion] = (byAction[r.accion] || 0) + 1;
            byUser[r.usuario] = (byUser[r.usuario] || 0) + 1;
        });

        return {
            total: records.length,
            byModule,
            byAction,
            byUser
        };
    }

    /**
     * Limpia todo el historial de auditoría
     */
    function clearAll() {
        localStorage.setItem(COLLECTION, JSON.stringify([]));
    }

    /**
     * Formatea una fecha ISO a formato legible
     * @param {string} isoDate
     * @returns {string}
     */
    function formatDate(isoDate) {
        const d = new Date(isoDate);
        return d.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + d.toLocaleTimeString('es-GT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    return {
        log,
        getAll,
        getFiltered,
        getRecent,
        getStats,
        clearAll,
        formatDate
    };
})();
