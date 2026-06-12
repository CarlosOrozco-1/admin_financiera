/* ============================================================
   USUARIOS — Lógica del módulo de Gestión de Usuarios
   ============================================================ */

const FiNovaUsuarios = (function () {
    'use strict';

    async function getAll() {
        if (typeof FinovaAPI !== 'undefined') {
            return await FinovaAPI.usuarios.getAll();
        }
        return [];
    }

    async function save(id, request) {
        if (typeof FinovaAPI !== 'undefined') {
            let res;
            if (id) {
                res = await FinovaAPI.usuarios.update(id, request);
            } else {
                res = await FinovaAPI.usuarios.create(request);
            }
            if (res.ok) {
                return res.data;
            }
            throw new Error(res.message);
        }
        throw new Error('API no disponible para usuarios');
    }

    async function toggleStatus(id) {
        if (typeof FinovaAPI !== 'undefined') {
            const res = await FinovaAPI.usuarios.toggleStatus(id);
            if (res.ok) {
                return res.data;
            }
            throw new Error(res.message);
        }
        throw new Error('API no disponible para usuarios');
    }

    return {
        getAll,
        save,
        toggleStatus
    };
})();
