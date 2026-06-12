/* ============================================================
   DATABASE — Capa de abstracción sobre localStorage
   Proporciona operaciones CRUD para todas las colecciones FINOVA
   ============================================================ */

const FiNovaDB = (function () {
    'use strict';

    const COLLECTIONS = {
        USERS: 'finova_users',
        COSTOS: 'finova_costos',
        INVENTARIO: 'finova_inventario',
        PROYECCIONES: 'finova_proyecciones',
        AUDIT_LOG: 'finova_audit_log',
        CONFIG: 'finova_config'
    };

    /**
     * Genera un ID único basado en timestamp + random
     * @returns {string}
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtiene una colección completa del localStorage
     * @param {string} collection - Nombre de la colección
     * @returns {Array}
     */
    function getAll(collection) {
        try {
            const data = localStorage.getItem(collection);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error al leer colección ${collection}:`, e);
            return [];
        }
    }

    /**
     * Guarda un nuevo registro en una colección
     * @param {string} collection - Nombre de la colección
     * @param {object} data - Datos a guardar
     * @returns {object} - Registro guardado con ID y timestamps
     */
    function save(collection, data) {
        const records = getAll(collection);
        const record = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        records.push(record);
        localStorage.setItem(collection, JSON.stringify(records));
        return record;
    }

    /**
     * Obtiene un registro por ID
     * @param {string} collection
     * @param {string} id
     * @returns {object|null}
     */
    function getById(collection, id) {
        const records = getAll(collection);
        return records.find(r => r.id === id) || null;
    }

    /**
     * Actualiza un registro existente
     * @param {string} collection
     * @param {string} id
     * @param {object} data
     * @returns {object|null}
     */
    function update(collection, id, data) {
        const records = getAll(collection);
        const index = records.findIndex(r => r.id === id);
        if (index === -1) return null;
        records[index] = {
            ...records[index],
            ...data,
            id: records[index].id,
            createdAt: records[index].createdAt,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(collection, JSON.stringify(records));
        return records[index];
    }

    /**
     * Elimina un registro por ID
     * @param {string} collection
     * @param {string} id
     * @returns {boolean}
     */
    function remove(collection, id) {
        const records = getAll(collection);
        const filtered = records.filter(r => r.id !== id);
        if (filtered.length === records.length) return false;
        localStorage.setItem(collection, JSON.stringify(filtered));
        return true;
    }

    /**
     * Limpia una colección completa
     * @param {string} collection
     */
    function clear(collection) {
        localStorage.setItem(collection, JSON.stringify([]));
    }

    /**
     * Cuenta registros en una colección
     * @param {string} collection
     * @returns {number}
     */
    function count(collection) {
        return getAll(collection).length;
    }

    /**
     * Busca registros que coincidan con un filtro
     * @param {string} collection
     * @param {function} filterFn
     * @returns {Array}
     */
    function find(collection, filterFn) {
        return getAll(collection).filter(filterFn);
    }

    /**
     * Inicializa datos por defecto si la colección está vacía
     * @param {string} collection
     * @param {Array} defaults
     */
    function seedIfEmpty(collection, defaults) {
        if (getAll(collection).length === 0 && defaults && defaults.length > 0) {
            defaults.forEach(item => save(collection, item));
        }
    }

    /**
     * Inicializa la base de datos con datos predeterminados
     */
    function init() {
        // Usuarios por defecto
        seedIfEmpty(COLLECTIONS.USERS, [
            { username: 'admin', password: 'admin123', role: 'admin', nombre: 'Administrador' },
            { username: 'usuario', password: 'user123', role: 'user', nombre: 'Usuario Estándar' }
        ]);

        // Inventario de ejemplo
        seedIfEmpty(COLLECTIONS.INVENTARIO, [
            { codigo: 'MP-001', nombre: 'Tela Algodón', categoria: 'Materia Prima', cantidad: 500, costoUnitario: 12.50, stockMinimo: 100 },
            { codigo: 'MP-002', nombre: 'Hilo Industrial', categoria: 'Materia Prima', cantidad: 1200, costoUnitario: 3.75, stockMinimo: 200 },
            { codigo: 'MP-003', nombre: 'Botones Metálicos', categoria: 'Materia Prima', cantidad: 3000, costoUnitario: 0.50, stockMinimo: 500 },
            { codigo: 'MP-004', nombre: 'Zipper (Cremallera)', categoria: 'Materia Prima', cantidad: 800, costoUnitario: 2.25, stockMinimo: 150 },
            { codigo: 'PT-001', nombre: 'Camisa Deportiva', categoria: 'Producto Terminado', cantidad: 150, costoUnitario: 45.00, stockMinimo: 30 },
            { codigo: 'PT-002', nombre: 'Pantalón Formal', categoria: 'Producto Terminado', cantidad: 80, costoUnitario: 65.00, stockMinimo: 20 },
            { codigo: 'IN-001', nombre: 'Aceite para Máquinas', categoria: 'Insumo', cantidad: 25, costoUnitario: 18.00, stockMinimo: 10 },
            { codigo: 'IN-002', nombre: 'Agujas Industriales (paq)', categoria: 'Insumo', cantidad: 50, costoUnitario: 8.50, stockMinimo: 15 }
        ]);
    }

    // API pública
    return {
        COLLECTIONS,
        generateId,
        getAll,
        save,
        getById,
        update,
        remove,
        clear,
        count,
        find,
        seedIfEmpty,
        init
    };
})();

// Inicializar base de datos al cargar
FiNovaDB.init();
