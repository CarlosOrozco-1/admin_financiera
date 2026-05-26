/* ============================================================
   AUTH — Sistema de autenticacion FINOVA
   Login mediante API REST, sesion en sessionStorage
   Compatible con la interfaz anterior: auth.js se carga
   despues de api.js para usar FinovaAPI
   ============================================================ */

const FiNovaAuth = (function () {
    'use strict';

    const SESSION_KEY = 'finova_session';

    /**
     * Obtiene la sesion activa desde sessionStorage
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
     * Verifica si hay sesion activa
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
        var s = getSession();
        return s && s.role === 'admin';
    }

    /**
     * Redirige al login si no hay sesion
     * @returns {boolean}
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
        var s = getSession();
        return s ? s.nombre : 'Invitado';
    }

    /**
     * Obtiene el username del usuario actual
     * @returns {string}
     */
    function getCurrentUsername() {
        var s = getSession();
        return s ? s.username : '';
    }

    /**
     * Inicia sesion contra la API REST
     * @param {string} username
     * @param {string} password
     * @returns {Promise<{success: boolean, user: object|null, message: string}>}
     */
    async function login(username, password) {
        /*
         * Se usa FinovaAPI.login() que llama a POST /api/auth/login.
         * Si la API no esta disponible (FinovaAPI no definido),
         * fallback a localStorage para desarrollo local.
         */
        if (typeof FinovaAPI !== 'undefined') {
            var result = await FinovaAPI.login(username, password);
            if (result.success && typeof FiNovaAudit !== 'undefined') {
                FiNovaAudit.log('Login', 'Inicio de sesion', 'Usuario: ' + username);
            }
            return result;
        }

        // Fallback: login local con localStorage
        var users = FiNovaDB.getAll(FiNovaDB.COLLECTIONS.USERS);
        var user = users.find(function (u) { return u.username === username && u.password === password; });

        if (user) {
            var session = {
                userId: user.id,
                username: user.username,
                nombre: user.nombre,
                role: user.role,
                loginAt: new Date().toISOString()
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            if (typeof FiNovaAudit !== 'undefined') {
                FiNovaAudit.log('Login', 'Inicio de sesion', 'Usuario: ' + user.username);
            }
            return { success: true, user: session, message: 'Inicio de sesion exitoso' };
        }

        return { success: false, user: null, message: 'Usuario o contrasena incorrectos' };
    }

    /**
     * Cierra la sesion actual
     */
    async function logout() {
        var session = getSession();
        if (session) {
            if (typeof FiNovaAudit !== 'undefined') {
                FiNovaAudit.log('Login', 'Cierre de sesion', 'Usuario: ' + session.username);
            }
            if (typeof FinovaAPI !== 'undefined') {
                await FinovaAPI.logout();
                return;
            }
        }
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
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
