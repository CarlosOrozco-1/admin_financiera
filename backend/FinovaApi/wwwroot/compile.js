const fs = require('fs');
const path = require('path');

/**
 * Script de compilación FINOVA
 * Compila todos los archivos HTML del sistema en versiones autocontenidas.
 * Los logos se embeben como base64, los CSS y JS se inyectan inline.
 */

const baseDir = __dirname;

// Archivos HTML a compilar
const htmlFiles = [
    'index.html',
    'login.html',
    'dashboard.html',
    'costos.html',
    'inventario.html',
    'proyeccion.html',
    'auditoria.html'
];

const outputDir = path.join(baseDir, 'dist');

console.log('📦 FINOVA — Iniciando compilación...\n');

// Crear directorio de salida
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Cache de archivos ya leídos
const fileCache = {};

function readCached(filePath) {
    if (!fileCache[filePath]) {
        if (fs.existsSync(filePath)) {
            fileCache[filePath] = fs.readFileSync(filePath, 'utf8');
        } else {
            console.warn(`  ⚠️ Archivo no encontrado: ${filePath}`);
            fileCache[filePath] = '';
        }
    }
    return fileCache[filePath];
}

// Convertir imágenes a base64
function imageToBase64(imgPath) {
    if (fs.existsSync(imgPath)) {
        const ext = path.extname(imgPath).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
        const data = fs.readFileSync(imgPath).toString('base64');
        return `data:${mime};base64,${data}`;
    }
    return '';
}

// Logo base64 cache
const logoBase64 = {};
function getLogoBase64(logoFile) {
    if (!logoBase64[logoFile]) {
        logoBase64[logoFile] = imageToBase64(path.join(baseDir, logoFile));
    }
    return logoBase64[logoFile];
}

let compiledCount = 0;

htmlFiles.forEach(htmlFile => {
    const htmlPath = path.join(baseDir, htmlFile);
    
    if (!fs.existsSync(htmlPath)) {
        console.warn(`  ⚠️ Archivo HTML no encontrado: ${htmlFile}`);
        return;
    }

    console.log(`  📄 Compilando: ${htmlFile}`);
    let content = fs.readFileSync(htmlPath, 'utf8');

    // 1. Reemplazar CSS links con contenido inline
    const cssLinkRegex = /<link\s+rel="stylesheet"\s+href="(css\/[^"]+)">/g;
    content = content.replace(cssLinkRegex, (match, cssFile) => {
        const cssPath = path.join(baseDir, cssFile);
        const cssContent = readCached(cssPath);
        if (cssContent) {
            console.log(`     🔹 CSS: ${cssFile}`);
            return `<style>\n/* --- ${cssFile} --- */\n${cssContent}\n</style>`;
        }
        return match;
    });

    // 2. Reemplazar JS src con contenido inline (archivos locales)
    const jsScriptRegex = /<script\s+src="(js\/[^"]+)"><\/script>/g;
    content = content.replace(jsScriptRegex, (match, jsFile) => {
        const jsPath = path.join(baseDir, jsFile);
        const jsContent = readCached(jsPath);
        if (jsContent) {
            console.log(`     🔸 JS:  ${jsFile}`);
            return `<script>\n/* --- ${jsFile} --- */\n${jsContent}\n</script>`;
        }
        return match;
    });

    // 3. Reemplazar rutas de imágenes con base64
    const imgSrcRegex = /src="(FINOVA-LOGO\/[^"]+)"/g;
    content = content.replace(imgSrcRegex, (match, imgFile) => {
        const b64 = getLogoBase64(imgFile);
        if (b64) {
            console.log(`     🖼️ Logo: ${imgFile}`);
            return `src="${b64}"`;
        }
        return match;
    });

    // 4. Reemplazar href a páginas internas con anchors (para navegación en una carpeta)
    // No modificamos los hrefs ya que cada archivo se compila individualmente

    // 5. Escribir archivo compilado
    const outputPath = path.join(outputDir, htmlFile);
    fs.writeFileSync(outputPath, content, 'utf8');
    compiledCount++;
});

// También compilar la versión legacy autocontenida de costos
const legacyOutput = path.join(baseDir, 'Costos_Predeterminados_ENTREGA.html');
const costosDistPath = path.join(outputDir, 'costos.html');
if (fs.existsSync(costosDistPath)) {
    fs.copyFileSync(costosDistPath, legacyOutput);
    console.log(`\n  📋 Versión legacy copiada: Costos_Predeterminados_ENTREGA.html`);
}

console.log(`\n✅ ¡Compilación completada! ${compiledCount} archivos generados en /dist`);
console.log('💾 Los archivos en /dist son autocontenidos y pueden abrirse directamente en el navegador.');
console.log('ℹ️  Nota: Los CDNs externos (SheetJS, jsPDF, Chart.js) no se inyectan y requieren conexión a internet.');
