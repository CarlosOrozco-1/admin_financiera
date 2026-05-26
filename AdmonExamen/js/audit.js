/* ============================================================
   AUDIT — Sistema de auditoria FINOVA
   Registro de acciones via API REST
   Compatible con localStorage como fallback
   ============================================================ */

const FiNovaAudit = (function () {
    'use strict';

    var COLLECTION = 'finova_audit_log';
    var useAPI = typeof FinovaAPI !== 'undefined';

    /**
     * Registra una accion en el log de auditoria
     * @param {string} modulo
     * @param {string} accion
     * @param {string} detalle
     */
    async function log(modulo, accion, detalle) {
        /*
         * Con API el backend registra automaticamente la auditoria
         * al momento de hacer las operaciones CRUD.
         * Este metodo es solo para casos puntuales del frontend.
         */
        try {
            if (useAPI) {
                /*
                 * No se envia a la API directamente porque el backend
                 * requiere autenticacion y los modulos ya registran
                 * auditoria automaticamente. Solo logging local.
                 */
            }
            var records = JSON.parse(localStorage.getItem(COLLECTION) || '[]');
            var username = typeof FiNovaAuth !== 'undefined' ? FiNovaAuth.getCurrentUsername() : 'sistema';

            records.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                fecha: new Date().toISOString(),
                usuario: username || 'sistema',
                modulo: modulo,
                accion: accion,
                detalle: detalle
            });

            if (records.length > 500) {
                records.splice(0, records.length - 500);
            }

            localStorage.setItem(COLLECTION, JSON.stringify(records));
        } catch (e) {
            console.error('Error al registrar auditoria:', e);
        }
    }

    /**
     * Obtiene todos los registros de auditoria desde la API
     * @param {object} filters - {modulo, usuario, fechaDesde, fechaHasta}
     * @returns {Promise<Array>}
     */
    async function getAll() {
        if (useAPI) {
            var res = await FinovaAPI.auditoria.getAll();
            return res || [];
        }
        try {
            return JSON.parse(localStorage.getItem(COLLECTION) || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * Obtiene registros filtrados
     * @param {object} filters
     * @returns {Promise<Array>}
     */
    async function getFiltered(filters) {
        if (useAPI) {
            /*
             * Con API los filtros se pasan como query params.
             */
            var params = {};
            if (filters.modulo && filters.modulo !== 'Todos') params.modulo = filters.modulo;
            var res = await FinovaAPI.auditoria.getAll(params.modulo);
            var data = res || [];

            /*
             * Filtros de fecha se aplican localmente porque la API
             * soporta filtros basicos. Si se necesita, se puede
             * expandir para pasar fechas como query params.
             */
            if (filters.fechaDesde) {
                var desde = new Date(filters.fechaDesde).getTime();
                data = data.filter(function (r) { return new Date(r.fecha).getTime() >= desde; });
            }
            if (filters.fechaHasta) {
                var hasta = new Date(filters.fechaHasta);
                hasta.setDate(hasta.getDate() + 1);
                var hastaTime = hasta.getTime();
                data = data.filter(function (r) { return new Date(r.fecha).getTime() <= hastaTime; });
            }

            return data;
        }

        var records = JSON.parse(localStorage.getItem(COLLECTION) || '[]');
        if (filters.modulo && filters.modulo !== 'Todos') {
            records = records.filter(function (r) { return r.modulo === filters.modulo; });
        }
        if (filters.usuario && filters.usuario !== 'Todos') {
            records = records.filter(function (r) { return r.usuario === filters.usuario; });
        }
        if (filters.fechaDesde) {
            records = records.filter(function (r) { return r.fecha >= filters.fechaDesde; });
        }
        if (filters.fechaHasta) {
            var h = new Date(filters.fechaHasta);
            h.setDate(h.getDate() + 1);
            records = records.filter(function (r) { return r.fecha <= h.toISOString(); });
        }
        return records;
    }

    /**
     * Obtiene los ultimos N registros
     * @param {number} n
     * @returns {Promise<Array>}
     */
    async function getRecent(n) {
        if (useAPI) {
            var data = await getAll();
            return data.slice(-n).reverse();
        }
        try {
            var records = JSON.parse(localStorage.getItem(COLLECTION) || '[]');
            return records.slice(-n).reverse();
        } catch (e) {
            return [];
        }
    }

    /**
     * Obtiene estadisticas de auditoria desde la API
     * @returns {Promise<object>}
     */
    async function getStats() {
        if (useAPI) {
            var res = await FinovaAPI.auditoria.getStats();
            if (res && res.byModule) {
                // La API devuelve byModule como array [{modulo, count}],
                // convertir a objeto {Modulo: count} para compatibilidad con el frontend
                var byModuleObj = {};
                var byUserObj = {};
                res.byModule.forEach(function(m) {
                    byModuleObj[m.modulo] = m.count;
                });
                return {
                    total: res.total || 0,
                    byModule: byModuleObj,
                    byAction: {},
                    byUser: byUserObj,
                    usuariosActivos: res.usuariosActivos || 0
                };
            }
            return { total: 0, byModule: {}, byAction: {}, byUser: {}, usuariosActivos: 0 };
        }
        try {
            var records = JSON.parse(localStorage.getItem(COLLECTION) || '[]');
            var byModule = {};
            var byAction = {};
            var byUser = {};
            records.forEach(function (r) {
                byModule[r.modulo] = (byModule[r.modulo] || 0) + 1;
                byAction[r.accion] = (byAction[r.accion] || 0) + 1;
                byUser[r.usuario] = (byUser[r.usuario] || 0) + 1;
            });
            return { total: records.length, byModule: byModule, byAction: byAction, byUser: byUser };
        } catch (e) {
            return { total: 0, byModule: {}, byAction: {}, byUser: {} };
        }
    }

    /**
     * Limpia todo el historial de auditoria via API
     * @returns {Promise<boolean>}
     */
    async function clearAll() {
        if (useAPI) {
            var ok = await FinovaAPI.auditoria.clearAll();
            if (ok) {
                localStorage.setItem(COLLECTION, JSON.stringify([]));
            }
            return ok;
        }
        localStorage.setItem(COLLECTION, JSON.stringify([]));
        return true;
    }

    /**
     * Formatea una fecha ISO a formato legible
     * @param {string} isoDate
     * @returns {string}
     */
    function formatDate(isoDate) {
        var d = new Date(isoDate);
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
