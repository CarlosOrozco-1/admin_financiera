/* ============================================================
   EXCEL HANDLER — Import/Export de archivos Excel
   Usa SheetJS (xlsx) cargado via CDN
   ============================================================ */

const FiNovaExcel = (function () {
    'use strict';

    /**
     * Importa un archivo Excel y retorna datos parseados
     * @param {File} file - Archivo .xlsx
     * @param {function} callback - Callback con (error, datos)
     */
    function importFile(file, callback) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                callback(null, jsonData, workbook.SheetNames);
            } catch (err) {
                callback(err, null);
            }
        };
        reader.onerror = function () {
            callback(new Error('Error al leer el archivo'), null);
        };
        reader.readAsArrayBuffer(file);
    }

    /**
     * Importa un archivo Excel y retorna datos como array de objetos
     * @param {File} file
     * @param {function} callback - (error, [{col1: val, col2: val, ...}])
     */
    function importAsObjects(file, callback) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                callback(null, jsonData);
            } catch (err) {
                callback(err, null);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    /**
     * Exporta datos a un archivo Excel
     * @param {Array<Array>} data - Datos como array de arrays (primera fila = headers)
     * @param {string} filename - Nombre del archivo (sin extensión)
     * @param {string} sheetName - Nombre de la hoja
     */
    function exportToExcel(data, filename, sheetName) {
        sheetName = sheetName || 'Datos';
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Auto-width columns
        const colWidths = data[0].map((_, i) => {
            const maxLen = Math.max(...data.map(row => {
                const val = row[i];
                return val ? String(val).length : 0;
            }));
            return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
        });
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    /**
     * Exporta array de objetos a Excel
     * @param {Array<Object>} objects
     * @param {string} filename
     * @param {string} sheetName
     */
    function exportObjectsToExcel(objects, filename, sheetName) {
        sheetName = sheetName || 'Datos';
        const ws = XLSX.utils.json_to_sheet(objects);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    /**
     * Mapea datos de Excel a formato de costos predeterminados
     * Espera formato: [[header1, header2, ...], [val1, val2, ...], ...]
     * @param {Array<Array>} data
     * @returns {object|null}
     */
    function mapToCostos(data) {
        if (!data || data.length < 2) return null;

        try {
            // Intentar mapeo por posición (fila 1 = headers, siguientes = MP, MO, CI)
            const result = {
                producto: '',
                codigo: '',
                cantidad: 0,
                estandar: { mpCant: 0, mpPrecio: 0, moCant: 0, moPrecio: 0, ciCant: 0, ciPrecio: 0 },
                real: { mpCant: 0, mpPrecio: 0, moCant: 0, moPrecio: 0, ciCant: 0, ciPrecio: 0 }
            };

            // Buscar fila con datos del producto
            for (let i = 0; i < data.length; i++) {
                const row = data[i].map(v => String(v).toLowerCase().trim());
                if (row.some(v => v.includes('producto') || v.includes('nombre'))) {
                    const nextRow = data[i + 1];
                    if (nextRow) {
                        result.producto = String(nextRow[1] || nextRow[0] || '');
                    }
                }
                if (row.some(v => v.includes('código') || v.includes('codigo'))) {
                    const nextRow = data[i + 1];
                    if (nextRow) {
                        result.codigo = String(nextRow[1] || nextRow[0] || '');
                    }
                }
            }

            // Buscar datos de costos estándar y real
            for (let i = 0; i < data.length; i++) {
                const row = data[i].map(v => String(v).toLowerCase().trim());
                const isMP = row.some(v => v.includes('materia') || v.includes('material'));
                const isMO = row.some(v => v.includes('mano') || v.includes('obra') || v.includes('labor'));
                const isCI = row.some(v => v.includes('indirecto') || v.includes('cif') || v.includes('overhead'));

                if (isMP || isMO || isCI) {
                    const nums = data[i].filter(v => typeof v === 'number' || !isNaN(parseFloat(v)));
                    const values = nums.map(v => parseFloat(v) || 0);

                    if (isMP) {
                        result.estandar.mpCant = values[0] || 0;
                        result.estandar.mpPrecio = values[1] || 0;
                        result.real.mpCant = values[2] || values[0] || 0;
                        result.real.mpPrecio = values[3] || values[1] || 0;
                    } else if (isMO) {
                        result.estandar.moCant = values[0] || 0;
                        result.estandar.moPrecio = values[1] || 0;
                        result.real.moCant = values[2] || values[0] || 0;
                        result.real.moPrecio = values[3] || values[1] || 0;
                    } else if (isCI) {
                        result.estandar.ciCant = values[0] || 0;
                        result.estandar.ciPrecio = values[1] || 0;
                        result.real.ciCant = values[2] || values[0] || 0;
                        result.real.ciPrecio = values[3] || values[1] || 0;
                    }
                }
            }

            return result;
        } catch (e) {
            console.error('Error mapeando datos de Excel a costos:', e);
            return null;
        }
    }

    /**
     * Mapea datos de Excel a formato de inventario
     * @param {Array<Object>} data - Array de objetos desde sheet_to_json
     * @returns {Array<Object>}
     */
    function mapToInventario(data) {
        return data.map(row => {
            const keys = Object.keys(row);
            return {
                codigo: row.Codigo || row.codigo || row.Código || row['Código'] || row[keys[0]] || '',
                nombre: row.Nombre || row.nombre || row.Producto || row.producto || row[keys[1]] || '',
                categoria: row.Categoria || row.categoria || row.Categoría || row['Categoría'] || row[keys[2]] || 'Sin categoría',
                cantidad: parseFloat(row.Cantidad || row.cantidad || row.Stock || row.stock || row[keys[3]] || 0),
                costoUnitario: parseFloat(row.CostoUnitario || row.costoUnitario || row.Costo || row.costo || row.Precio || row.precio || row[keys[4]] || 0),
                stockMinimo: parseFloat(row.StockMinimo || row.stockMinimo || row.Minimo || row.minimo || row[keys[5]] || 10)
            };
        }).filter(item => item.nombre || item.codigo);
    }

    return {
        importFile,
        importAsObjects,
        exportToExcel,
        exportObjectsToExcel,
        mapToCostos,
        mapToInventario
    };
})();
