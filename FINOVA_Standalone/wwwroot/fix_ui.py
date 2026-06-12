import os
import re

dir_path = r"c:\Users\usuario\Documents\2026\Proyecto-Universitarios\Financiero\admin_financiera\AdmonExamen"
files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

base_nav = """            <nav class="sidebar-nav">
                <span class="sidebar-section-label">Principal</span>
                <a href="dashboard.html" class="sidebar-link{dash_active}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Dashboard
                </a>
                <a href="costos.html" class="sidebar-link{costos_active}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
                    Costos
                </a>

                <span class="sidebar-section-label">Inventarios</span>
                <a href="inventario.html" class="sidebar-link{inv_active}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Inventario
                </a>
                <a href="kardex.html" class="sidebar-link{kardex_active}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="M9 18l3-3-3-3"/></svg>
                    Kardex
                </a>
                <a href="proyeccion.html" class="sidebar-link{proy_active}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Proyección
                </a>

                <span class="sidebar-section-label">Sistema</span>
                <a href="auditoria.html" class="sidebar-link{audi_active}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Auditoría
                </a>
                <a href="usuarios.html" class="sidebar-link{usu_active}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Usuarios
                </a>
            </nav>"""

new_toggle_func = """function toggleSidebar() {
        const appLayout = document.querySelector('.app-layout');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (window.innerWidth <= 900) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            return;
        }
        if (appLayout) appLayout.classList.toggle('sidebar-collapsed');
    }"""

new_btn = """<button class="mobile-menu-btn always-visible" onclick="toggleSidebar()" title="Mostrar u ocultar menú lateral" style="display:inline-flex !important; visibility:visible; opacity:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    </button>"""

for file in files:
    if file == 'login.html' or file == 'index.html':
        continue
        
    file_path = os.path.join(dir_path, file)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine active state
    d_act = " active" if file == "dashboard.html" else ""
    c_act = " active" if "costos" in file.lower() else ""
    i_act = " active" if file == "inventario.html" else ""
    k_act = " active" if file == "kardex.html" else ""
    p_act = " active" if file == "proyeccion.html" else ""
    a_act = " active" if file == "auditoria.html" else ""
    u_act = " active" if file == "usuarios.html" else ""
    
    nav_filled = base_nav.format(dash_active=d_act, costos_active=c_act, inv_active=i_act, kardex_active=k_act, proy_active=p_act, audi_active=a_act, usu_active=u_act)
    
    # 1. Replace nav
    content = re.sub(r'<nav class="sidebar-nav">.*?</nav>', nav_filled, content, flags=re.DOTALL)
    
    # 2. Replace toggle function (single-line or multi-line)
    content = re.sub(r'function toggleSidebar\(\)\s*\{[^}]+\}', new_toggle_func, content)
    
    # 3. Replace mobile-menu-btn
    # Match various forms of mobile-menu-btn
    btn_pattern = r'<button class="mobile-menu-btn[^>]*" onclick="toggleSidebar\(\)"[^>]*>.*?<svg[^>]*>.*?<line[^>]*>.*?<line[^>]*>.*?<line[^>]*>.*?</svg>\s*</button>'
    content = re.sub(btn_pattern, new_btn, content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("UI fixes applied to HTML files.")
