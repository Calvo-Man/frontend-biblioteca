
<template>
  <div class="student-profile">
    <!-- Encabezado -->
    <div class="page-heading">
      <div>
        <p>Consulta la información de tu cuenta en la biblioteca escolar.</p>
      </div>
    </div>

    <!-- Perfil -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="profile-summary" elevation="0">
          <div class="avatar-container">
            <v-icon icon="mdi-account-school" size="48" />
          </div>

          <h3>{{ user?.username || 'Estudiante' }}</h3>
          <p>Cuenta de estudiante</p>

          <v-chip
            color="success"
            variant="tonal"
            size="small"
            class="mt-3"
          >
            <v-icon start icon="mdi-check-circle-outline" size="15" />
            Sesión activa
          </v-chip>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="information-card" elevation="0">
          <div class="card-heading">
            <div>
              <h3>Información de la cuenta</h3>
              <p>Datos asociados a tu acceso al sistema.</p>
            </div>

            <v-icon
              icon="mdi-account-details-outline"
              color="primary"
              size="26"
            />
          </div>

          <v-divider class="my-4" />

          <div class="information-grid">
            <div class="information-item">
              <span>Nombre de usuario</span>
              <strong>{{ user?.username || 'No disponible' }}</strong>
            </div>

            <div class="information-item">
              <span>ID de usuario</span>
              <strong>{{ user?.id ?? 'No disponible' }}</strong>
            </div>

            <div class="information-item">
              <span>Tipo de cuenta</span>
              <strong>Estudiante</strong>
            </div>

            <div class="information-item">
              <span>Estado de sesión</span>
              <strong class="active-status">
                <v-icon icon="mdi-circle" size="9" />
                Activa
              </strong>
            </div>
          </div>
        </v-card>

        <v-card class="security-card mt-4" elevation="0">
          <div class="security-icon">
            <v-icon icon="mdi-shield-lock-outline" size="25" />
          </div>

          <div>
            <h3>Seguridad de la cuenta</h3>
            <p>
              Tu sesión está protegida mediante autenticación segura.
              La contraseña no se muestra ni se almacena en esta vista.
            </p>
          </div>
        </v-card>

        <v-card class="notice-card mt-4" elevation="0">
          <v-icon
            icon="mdi-information-outline"
            color="primary"
            size="22"
          />

          <p>
            Para actualizar tus datos personales debes comunicarte con
            el administrador de la biblioteca.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

const user = computed(() => authStore.user);
</script>

<style scoped>
.student-profile {
  width: 100%;
}

.page-heading {
  margin-bottom: 22px;
}

.page-heading h2 {
  color: #183b56;
  font-size: 22px;
  font-weight: 800;
}

.page-heading p {
  margin-top: 5px;
  color: #718096;
  font-size: 13px;
}

.profile-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 270px;
  padding: 28px 20px;
  border: 1px solid #e9eef4;
  border-radius: 13px;
  background: white;
  text-align: center;
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  margin-bottom: 17px;
  border-radius: 50%;
  color: #245879;
  background: #edf3f8;
}

.profile-summary h3 {
  max-width: 100%;
  overflow-wrap: anywhere;
  color: #183b56;
  font-size: 18px;
  font-weight: 800;
}

.profile-summary p {
  margin-top: 5px;
  color: #8793a3;
  font-size: 12px;
}

.information-card {
  padding: 23px;
  border: 1px solid #e9eef4;
  border-radius: 13px;
  background: white;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-heading h3 {
  color: #183b56;
  font-size: 16px;
  font-weight: 700;
}

.card-heading p {
  margin-top: 4px;
  color: #8793a3;
  font-size: 12px;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 25px 20px;
}

.information-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.information-item span {
  color: #8793a3;
  font-size: 11px;
}

.information-item strong {
  overflow-wrap: anywhere;
  color: #344256;
  font-size: 13px;
  font-weight: 700;
}

.active-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #25845b !important;
}

.security-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border: 1px solid #e9eef4;
  border-radius: 13px;
  background: white;
}

.security-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #245879;
  background: #edf3f8;
}

.security-card h3 {
  color: #183b56;
  font-size: 13px;
  font-weight: 700;
}

.security-card p {
  margin-top: 5px;
  color: #718096;
  font-size: 12px;
  line-height: 1.6;
}

.notice-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e2eaf2;
  border-radius: 11px;
  background: #f6f9fc;
}

.notice-card p {
  color: #536579;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .page-heading h2 {
    font-size: 20px;
  }

  .information-card {
    padding: 18px;
  }

  .information-grid {
    gap: 20px 12px;
  }

  .security-card {
    padding: 16px;
  }
}

@media (max-width: 360px) {
  .information-grid {
    grid-template-columns: 1fr;
  }
}
</style>
