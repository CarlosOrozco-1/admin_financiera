/* ============================================================
   API — Cliente HTTP para la API REST FINOVA
   Maneja autenticacion JWT y todas las peticiones al backend
   ============================================================ */

const FinovaAPI = (function () {
  "use strict";

  const API_BASE_URL = "/api";
  const SESSION_KEY = "finova_session";
  let sessionToken = null;

  /**
   * Obtiene el token JWT almacenado en sesion
   * @returns {string|null}
   */
  function getToken() {
    if (sessionToken) return sessionToken;
    const s = sessionStorage.getItem(SESSION_KEY);
    if (s) {
      try {
        sessionToken = JSON.parse(s).token || null;
      } catch {
        sessionToken = null;
      }
    }
    return sessionToken;
  }

  /**
   * Almacena el token JWT en memoria y sessionStorage
   * @param {string} token
   */
  function setToken(token) {
    sessionToken = token;
  }

  /**
   * Elimina el token de memoria y sessionStorage
   */
  function clearToken() {
    sessionToken = null;
  }

  /**
   * Peticion HTTP generica con fetch
   * @param {string} method - GET, POST, PUT, DELETE
   * @param {string} path - Ruta relativa a BASE_URL (ej: "/auth/login")
   * @param {object|null} body - Cuerpo para POST/PUT
   * @param {boolean} auth - Si incluye token JWT (por defecto true)
   * @returns {Promise<object>} - {ok, status, data}
   */
  async function request(method, path, body = null, auth = true) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = "Bearer " + token;
    }

    try {
      // Correccion: se usa la constante declarada API_BASE_URL para evitar error "BASE_URL is not defined".
      const res = await fetch(API_BASE_URL + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      let data = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json") && res.status !== 204) {
        data = await res.json();
      }

      if (!res.ok) {
        let msg = "Error del servidor";
        if (data && data.message) msg = data.message;
        else if (data && data.title) msg = data.title;
        else if (res.status === 401) msg = "Sesion expirada";
        else if (res.status === 403) msg = "Acceso denegado";
        else if (res.status === 404) msg = "Recurso no encontrado";
        else msg = "Error " + res.status;

        if (res.status === 401) {
          clearToken();
          sessionStorage.removeItem(SESSION_KEY);
          if (!window.location.pathname.includes("login.html")) {
            window.location.href = "login.html";
          }
        }

        return { ok: false, status: res.status, data: null, message: msg };
      }

      return { ok: true, status: res.status, data };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        data: null,
        message: "Error de conexion: " + err.message,
      };
    }
  }

  async function get(path, auth = true) {
    return request("GET", path, null, auth);
  }
  async function post(path, body, auth = true) {
    return request("POST", path, body, auth);
  }
  async function put(path, body, auth = true) {
    return request("PUT", path, body, auth);
  }
  async function del(path, auth = true) {
    return request("DELETE", path, null, auth);
  }

  /*
   * Autenticacion
   */
  async function login(username, password) {
    const res = await post("/auth/login", { username, password }, false);
    if (!res.ok) {
      return { success: false, user: null, message: res.message };
    }
    setToken(res.data.token);
    var userData = res.data.user || {};
    const session = {
      userId: userData.id || 0,
      username: userData.username || "",
      nombre: userData.nombre || userData.username || "",
      role: userData.role || "user",
      token: res.data.token,
      loginAt: new Date().toISOString(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return {
      success: true,
      user: session,
      message: "Inicio de sesion exitoso",
    };
  }

  async function logout() {
    const res = await post("/auth/logout", {});
    if (res.ok) {
      /* ok */
    }
    clearToken();
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
  }

  async function getProfile() {
    return get("/auth/me");
  }

  /*
   * Inventario
   */
  const inventario = {
    async getAll(categoria, busqueda) {
      const params = new URLSearchParams();
      if (categoria && categoria !== "Todas")
        params.set("categoria", categoria);
      if (busqueda) params.set("busqueda", busqueda);
      const q = params.toString();
      const res = await get("/inventario" + (q ? "?" + q : ""));
      return res.ok ? res.data : [];
    },
    async getById(id) {
      const res = await get("/inventario/" + id);
      return res.ok ? res.data : null;
    },
    async create(data) {
      const res = await post("/inventario", data);
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
    async update(id, data) {
      const res = await put("/inventario/" + id, data);
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
    async remove(id) {
      const res = await del("/inventario/" + id);
      return res.ok;
    },
    async getStats() {
      const res = await get("/inventario/stats");
      return res.ok
        ? res.data
        : { totalItems: 0, totalValue: 0, lowStock: 0, totalUnits: 0 };
    },
    async getCategories() {
      const res = await get("/inventario/categorias");
      return res.ok ? res.data : [];
    },
  };

  /*
   * Costos
   */
  const costos = {
    async getAll() {
      const res = await get("/costos");
      return res.ok ? res.data : [];
    },
    async getById(id) {
      const res = await get("/costos/" + id);
      return res.ok ? res.data : null;
    },
    async create(data) {
      const res = await post("/costos", data);
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
    async remove(id) {
      const res = await del("/costos/" + id);
      return res.ok;
    },
  };

  /*
   * Proyecciones
   */
  const proyecciones = {
    async getAll() {
      const res = await get("/proyecciones");
      return res.ok ? res.data : [];
    },
    async getById(id) {
      const res = await get("/proyecciones/" + id);
      return res.ok ? res.data : null;
    },
    async create(data) {
      const res = await post("/proyecciones", data);
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
    async remove(id) {
      const res = await del("/proyecciones/" + id);
      return res.ok;
    },
  };

  /*
   * Auditoria
   */
  const auditoria = {
    async getAll(modulo, page, limit) {
      const params = new URLSearchParams();
      if (modulo && modulo !== "Todos") params.set("modulo", modulo);
      if (page) params.set("page", page);
      if (limit) params.set("limit", limit);
      const q = params.toString();
      const res = await get("/auditoria" + (q ? "?" + q : ""));
      return res.ok ? res.data : [];
    },
    async getStats() {
      const res = await get("/auditoria/stats");
      return res.ok ? res.data : { total: 0, byModule: [], usuariosActivos: 0 };
    },
    async clearAll() {
      const res = await del("/auditoria");
      return res.ok;
    },
  };

  /*
   * Dashboard
   */
  const dashboard = {
    async getStats() {
      const res = await get("/dashboard/stats");
      return res.ok ? res.data : {};
    },
  };

  /*
   * Kardex (Ingresos y Egresos)
   */
  const kardex = {
    async getAll(inventarioId, tipo) {
      const params = new URLSearchParams();
      if (inventarioId) params.set("inventarioId", inventarioId);
      if (tipo && tipo !== "Todos") params.set("tipo", tipo);
      const q = params.toString();
      const res = await get("/kardex" + (q ? "?" + q : ""));
      return res.ok ? res.data : [];
    },
    async registrar(data) {
      const res = await post("/kardex", data);
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
  };

  /*
   * Gestión de Usuarios
   */
  const usuarios = {
    async getAll() {
      const res = await get("/usuarios");
      return res.ok ? res.data : [];
    },
    async create(data) {
      const res = await post("/usuarios", data);
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
    async update(id, data) {
      const res = await put("/usuarios/" + id, data);
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
    async toggleStatus(id) {
      const res = await put("/usuarios/" + id + "/toggle");
      return res.ok
        ? { ok: true, data: res.data }
        : { ok: false, message: res.message };
    },
  };

  /*
   * Health Check — Verifica el estado de la API y la base de datos
   */
  async function healthCheck() {
    try {
      const res = await request("GET", "/health", null, false);
      return {
        ok: res.ok,
        apiStatus: res.data?.status || "unknown",
        dbStatus: res.data?.database || "unknown",
        timestamp: res.data?.timestamp || null
      };
    } catch (err) {
      return {
        ok: false,
        apiStatus: "offline",
        dbStatus: "unknown",
        timestamp: null,
        error: err.message
      };
    }
  }

  // API publica
  return {
    getToken,
    setToken,
    clearToken,
    request,
    get,
    post,
    put,
    del,
    login,
    logout,
    getProfile,
    inventario,
    costos,
    proyecciones,
    auditoria,
    dashboard,
    kardex,
    usuarios,
    healthCheck,
  };
})();
