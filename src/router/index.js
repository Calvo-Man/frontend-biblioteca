import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/authentication/LoginView.vue"),
    meta: {
      requiresGuest: true,
    },
  },

  // ==========================================
  // PANEL ADMINISTRATIVO
  // ==========================================
  {
    path: "/",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: ["ADMIN"],
    },
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/dashboard/DashboardView.vue"),
        meta: {
          title: "Inicio",
        },
      },
      {
        path: "books",
        name: "Books",
        component: () => import("../views/books/BooksView.vue"),
        meta: {
          title: "Libros",
        },
      },
      {
        path: "copies",
        name: "Copies",
        component: () => import("../views/copies/CopiesView.vue"),
        meta: {
          title: "Ejemplares",
        },
      },
      {
        path: "categories",
        name: "Categories",
        component: () => import("../views/categories/CategoriesView.vue"),
        meta: {
          title: "Categorías",
        },
      },
      {
        path: "students",
        name: "Students",
        component: () => import("../views/students/StudentsView.vue"),
        meta: {
          title: "Estudiantes",
        },
      },
      {
        path: "loans",
        name: "Loans",
        component: () => import("../views/loans/LoansView.vue"),
        meta: {
          title: "Préstamos",
        },
      },
      {
        path: "returns",
        name: "Returns",
        component: () => import("../views/returns/ReturnsView.vue"),
        meta: {
          title: "Devoluciones",
        },
      },
      {
        path: "history",
        name: "LoanHistory",
        component: () => import("../views/history/LoanHistoryView.vue"),
        meta: {
          title: "Historial",
        },
      },
      {
        path: "reports",
        name: "Reports",
        component: () => import("../views/reports/ReportsView.vue"),
        meta: {
          title: "Reportes",
        },
      },
    ],
  },

  // ==========================================
  // PORTAL DEL ESTUDIANTE
  // ==========================================
  {
    path: "/student",
    component: () => import("../layouts/StudentLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: ["STUDENT"],
    },
    children: [
      {
        path: "",
        redirect: "/student/dashboard",
      },
      {
        path: "dashboard",
        name: "StudentDashboard",
        component: () => import("../views/student/StudentDashboardView.vue"),
        meta: {
          title: "Inicio",
        },
      },
      {
        path: "catalog",
        name: "StudentCatalog",
        component: () => import("../views/student/StudentCatalogView.vue"),
        meta: {
          title: "Catálogo de libros",
        },
      },

      {
        path: "loans",
        name: "StudentLoans",
        component: () => import("../views/student/StudentLoansView.vue"),
        meta: {
          title: "Mis préstamos",
        },
      },
      {
        path: "history",
        name: "StudentHistory",
        component: () => import("../views/student/StudentHistoryView.vue"),
        meta: {
          title: "Mi historial",
        },
      },
      {
        path: "profile",
        name: "StudentProfile",
        component: () => import("../views/student/StudentProfileView.vue"),
        meta: {
          title: "Mi perfil",
        },
      },
    ],
  },

  // ==========================================
  // RUTAS NO ENCONTRADAS
  // ==========================================
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.sessionChecked) {
    await authStore.checkSession();
  }

  const authenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  // Usuario autenticado intentando entrar al login
  if (to.meta.requiresGuest && authenticated) {
    return userRole === "STUDENT" ? "/student/dashboard" : "/dashboard";
  }

  // Usuario no autenticado intentando entrar a rutas protegidas
  if (to.meta.requiresAuth && !authenticated) {
    return "/login";
  }

  // Validación de permisos por rol
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    if (userRole === "ADMIN") {
      return "/dashboard";
    }

    if (userRole === "STUDENT") {
      return "/student/dashboard";
    }

    return "/login";
  }

  return true;
});

export default router;
