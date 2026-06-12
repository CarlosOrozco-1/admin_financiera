/* ============================================================
   KARDEX — Lógica del módulo de Kardex FINOVA
   ============================================================ */

const FiNovaKardex = (function () {
    'use strict';

    var currentProduct = '';
    var currentType = 'Todos';

    async function getAll() {
        if (typeof FinovaAPI !== 'undefined') {
            return await FinovaAPI.kardex.getAll(currentProduct || null, currentType);
        }
        return [];
    }

    async function registrar(inventarioId, tipoMovimiento, cantidad, detalle) {
        if (typeof FinovaAPI !== 'undefined') {
            const data = { inventarioId, tipoMovimiento, cantidad, detalle };
            const res = await FinovaAPI.kardex.registrar(data);
            if (res.ok) {
                if (typeof FiNovaAudit !== 'undefined') {
                    FiNovaAudit.log('Kardex', 'Registrar ' + tipoMovimiento, cantidad + ' uds. Producto ID: ' + inventarioId);
                }
                return res.data;
            }
            throw new Error(res.message);
        }
        throw new Error('API no disponible para registrar en Kardex');
    }

    function setProduct(id) { currentProduct = id; }
    function setType(t) { currentType = t; }

    return {
        getAll,
        registrar,
        setProduct,
        setType
    };
})();
