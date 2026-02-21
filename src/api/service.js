const API_BASE_URL = "https://apiiconos-production.up.railway.app/api"; // import.meta.env.VITE_API_URL || "http://localhost:8004/api";

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("auth_token");

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method: options.method || "GET",
      headers,
    };

    if (options.data) {
      config.body = JSON.stringify(options.data);
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);

    if (response.status === 401 && endpoint !== "login") {
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      window.location.hash = "#/login";
      throw new Error("Sesión expirada o token inválido");
    }

    if (response.status === 204) {
      return { success: true };
    }

    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      console.error("Non-JSON API response:", text);
      throw new Error(`Error del servidor (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    return { success: false, error: error.message || "Error de conexión" };
  }
};
