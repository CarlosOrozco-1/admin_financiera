/* ============================================================
   THEME MANAGER
   Manejo de los 3 temas: Claro, Oscuro y Paleta Brisa
   ============================================================ */

let currentTheme = 'light';
let previousClaroOscuro = 'light'; // Guarda el estado anterior (claro/oscuro) al activar brisa

/**
 * Inicializa el tema al cargar la página
 */
function initTheme() {
    // 1. Intentar obtener del localStorage
    const savedTheme = localStorage.getItem('costos-theme');
    
    // 2. Si no hay guardado, usar claro por defecto
    let themeToApply = 'light';
    if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'brisa') {
        themeToApply = savedTheme;
    }

    // 3. Aplicar tema
    setTheme(themeToApply, false); // false para no mostrar Toast al cargar
}

/**
 * Cambia y aplica el tema seleccionado
 * @param {string} theme - 'light', 'dark', o 'brisa'
 * @param {boolean} showNotification - Si debe mostrar un toast avisando el cambio
 */
function setTheme(theme, showNotification = true) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('costos-theme', theme);

    if (theme === 'light' || theme === 'dark') {
        previousClaroOscuro = theme;
    }

    // Actualizar botones de la interfaz
    updateThemeButtons();

    // Mostrar notificación
    if (showNotification) {
        let themeName = 'Tema Claro';
        if (theme === 'dark') themeName = 'Tema Oscuro';
        if (theme === 'brisa') themeName = 'Paleta Brisa (Turquesa)';
        
        if (typeof showToast === 'function') {
            showToast(`Tema cambiado a: ${themeName}`);
        }
    }
}

/**
 * Alterna entre tema Claro y tema Oscuro
 */
function toggleClaroOscuro() {
    if (currentTheme === 'dark') {
        setTheme('light');
    } else if (currentTheme === 'light') {
        setTheme('dark');
    } else {
        // Si estaba en Brisa, ir al opuesto del anterior, o simplemente alternar el anterior
        const next = previousClaroOscuro === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }
}

/**
 * Activa o desactiva la paleta especial (Brisa)
 */
function toggleBrisa() {
    if (currentTheme === 'brisa') {
        // Si ya está activo, volver al tema claro/oscuro previo
        setTheme(previousClaroOscuro);
    } else {
        setTheme('brisa');
    }
}

/**
 * Actualiza los estados visuales e íconos de los botones de tema
 */
function updateThemeButtons() {
    const btnClaroOscuro = document.getElementById('btn-toggle-dark');
    const btnBrisa = document.getElementById('btn-toggle-brisa');
    const iconToggle = document.getElementById('theme-icon-toggle');
    const textToggle = document.getElementById('theme-text-toggle');

    if (!btnClaroOscuro || !btnBrisa) return;

    // 1. Actualizar botón Claro/Oscuro
    if (currentTheme === 'dark') {
        btnClaroOscuro.classList.add('active');
        btnBrisa.classList.remove('active');
        
        // Icono de Sol para ir a Claro
        if (iconToggle) {
            iconToggle.innerHTML = `<circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
        }
        if (textToggle) textToggle.textContent = 'Modo Oscuro';
    } else if (currentTheme === 'light') {
        btnClaroOscuro.classList.remove('active');
        btnBrisa.classList.remove('active');
        
        // Icono de Luna para ir a Oscuro
        if (iconToggle) {
            iconToggle.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
        }
        if (textToggle) textToggle.textContent = 'Modo Claro';
    } else if (currentTheme === 'brisa') {
        // En Brisa, el botón brisa está activo. El botón claro/oscuro muestra el icono según el anterior.
        btnBrisa.classList.add('active');
        btnClaroOscuro.classList.remove('active');
        
        // Icono de Luna/Sol según lo anterior
        if (iconToggle) {
            if (previousClaroOscuro === 'dark') {
                iconToggle.innerHTML = `<circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
                if (textToggle) textToggle.textContent = 'Modo Oscuro';
            } else {
                iconToggle.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
                if (textToggle) textToggle.textContent = 'Modo Claro';
            }
        }
    }
}

// Ejecutar inicialización inmediatamente para evitar destello de color
initTheme();

// Asegurar que los botones se actualicen visualmente una vez cargado el DOM
document.addEventListener('DOMContentLoaded', updateThemeButtons);

