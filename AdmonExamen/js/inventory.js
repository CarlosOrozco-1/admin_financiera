/* ============================================================
   INVENTORY — Lógica del módulo de inventario FINOVA
   ============================================================ */

const FiNovaInventory = (function () {
    'use strict';

    const COL = FiNovaDB.COLLECTIONS.INVENTARIO;
    let currentSearch = '';
    let currentCategory = 'Todas';

    function getAll() {
        return FiNovaDB.getAll(COL);
    }

    function getFiltered() {
        let items = getAll();
        if (currentCategory && currentCategory !== 'Todas') {
            items = items.filter(i => i.categoria === currentCategory);
        }
        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            items = items.filter(i =>
                (i.nombre || '').toLowerCase().includes(q) ||
                (i.codigo || '').toLowerCase().includes(q) ||
                (i.categoria || '').toLowerCase().includes(q)
            );
        }
        return items;
    }

    function add(item) {
        const saved = FiNovaDB.save(COL, item);
        FiNovaAudit.log('Inventario', 'Crear', `Producto: ${item.nombre} (${item.codigo})`);
        return saved;
    }

    function updateItem(id, data) {
        const updated = FiNovaDB.update(COL, id, data);
        if (updated) {
            FiNovaAudit.log('Inventario', 'Editar', `Producto: ${data.nombre} (${data.codigo})`);
        }
        return updated;
    }

    function remove(id) {
        const item = FiNovaDB.getById(COL, id);
        const result = FiNovaDB.remove(COL, id);
        if (result && item) {
            FiNovaAudit.log('Inventario', 'Eliminar', `Producto: ${item.nombre} (${item.codigo})`);
        }
        return result;
    }

    function getCategories() {
        const items = getAll();
        const cats = [...new Set(items.map(i => i.categoria).filter(Boolean))];
        return cats.sort();
    }

    function getStats() {
        const items = getAll();
        const totalItems = items.length;
        const totalValue = items.reduce((s, i) => s + (i.cantidad || 0) * (i.costoUnitario || 0), 0);
        const lowStock = items.filter(i => i.cantidad <= (i.stockMinimo || 10)).length;
        const totalUnits = items.reduce((s, i) => s + (i.cantidad || 0), 0);
        return { totalItems, totalValue, lowStock, totalUnits };
    }

    function getStockStatus(item) {
        const min = item.stockMinimo || 10;
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

    function importFromExcel(items) {
        let count = 0;
        items.forEach(item => {
            if (item.nombre || item.codigo) {
                FiNovaDB.save(COL, item);
                count++;
            }
        });
        if (count > 0) {
            FiNovaAudit.log('Inventario', 'Importar Excel', `${count} productos importados`);
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
