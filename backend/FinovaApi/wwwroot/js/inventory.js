/* ============================================================
   INVENTORY — Logica del modulo de inventario FINOVA
   Consume la API REST a traves de FinovaAPI
   Compatible con localStorage como fallback
   ============================================================ */

const FiNovaInventory = (function () {
    'use strict';

    var currentSearch = '';
    var currentCategory = 'Todas';

    var useAPI = typeof FinovaAPI !== 'undefined';

    /**
     * Obtiene todos los productos (con filtros opcionales)
     * @returns {Promise<Array>}
     */
    async function getAll() {
        if (useAPI) {
            return await FinovaAPI.inventario.getAll(currentCategory === 'Todas' ? null : currentCategory, currentSearch || null);
        }
        return FiNovaDB.getAll(FiNovaDB.COLLECTIONS.INVENTARIO);
    }

    /**
     * Obtiene productos filtrados por categoria y busqueda
     * @returns {Promise<Array>}
     */
    async function getFiltered() {
        /*
         * Con API el backend aplica los filtros directamente.
         */
        if (useAPI) {
            return await getAll();
        }
        var items = FiNovaDB.getAll(FiNovaDB.COLLECTIONS.INVENTARIO);
        if (currentCategory && currentCategory !== 'Todas') {
            items = items.filter(function (i) { return i.categoria === currentCategory; });
        }
        if (currentSearch) {
            var q = currentSearch.toLowerCase();
            items = items.filter(function (i) {
                return (i.nombre || '').toLowerCase().includes(q) ||
                       (i.codigo || '').toLowerCase().includes(q) ||
                       (i.categoria || '').toLowerCase().includes(q);
            });
        }
        return items;
    }

    /**
     * Agrega un nuevo producto
     * @param {object} item
     * @returns {Promise<object>}
     */
    async function add(item) {
        if (useAPI) {
            var result = await FinovaAPI.inventario.create(item);
            if (result.ok) {
                if (typeof FiNovaAudit !== 'undefined') {
                    FiNovaAudit.log('Inventario', 'Crear', 'Producto: ' + item.nombre + ' (' + item.codigo + ')');
                }
                return result.data;
            }
            return null;
        }
        var saved = FiNovaDB.save(FiNovaDB.COLLECTIONS.INVENTARIO, item);
        if (typeof FiNovaAudit !== 'undefined') {
            FiNovaAudit.log('Inventario', 'Crear', 'Producto: ' + item.nombre + ' (' + item.codigo + ')');
        }
        return saved;
    }

    /**
     * Actualiza un producto
     * @param {number|string} id
     * @param {object} data
     * @returns {Promise<object|null>}
     */
    async function updateItem(id, data) {
        if (useAPI) {
            var result = await FinovaAPI.inventario.update(id, data);
            if (result.ok) {
                if (typeof FiNovaAudit !== 'undefined') {
                    FiNovaAudit.log('Inventario', 'Editar', 'Producto: ' + data.nombre + ' (' + data.codigo + ')');
                }
                return result.data;
            }
            return null;
        }
        var updated = FiNovaDB.update(FiNovaDB.COLLECTIONS.INVENTARIO, id, data);
        if (updated && typeof FiNovaAudit !== 'undefined') {
            FiNovaAudit.log('Inventario', 'Editar', 'Producto: ' + data.nombre + ' (' + data.codigo + ')');
        }
        return updated;
    }

    /**
     * Elimina un producto
     * @param {number|string} id
     * @returns {Promise<boolean>}
     */
    async function remove(id) {
        if (useAPI) {
            /*
             * Con API necesitamos el item antes de eliminar para la auditoria.
             */
            var item = await FinovaAPI.inventario.getById(id);
            var deleted = await FinovaAPI.inventario.remove(id);
            if (deleted && item && typeof FiNovaAudit !== 'undefined') {
                FiNovaAudit.log('Inventario', 'Eliminar', 'Producto: ' + item.nombre + ' (' + item.codigo + ')');
            }
            return deleted;
        }
        var item = FiNovaDB.getById(FiNovaDB.COLLECTIONS.INVENTARIO, id);
        var result = FiNovaDB.remove(FiNovaDB.COLLECTIONS.INVENTARIO, id);
        if (result && item && typeof FiNovaAudit !== 'undefined') {
            FiNovaAudit.log('Inventario', 'Eliminar', 'Producto: ' + item.nombre + ' (' + item.codigo + ')');
        }
        return result;
    }

    /**
     * Obtiene categorias unicas
     * @returns {Promise<Array>}
     */
    async function getCategories() {
        if (useAPI) {
            return await FinovaAPI.inventario.getCategories();
        }
        var items = FiNovaDB.getAll(FiNovaDB.COLLECTIONS.INVENTARIO);
        var cats = [];
        items.forEach(function (i) {
            if (i.categoria && cats.indexOf(i.categoria) === -1) cats.push(i.categoria);
        });
        return cats.sort();
    }

    /**
     * Obtiene estadisticas del inventario
     * @returns {Promise<object>}
     */
    async function getStats() {
        if (useAPI) {
            return await FinovaAPI.inventario.getStats();
        }
        var items = FiNovaDB.getAll(FiNovaDB.COLLECTIONS.INVENTARIO);
        var totalItems = items.length;
        var totalValue = items.reduce(function (s, i) { return s + (i.cantidad || 0) * (i.costoUnitario || 0); }, 0);
        var lowStock = items.filter(function (i) { return i.cantidad <= (i.stockMinimo || 10); }).length;
        var totalUnits = items.reduce(function (s, i) { return s + (i.cantidad || 0); }, 0);
        return { totalItems: totalItems, totalValue: totalValue, lowStock: lowStock, totalUnits: totalUnits };
    }

    function getStockStatus(item) {
        var min = item.stockMinimo || 10;
        if (item.cantidad <= 0) return 'critical';
        if (item.cantidad <= min) return 'low';
        return 'ok';
    }

    function getStockLabel(status) {
        if (status === 'critical') return 'Sin stock';
        if (status === 'low') return 'Stock bajo';
        return 'Normal';
    }

    function setSearch(q) { currentSearch = q; }
    function setCategory(c) { currentCategory = c; }

    /**
     * Importa productos desde Excel
     * @param {Array} items
     * @returns {Promise<number>}
     */
    async function importFromExcel(items) {
        var count = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].nombre || items[i].codigo) {
                if (useAPI) {
                    await FinovaAPI.inventario.create(items[i]);
                } else {
                    FiNovaDB.save(FiNovaDB.COLLECTIONS.INVENTARIO, items[i]);
                }
                count++;
            }
        }
        if (count > 0 && typeof FiNovaAudit !== 'undefined') {
            FiNovaAudit.log('Inventario', 'Importar Excel', count + ' productos importados');
        }
        return count;
    }

    return {
        getAll,
        getFiltered,
        add,
        updateItem,
        remove,
        getCategories,
        getStats,
        getStockStatus,
        getStockLabel,
        setSearch,
        setCategory,
        importFromExcel
    };
})();
