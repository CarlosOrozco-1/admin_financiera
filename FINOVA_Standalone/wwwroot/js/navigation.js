/* ============================================================
   NAVIGATION
   Navegación, scroll suave e Intersection Observer
   ============================================================ */

/**
 * Desplaza la vista hacia una sección específica.
 * @param {string} id - ID de la sección
 */
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    // Actualizar estado activo en la navegación
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + id);
    if (navBtn) navBtn.classList.add('active');
}

/**
 * Inicializa el Intersection Observer para resaltar
 * automáticamente el botón de navegación activo.
 */
function initNavObserver() {
    const sections = document.querySelectorAll('.section');
    const navBtns = {
        'producto': document.getElementById('nav-producto'),
        'estandar': document.getElementById('nav-estandar'),
        'real': document.getElementById('nav-real'),
        'resultados': document.getElementById('nav-resultados'),
        'informe': document.getElementById('nav-informe'),
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                const btn = navBtns[entry.target.id];
                if (btn) btn.classList.add('active');
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(section => observer.observe(section));
}
