```vue
<template>
  <div class="login-page">
    <div class="login-background">
      <div class="background-circle circle-one"></div>
      <div class="background-circle circle-two"></div>
      <div class="background-grid"></div>
    </div>

    <v-container class="login-container">
      <v-card class="login-card" elevation="0">
        <div class="login-header">
          <div class="logo-container">
            <v-icon icon="mdi-book-open-page-variant" size="34" />
          </div>

          <h1>Biblioteca Escolar</h1>

          <p class="institution-subtitle">
            Sistema de Gestión Bibliotecaria
          </p>
        </div>

        <v-divider class="section-divider" />

        <div class="login-content">
          <h2>Bienvenido</h2>

          <p class="login-description">
            Selecciona tu tipo de acceso e ingresa tus credenciales.
          </p>

          <!-- Tipo de usuario -->
          <div class="access-selector">
            <button
              type="button"
              class="access-option"
              :class="{ 'access-option-active': userType === 'ADMIN' }"
              :disabled="authStore.loading"
              @click="changeUserType('ADMIN')"
            >
              <v-icon icon="mdi-shield-account-outline" size="20" />
              <span>Administrador</span>
            </button>

            <button
              type="button"
              class="access-option"
              :class="{ 'access-option-active': userType === 'STUDENT' }"
              :disabled="authStore.loading"
              @click="changeUserType('STUDENT')"
            >
              <v-icon icon="mdi-account-school-outline" size="20" />
              <span>Estudiante</span>
            </button>
          </div>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <form @submit.prevent="handleLogin">
            <div class="form-field">
              <label class="field-label">Usuario</label>

              <v-text-field
                v-model="form.username"
                :placeholder="userType === 'ADMIN'
                  ? 'Ingresa tu usuario de administrador'
                  : 'Ingresa tu usuario de estudiante'"
                prepend-inner-icon="mdi-account-outline"
                autocomplete="username"
                :disabled="authStore.loading"
                required
                hide-details="auto"
              />
            </div>

            <div class="form-field">
              <label class="field-label">Contraseña</label>

              <v-text-field
                v-model="form.password"
                placeholder="Ingresa tu contraseña"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :disabled="authStore.loading"
                @click:append-inner="showPassword = !showPassword"
                required
                hide-details="auto"
              />
            </div>

            <v-btn
              type="submit"
              color="accent"
              block
              size="large"
              class="login-button"
              :loading="authStore.loading"
              :disabled="!form.username.trim() || !form.password"
            >
              Iniciar sesión
              <v-icon end icon="mdi-arrow-right" />
            </v-btn>
          </form>
        </div>

        <div class="login-footer">
          <v-icon icon="mdi-shield-check-outline" size="15" />
          <span>Acceso seguro al sistema bibliotecario</span>
        </div>
      </v-card>

      <p class="copyright">
        Sistema de Gestión de Biblioteca Escolar
      </p>
    </v-container>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const userType = ref('ADMIN');

const form = reactive({
  username: '',
  password: '',
});

const showPassword = ref(false);
const errorMessage = ref('');

function changeUserType(type) {
  userType.value = type;
  errorMessage.value = '';
  form.username = '';
  form.password = '';
  showPassword.value = false;
}

async function handleLogin() {
  errorMessage.value = '';

  const credentials = {
    username: form.username.trim(),
    password: form.password,
  };

  try {
    if (userType.value === 'ADMIN') {
      await authStore.loginAdmin(credentials);
      await router.replace('/dashboard');
    } else {
      await authStore.loginStudent(credentials);
      await router.replace('/student/dashboard');
    }
  } catch (error) {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      errorMessage.value = 'Usuario o contraseña incorrectos.';
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        'No fue posible iniciar sesión. Verifica la conexión con el servidor.';
    }
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #0b263d, #123b5d 55%, #1d5278);
}

.login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-circle {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

.circle-one {
  width: 600px;
  height: 600px;
  top: -280px;
  right: -150px;
}

.circle-two {
  width: 800px;
  height: 800px;
  bottom: -500px;
  left: -200px;
}

.background-grid {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 45px 45px;
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  padding: 0;
}

.login-card {
  width: 100%;
  padding: 28px 32px 22px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.2);
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  margin-bottom: 12px;
  border-radius: 17px;
  color: #123b5d;
  background: #eef3f8;
}

.login-header h1 {
  color: #123b5d;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.3;
}

.institution-subtitle {
  margin-top: 4px;
  color: #718096;
  font-size: 12px;
}

.section-divider {
  margin: 19px 0;
}

.login-content h2 {
  color: #1b2533;
  font-size: 20px;
  font-weight: 700;
}

.login-description {
  margin: 5px 0 16px;
  color: #718096;
  font-size: 12px;
  line-height: 1.5;
}

/* Selector de acceso */
.access-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 5px;
  margin-bottom: 18px;
  border-radius: 11px;
  background: #f1f4f8;
}

.access-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 43px;
  padding: 8px 5px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #718096;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.access-option:hover:not(:disabled) {
  color: #123b5d;
}

.access-option-active {
  color: #123b5d;
  background: white;
  border-color: #e2e9f0;
  box-shadow: 0 2px 6px rgba(18, 59, 93, 0.08);
}

.access-option:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-field {
  margin-bottom: 12px;
}

.field-label {
  display: block;
  margin-bottom: 5px;
  color: #344256;
  font-size: 12px;
  font-weight: 600;
}

.login-button {
  min-height: 46px;
  margin-top: 5px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
}

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  color: #718096;
  font-size: 10px;
}

.copyright {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 10px;
  text-align: center;
}

@media (max-width: 500px) {
  .login-page {
    padding: 18px 14px;
  }

  .login-card {
    padding: 24px 22px 20px;
    border-radius: 16px;
  }

  .logo-container {
    width: 56px;
    height: 56px;
    margin-bottom: 10px;
  }

  .login-header h1 {
    font-size: 20px;
  }

  .section-divider {
    margin: 16px 0;
  }
}

/* Pantallas con poca altura */
@media (max-height: 650px) {
  .login-page {
    align-items: flex-start;
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .login-card {
    padding-top: 18px;
    padding-bottom: 16px;
  }

  .logo-container {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
  }

  .section-divider {
    margin: 12px 0;
  }

  .login-description {
    margin-bottom: 12px;
  }

  .access-selector {
    margin-bottom: 12px;
  }

  .form-field {
    margin-bottom: 8px;
  }

  .login-footer {
    margin-top: 12px;
  }

  .copyright {
    margin-top: 10px;
  }
}
</style>
```