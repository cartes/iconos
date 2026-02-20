const APPS_SCRIPT_URL = "https://apiiconos-production.up.railway.app/api/legacy";

export const apiRequest = async (accion, data = {}, auth = {}) => {
  try {
    const body = {
      accion,
      email: auth.email || null,
      clave: auth.clave || null,
      ...data,
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Request Error:", error);
    return { success: false, error: error.message || "Error de conexión" };
  }
};
