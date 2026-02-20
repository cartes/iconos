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

      const res = await apiRequest("login", { email, clave });

      if (res.success) {
        const userData = {
          email,
          clave,
          nombre: res.nombre,
          rol: res.rol,
          empresa: res.empresaNombre || res.empresa,
          puedeEliminar: res.puedeEliminar !== false,
        };

        this.user = userData;
        this.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(userData));
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
    },

    async checkBootstrap() {
      const res = await apiRequest("verificarEstado");
      return res;
    },
  },
});
