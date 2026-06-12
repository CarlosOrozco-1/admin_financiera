/* ============================================================
   PDF EXPORT — Generación de PDFs profesionales con jsPDF
   ============================================================ */

const FiNovaPDF = (function () {
    'use strict';

    function getLogoBase64(callback) {
        // Intenta cargar el logo como base64 para embeber en PDF
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            callback(canvas.toDataURL('image/png'));
        };
        img.onerror = function () {
            callback(null);
        };
        img.src = 'FINOVA-LOGO/Logotipo.png';
    }

    function addHeader(doc, title, logoBase64) {
        const pageWidth = doc.internal.pageSize.getWidth();

        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', 14, 10, 45, 14);
            } catch (e) { /* skip logo */ }
        }

        doc.setFontSize(16);
        doc.setTextColor(26, 58, 92);
        doc.setFont(undefined, 'bold');
        doc.text(title, pageWidth - 14, 20, { align: 'right' });

        doc.setFontSize(8);
        doc.setTextColor(130, 140, 160);
        doc.setFont(undefined, 'normal');
        const fecha = new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });
        const user = typeof FiNovaAuth !== 'undefined' ? FiNovaAuth.getCurrentUserName() : '';
        doc.text(`Fecha: ${fecha}${user ? ' | Usuario: ' + user : ''}`, pageWidth - 14, 27, { align: 'right' });

        doc.setDrawColor(13, 148, 136);
        doc.setLineWidth(0.5);
        doc.line(14, 30, pageWidth - 14, 30);

        return 36; // y position after header
    }

    function addFooter(doc) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const totalPages = doc.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150, 160, 175);
            doc.text('FINOVA — Plataforma de Costeo y Optimización Financiera', 14, pageHeight - 10);
            doc.text(`Administración Financiera I · Licda. Glenda Monterroso · Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
        }
    }

    /**
     * Exporta informe de costos a PDF
     */
    function exportCostos(data) {
        getLogoBase64(function (logo) {
            const doc = new jspdf.jsPDF();
            let y = addHeader(doc, 'Informe de Costos Predeterminados', logo);

            // Producto info
            doc.setFontSize(10);
            doc.setTextColor(26, 58, 92);
            doc.setFont(undefined, 'bold');
            doc.text(`Producto: ${data.producto || '—'}`, 14, y);
            doc.setFont(undefined, 'normal');
            doc.text(`Código: ${data.codigo || '—'}  |  Cantidad: ${data.cantidad || '—'}`, 14, y + 5);
            y += 14;

            // Tabla estándar
            doc.autoTable({
                startY: y,
                head: [['Concepto', 'Cantidad', 'Precio (Q)', 'Total Estándar (Q)', 'Total Real (Q)', 'Variación (Q)']],
                body: [
                    ['Materia Prima', data.mpCantEst, data.mpPrecioEst, data.mpTotalEst, data.mpTotalReal, data.mpVar],
                    ['Mano de Obra', data.moCantEst, data.moPrecioEst, data.moTotalEst, data.moTotalReal, data.moVar],
                    ['Costos Indirectos', data.ciCantEst, data.ciPrecioEst, data.ciTotalEst, data.ciTotalReal, data.ciVar],
                ],
                foot: [['TOTAL', '', '', data.totalEst, data.totalReal, data.totalVar]],
                theme: 'grid',
                headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                footStyles: { fillColor: [240, 244, 249], textColor: [26, 58, 92], fontStyle: 'bold', fontSize: 9 },
                styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 }
            });

            y = doc.lastAutoTable.finalY + 10;

            // Resultado
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(26, 58, 92);
            doc.text(`Resultado: ${data.resultado || '—'}`, 14, y);

            // Análisis
            if (data.analisis) {
                y += 8;
                doc.setFontSize(9);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(80, 90, 110);
                const lines = doc.splitTextToSize(data.analisis, 180);
                doc.text(lines, 14, y);
            }

            addFooter(doc);
            doc.save(`FINOVA_Costos_${data.producto || 'Informe'}_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    }

    /**
     * Exporta inventario a PDF
     */
    function exportInventario(items) {
        getLogoBase64(function (logo) {
            const doc = new jspdf.jsPDF();
            let y = addHeader(doc, 'Reporte de Inventario', logo);

            const body = items.map(item => [
                item.codigo,
                item.nombre,
                item.categoria,
                item.cantidad,
                'Q ' + (item.costoUnitario || 0).toFixed(2),
                'Q ' + ((item.cantidad || 0) * (item.costoUnitario || 0)).toFixed(2)
            ]);

            const totalValor = items.reduce((s, i) => s + (i.cantidad || 0) * (i.costoUnitario || 0), 0);

            doc.autoTable({
                startY: y,
                head: [['Código', 'Producto', 'Categoría', 'Cantidad', 'Costo Unit.', 'Valor Total']],
                body: body,
                foot: [['', '', '', `${items.length} productos`, 'TOTAL:', 'Q ' + totalValor.toFixed(2)]],
                theme: 'grid',
                headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                footStyles: { fillColor: [240, 244, 249], textColor: [26, 58, 92], fontStyle: 'bold', fontSize: 8 },
                styles: { fontSize: 7.5, cellPadding: 2.5 },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 }
            });

            addFooter(doc);
            doc.save(`FINOVA_Inventario_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    }

    /**
     * Exporta proyección a PDF
     */
    function exportProyeccion(items, titulo) {
        getLogoBase64(function (logo) {
            const doc = new jspdf.jsPDF();
            let y = addHeader(doc, titulo || 'Proyección de Inventario', logo);

            const body = items.map(item => [
                item.nombre,
                item.cantidadActual,
                item.cantidadProyectada,
                item.diferencia,
                item.porcentaje
            ]);

            doc.autoTable({
                startY: y,
                head: [['Producto', 'Actual', 'Proyectado', 'Diferencia', '% Cambio']],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                styles: { fontSize: 8, cellPadding: 3 },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 }
            });

            addFooter(doc);
            doc.save(`FINOVA_Proyeccion_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    }

    /**
     * Exporta auditoría a PDF
     */
    function exportAuditoria(records) {
        getLogoBase64(function (logo) {
            const doc = new jspdf.jsPDF('l'); // landscape
            let y = addHeader(doc, 'Reporte de Auditoría', logo);

            const body = records.map(r => [
                FiNovaAudit.formatDate(r.fecha),
                r.usuario,
                r.modulo,
                r.accion,
                r.detalle
            ]);

            doc.autoTable({
                startY: y,
                head: [['Fecha/Hora', 'Usuario', 'Módulo', 'Acción', 'Detalle']],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                styles: { fontSize: 7, cellPadding: 2.5 },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 'auto' }
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 }
            });

            addFooter(doc);
            doc.save(`FINOVA_Auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    }

    return {
        exportCostos,
        exportInventario,
        exportProyeccion,
        exportAuditoria
    };
})();
