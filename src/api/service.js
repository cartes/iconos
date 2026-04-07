import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const API_BASE_URL = "https://apiiconos-production.up.railway.app/api"; //import.meta.env.VITE_API_URL || "http://localhost:8004/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Tenant": "1", // <-- Inyección permanente del identificador de la agencia para cada petición
  },
});

// Interceptor de peticiones para agregar el token dinámico
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Inyectar el Tenant ID desde la sesión del usuario si esta disponible
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.tenantId) {
        config.headers["X-Tenant"] = user.tenantId;
      } else {
        // Si no hay tenantId, se establece el valor por defecto
        config.headers["X-Tenant"] = "1";
      }
    } catch {
      //
      config.headers["X-Tenant"] = "1";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de respuestas: captura 401 global para limipar sesión y redirigir a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    //
    if (status === 401 && !requestUrl.includes("login")) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.hash = "#/login";
    }

    return Promise.reject(error);
  },
);

// Mantenemos la función original para no romper ninguna llamada en otras partes del código
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const config = {
      method: options.method || "GET",
      url: endpoint, // axios resuelve automáticamente con la baseURL
      headers: options.headers || {},
      data: options.data, // axios se encarga del JSON.stringify automáticamente
    };

    const response = await api(config);

    if (response.status === 204) {
      return { success: true };
    }

    // En Axios los datos ya vienen parseados como objeto JSON en `response.data`
    return response.data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);

    const status = error.response ? error.response.status : null;
    const data = error.response ? error.response.data : null;

    // 401 — Sesión expirada
    if (status === 401 && endpoint !== "login") {
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      window.location.hash = "#/login";
      return { success: false, error: "Sesión expirada o token inválido" };
    }

    // 403 — Sin permisos
    if (status === 403) {
      return {
        success: false,
        error: "No tienes permisos para realizar esta acción.",
        forbidden: true,
      };
    }

    // 422 — Errores de validación de Laravel: propagar los errors por campo
    if (status === 422 && data?.errors) {
      const firstField = Object.values(data.errors)[0];
      const firstMsg = Array.isArray(firstField) ? firstField[0] : firstField;
      return {
        success: false,
        error: firstMsg || "Datos inválidos. Revisa los campos.",
        errors: data.errors,
      };
    }

    const errorMessage =
      data?.error || data?.message || error.message || `Error del servidor (${status})`;

    return { success: false, error: errorMessage };
  }
};

// ── Dashboard de métricas ───────────────────────────────────────────
export const getDashboardStats = () => apiRequest("/dashboard");

export const trackIconClick = (iconId) => apiRequest(`/iconos/${iconId}/click`, { method: "POST" });
