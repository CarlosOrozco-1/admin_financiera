/* ============================================================
   AUTH — Sistema de autenticación FINOVA
   Login, logout, protección de páginas, gestión de sesión
   ============================================================ */

const FiNovaAuth = (function () {
    'use strict';

    const SESSION_KEY = 'finova_session';

    /**
     * Intenta autenticar un usuario
     * @param {string} username
     * @param {string} password
     * @returns {{success: boolean, user: object|null, message: string}}
     */
    function login(username, password) {
        const users = FiNovaDB.getAll(FiNovaDB.COLLECTIONS.USERS);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const session = {
                userId: user.id,
                username: user.username,
                nombre: user.nombre,
                role: user.role,
                loginAt: new Date().toISOString()
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

            // Registrar en auditoría
            if (typeof FiNovaAudit !== 'undefined') {
                FiNovaAudit.log('Login', 'Inicio de sesión', `Usuario: ${user.username}`);
            }

            return { success: true, user: session, message: 'Inicio de sesión exitoso' };
        }

        return { success: false, user: null, message: 'Usuario o contraseña incorrectos' };
    }

    /**
     * Cierra la sesión actual
     */
    function logout() {
        const session = getSession();
        if (session && typeof FiNovaAudit !== 'undefined') {
            FiNovaAudit.log('Login', 'Cierre de sesión', `Usuario: ${session.username}`);
        }
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    }

    /**
     * Obtiene la sesión activa
     * @returns {object|null}
     */
    function getSession() {
        try {
            const data = sessionStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Verifica si hay una sesión activa
     * @returns {boolean}
     */
    function isAuthenticated() {
        return getSession() !== null;
    }

    /**
     * Verifica si el usuario actual es admin
     * @returns {boolean}
     */
    function isAdmin() {
        const session = getSession();
        return session && session.role === 'admin';
    }

    /**
     * Protege una página — redirige al login si no hay sesión
     * Llamar al inicio de cada página protegida
     */
    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Obtiene el nombre del usuario actual
     * @returns {string}
     */
    function getCurrentUserName() {
        const session = getSession();
        return session ? session.nombre : 'Invitado';
    }

    /**
     * Obtiene el username del usuario actual
     * @returns {string}
     */
    function getCurrentUsername() {
        const session = getSession();
        return session ? session.username : '';
    }

    return {
        login,
        logout,
        getSession,
        isAuthenticated,
        isAdmin,
        requireAuth,
        getCurrentUserName,
        getCurrentUsername
    };
})();
