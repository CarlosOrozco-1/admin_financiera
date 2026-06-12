/* ============================================================
   IMPORT PREVIEW — Modal de vista previa para importación Excel
   Módulo reutilizable para todos los módulos FINOVA
   ============================================================ */

const FiNovaImportPreview = (function () {
    'use strict';

    var _onConfirm = null;
    var _currentData = null;
    var _currentModule = '';

    /* ----------------------------------------------------------
       MODAL HTML — Se inyecta una sola vez en el DOM
       ---------------------------------------------------------- */

    function ensureModal() {
        if (document.getElementById('importPreviewModal')) return;

        var modalHTML = '' +
            '<div class="modal-overlay import-preview-overlay" id="importPreviewModal">' +
            '  <div class="modal-content import-preview-modal">' +
            '    <div class="modal-header">' +
            '      <div class="import-preview-header-info">' +
            '        <h3 class="modal-title" id="importPreviewTitle">Vista Previa de Importación</h3>' +
            '        <span class="import-preview-subtitle" id="importPreviewSubtitle"></span>' +
            '      </div>' +
            '      <button class="modal-close" onclick="FiNovaImportPreview.close()">' +
            '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '      </button>' +
            '    </div>' +
            '    <div class="import-preview-summary" id="importPreviewSummary"></div>' +
            '    <div class="import-preview-table-wrapper" id="importPreviewTableWrapper">' +
            '      <table class="import-preview-table" id="importPreviewTable">' +
            '        <thead id="importPreviewThead"></thead>' +
            '        <tbody id="importPreviewTbody"></tbody>' +
            '      </table>' +
            '    </div>' +
            '    <div class="import-preview-errors" id="importPreviewErrors" style="display:none;"></div>' +
            '    <div class="modal-actions import-preview-actions">' +
            '      <button type="button" class="btn btn-secondary" onclick="FiNovaImportPreview.close()">Cancelar</button>' +
            '      <button type="button" class="btn btn-primary" id="importPreviewConfirmBtn" onclick="FiNovaImportPreview.confirm()">' +
            '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
            '        Confirmar Importación' +
            '      </button>' +
            '    </div>' +
            '  </div>' +
            '</div>';

        var container = document.createElement('div');
        container.innerHTML = modalHTML;
        document.body.appendChild(container.firstElementChild);
    }

    /* ----------------------------------------------------------
       MODULE CONFIGS — Columnas visibles por módulo
       ---------------------------------------------------------- */

    var moduleConfigs = {
        inventario: {
            title: 'Importar Inventario',
            icon: '📦',
            columns: [
                { key: 'codigo', label: 'Código' },
                { key: 'nombre', label: 'Producto' },
                { key: 'categoria', label: 'Categoría' },
                { key: 'cantidad', label: 'Cantidad', type: 'number' },
                { key: 'costoUnitario', label: 'Costo Unit.', type: 'currency' },
                { key: 'stockMinimo', label: 'Stock Mín.', type: 'number' }
            ]
        },
        costos: {
            title: 'Importar Costos',
            icon: '📋',
            columns: [
                { key: 'producto', label: 'Producto' },
                { key: 'codigo', label: 'Código' },
                { key: 'cantidad', label: 'Cant. Producida', type: 'number' },
                { key: 'info', label: 'Datos de Costos' }
            ]
        },
        proyeccion: {
            title: 'Importar Proyección',
            icon: '📊',
            columns: [
                { key: 'nombre', label: 'Producto' },
                { key: 'cantidadActual', label: 'Cant. Actual', type: 'number' },
                { key: 'cantidadProyectada', label: 'Cant. Proyectada', type: 'number' },
                { key: 'diferencia', label: 'Diferencia', type: 'number' },
                { key: 'porcentaje', label: '% Cambio' }
            ]
        },
        kardex: {
            title: 'Importar Kardex',
            icon: '📄',
            columns: [
                { key: 'producto', label: 'Producto' },
                { key: 'tipoMovimiento', label: 'Tipo' },
                { key: 'cantidad', label: 'Cantidad', type: 'number' },
                { key: 'detalle', label: 'Detalle' }
            ]
        }
    };

    /* ----------------------------------------------------------
       SHOW — Mostrar el modal con datos
       ---------------------------------------------------------- */

    /**
     * Muestra el modal de vista previa
     * @param {object} options
     * @param {string} options.module - 'inventario', 'costos', 'proyeccion', 'kardex'
     * @param {Array<Object>} options.data - Datos mapeados para mostrar
     * @param {object} options.validation - Resultado de validateData()
     * @param {string} options.fileName - Nombre del archivo importado
     * @param {function} options.onConfirm - Callback al confirmar (recibe datos filtrados)
     */
    function show(options) {
        ensureModal();

        _currentModule = options.module || 'inventario';
        _currentData = options.data || [];
        _onConfirm = options.onConfirm || null;

        var config = moduleConfigs[_currentModule] || moduleConfigs.inventario;
        var validation = options.validation || { valid: _currentData, errors: [], summary: '' };

        // Title
        var titleEl = document.getElementById('importPreviewTitle');
        titleEl.textContent = config.icon + ' ' + config.title;

        // Subtitle
        var subtitleEl = document.getElementById('importPreviewSubtitle');
        subtitleEl.textContent = options.fileName ? ('Archivo: ' + options.fileName) : '';

        // Summary
        var summaryEl = document.getElementById('importPreviewSummary');
        var validCount = _currentData.filter(function (d) { return d._valid; }).length;
        var errorCount = _currentData.length - validCount;

        summaryEl.innerHTML = '' +
            '<div class="import-preview-stat-grid">' +
            '  <div class="import-preview-stat">' +
            '    <div class="import-preview-stat-number">' + _currentData.length + '</div>' +
            '    <div class="import-preview-stat-label">Total filas</div>' +
            '  </div>' +
            '  <div class="import-preview-stat import-preview-stat-valid">' +
            '    <div class="import-preview-stat-number">' + validCount + '</div>' +
            '    <div class="import-preview-stat-label">Válidas</div>' +
            '  </div>' +
            (errorCount > 0 ?
                '  <div class="import-preview-stat import-preview-stat-error">' +
                '    <div class="import-preview-stat-number">' + errorCount + '</div>' +
                '    <div class="import-preview-stat-label">Con errores</div>' +
                '  </div>' : '') +
            '  <div class="import-preview-stat">' +
            '    <div class="import-preview-stat-number">' + config.columns.length + '</div>' +
            '    <div class="import-preview-stat-label">Columnas</div>' +
            '  </div>' +
            '</div>';

        // Table header
        var thead = document.getElementById('importPreviewThead');
        thead.innerHTML = '<tr><th class="import-preview-row-num">#</th>' +
            config.columns.map(function (col) {
                return '<th>' + col.label + '</th>';
            }).join('') +
            '<th>Estado</th></tr>';

        // Table body
        var tbody = document.getElementById('importPreviewTbody');

        if (_currentModule === 'costos' && _currentData.length > 0) {
            // Para costos, el mapeo devuelve un solo objeto, no un array
            var costos = Array.isArray(_currentData) ? _currentData[0] : _currentData;
            tbody.innerHTML = renderCostosPreview(costos);
        } else {
            tbody.innerHTML = _currentData.map(function (item, idx) {
                var hasErrors = item._errors && item._errors.length > 0;
                var rowClass = hasErrors ? 'import-preview-row-error' : 'import-preview-row-valid';

                return '<tr class="' + rowClass + '">' +
                    '<td class="import-preview-row-num">' + (idx + 1) + '</td>' +
                    config.columns.map(function (col) {
                        var val = item[col.key];
                        if (val === undefined || val === null) val = '—';
                        if (col.type === 'currency') val = 'Q ' + Number(val).toFixed(2);
                        if (col.type === 'number') val = Number(val).toLocaleString('es-GT');
                        return '<td>' + val + '</td>';
                    }).join('') +
                    '<td>' + (hasErrors ?
                        '<span class="import-preview-badge-error">⚠ Error</span>' :
                        '<span class="import-preview-badge-valid">✓ Válido</span>') +
                    '</td></tr>';
            }).join('');
        }

        // Errors section
        var errorsEl = document.getElementById('importPreviewErrors');
        if (validation.errors.length > 0) {
            errorsEl.style.display = 'block';
            errorsEl.innerHTML = '<div class="import-preview-errors-title">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                ' Errores encontrados (' + validation.errors.length + ')' +
                '</div>' +
                '<ul class="import-preview-errors-list">' +
                validation.errors.slice(0, 10).map(function (err) {
                    return '<li>Fila ' + err.row + ' — <strong>' + err.field + '</strong>: ' + err.message + '</li>';
                }).join('') +
                (validation.errors.length > 10 ? '<li>...y ' + (validation.errors.length - 10) + ' errores más</li>' : '') +
                '</ul>';
        } else {
            errorsEl.style.display = 'none';
        }

        // Confirm button state
        var confirmBtn = document.getElementById('importPreviewConfirmBtn');
        if (validCount === 0 && _currentModule !== 'costos') {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Sin datos válidos';
        } else {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> Confirmar Importación (' + (_currentModule === 'costos' ? '1 registro' : validCount + ' productos') + ')';
        }

        // Show modal
        document.getElementById('importPreviewModal').classList.add('active');
    }

    /* ----------------------------------------------------------
       RENDER COSTOS PREVIEW — Formato especial para costos
       ---------------------------------------------------------- */

    function renderCostosPreview(costos) {
        if (!costos) return '<tr><td colspan="5"><div class="empty-state"><p>No se encontraron datos de costos</p></div></td></tr>';

        var rows = '';
        rows += '<tr class="import-preview-row-valid">' +
            '<td class="import-preview-row-num">1</td>' +
            '<td><strong>' + (costos.producto || '—') + '</strong></td>' +
            '<td>' + (costos.codigo || '—') + '</td>' +
            '<td>' + (costos.cantidad || '—') + '</td>' +
            '<td>' +
            '<div style="font-size:0.78rem; line-height: 1.5;">' +
            '<div><strong>MP Est:</strong> ' + costos.estandar.mpCant + ' × Q' + costos.estandar.mpPrecio.toFixed(2) + '</div>' +
            '<div><strong>MO Est:</strong> ' + costos.estandar.moCant + ' × Q' + costos.estandar.moPrecio.toFixed(2) + '</div>' +
            '<div><strong>CI Est:</strong> ' + costos.estandar.ciCant + ' × Q' + costos.estandar.ciPrecio.toFixed(2) + '</div>' +
            '<div style="margin-top:0.25rem; border-top: 1px solid var(--border); padding-top: 0.25rem;">' +
            '<strong>MP Real:</strong> ' + costos.real.mpCant + ' × Q' + costos.real.mpPrecio.toFixed(2) + '</div>' +
            '<div><strong>MO Real:</strong> ' + costos.real.moCant + ' × Q' + costos.real.moPrecio.toFixed(2) + '</div>' +
            '<div><strong>CI Real:</strong> ' + costos.real.ciCant + ' × Q' + costos.real.ciPrecio.toFixed(2) + '</div>' +
            '</div>' +
            '</td>' +
            '<td><span class="import-preview-badge-valid">✓ Válido</span></td>' +
            '</tr>';

        return rows;
    }

    /* ----------------------------------------------------------
       CLOSE & CONFIRM
       ---------------------------------------------------------- */

    function close() {
        var modal = document.getElementById('importPreviewModal');
        if (modal) modal.classList.remove('active');
        _onConfirm = null;
        _currentData = null;
    }

    function confirm() {
        if (_onConfirm && _currentData) {
            if (_currentModule === 'costos') {
                _onConfirm(_currentData);
            } else {
                // Filtrar solo los válidos
                var validItems = _currentData.filter(function (d) { return d._valid; });
                _onConfirm(validItems);
            }
        }
        close();
    }

    /* ----------------------------------------------------------
       PUBLIC API
       ---------------------------------------------------------- */

    return {
        show: show,
        close: close,
        confirm: confirm
    };
})();
