import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminDashboard.vue"),
      meta: { requiresAuth: true, role: "admin" },
    },
    {
      path: "/admin/explore/:id/:nombre",
      name: "admin-explore",
      component: () => import("../views/AdminExplorer.vue"),
      meta: { requiresAuth: true, role: "admin" },
    },
    {
      path: "/portal",
      name: "portal",
      component: () => import("../views/UserPortal.vue"),
      meta: { requiresAuth: true, role: "usuario" },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && auth.isAuthenticated) {
    if (auth.user.rol === "admin") {
      next("/admin");
    } else {
      next("/portal");
    }
  } else if (to.meta.role && auth.user?.rol !== to.meta.role) {
    next(auth.user?.rol === "admin" ? "/admin" : "/portal");
  } else {
    next();
  }
});

export default router;
