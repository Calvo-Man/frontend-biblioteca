import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const sessionChecked = ref(false);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isStudent = computed(() => user.value?.role === 'STUDENT');

  async function loginAdmin(credentials) {
    loading.value = true;

    try {
      const response = await authService.loginAdmin(credentials);

      user.value = response.user;
      sessionChecked.value = true;

      return response;
    } finally {
      loading.value = false;
    }
  }

  async function loginStudent(credentials) {
    loading.value = true;

    try {
      const response = await authService.loginStudent(credentials);

      user.value = response.user;
      sessionChecked.value = true;

      return response;
    } finally {
      loading.value = false;
    }
  }

  async function checkSession() {
    if (sessionChecked.value) {
      return isAuthenticated.value;
    }

    loading.value = true;

    try {
      const response = await authService.getSession();

      user.value = response.user;

      return true;
    } catch (error) {
      user.value = null;

      if (error.response?.status !== 401) {
        console.error('No se pudo verificar la sesión.');
      }

      return false;
    } finally {
      sessionChecked.value = true;
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;

    try {
      await authService.logout();
    } finally {
      user.value = null;
      sessionChecked.value = true;
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    sessionChecked,
    isAuthenticated,
    isAdmin,
    isStudent,
    loginAdmin,
    loginStudent,
    checkSession,
    logout,
  };
});