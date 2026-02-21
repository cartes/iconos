import { defineStore } from "pinia";
import { apiRequest } from "@/api/service";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    isAuthenticated: !!localStorage.getItem("user"),
    loading: false,
    error: null,
  }),

  actions: {
    async login(email, clave) {
      this.loading = true;
      this.error = null;

      const res = await apiRequest("login", { method: "POST", data: { email, clave } });

      if (res.success) {
        const userData = {
          email: res.usuario.email,
          nombre: res.usuario.nombre,
          rol: res.usuario.rol,
          empresa: res.usuario.empresaNombre || res.usuario.empresa,
          empresaId: res.usuario.empresaId,
          puedeEliminar: res.usuario.puedeEliminar !== false,
        };

        this.user = userData;
        this.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("auth_token", res.token);
        return { success: true };
      } else {
        this.error = res.error || "Credenciales inválidas";
        return { success: false, error: this.error };
      }
    },

    logout() {
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      apiRequest("logout", { method: "POST" }).catch(() => {});
    },

    async checkBootstrap() {
      const res = await apiRequest("estado");
      return res;
    },
  },
});
