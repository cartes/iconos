import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// Rutas con prefijo de tenant (ej. /api/1/empresas)
const API_BASE_URL = "https://apiiconos-production.up.railway.app/api/1";

// Rutas centrales sin prefijo de tenant (ej. /api/estado, /api/super-admin/...)
const CENTRAL_BASE_URL = "https://apiiconos-production.up.railway.app/api";

const addAuthInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url || "";
      if (status === 401 && !requestUrl.includes("login") && !requestUrl.includes("logout")) {
        const authStore = useAuthStore();
        authStore.logout();
        window.location.hash = "#/login";
      }
      return Promise.reject(error);
    },
  );
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

const centralApi = axios.create({
  baseURL: CENTRAL_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

addAuthInterceptors(api);
addAuthInterceptors(centralApi);

const handleApiError = (endpoint, error) => {
  console.error(`API Request Error [${endpoint}]:`, error);

  const status = error.response ? error.response.status : null;
  const data = error.response ? error.response.data : null;

  if (status === 401 && endpoint !== "login" && endpoint !== "logout") {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    window.location.hash = "#/login";
    return { success: false, error: "Sesión expirada o token inválido" };
  }

  if (status === 403) {
    return { success: false, error: "No tienes permisos para realizar esta acción.", forbidden: true };
  }

  if (status === 422 && data?.errors) {
    const firstField = Object.values(data.errors)[0];
    const firstMsg = Array.isArray(firstField) ? firstField[0] : firstField;
    return { success: false, error: firstMsg || "Datos inválidos. Revisa los campos.", errors: data.errors };
  }

  const errorMessage = data?.error || data?.message || error.message || `Error del servidor (${status})`;
  return { success: false, error: errorMessage };
};

const makeRequest = async (instance, endpoint, options = {}) => {
  try {
    const response = await instance({
      method: options.method || "GET",
      url: endpoint,
      headers: options.headers || {},
      data: options.data,
    });
    if (response.status === 204) return { success: true };
    return response.data;
  } catch (error) {
    return handleApiError(endpoint, error);
  }
};

// Para rutas con contexto de tenant (ej. /api/1/empresas)
export const apiRequest = (endpoint, options = {}) => makeRequest(api, endpoint, options);

// Para rutas centrales sin contexto de tenant (ej. /api/estado, /api/super-admin/...)
export const centralApiRequest = (endpoint, options = {}) => makeRequest(centralApi, endpoint, options);

// ── Dashboard de métricas ───────────────────────────────────────────
export const getDashboardStats = () => apiRequest("/dashboard");

export const trackIconClick = (iconId) => apiRequest(`/iconos/${iconId}/click`, { method: "POST" });
