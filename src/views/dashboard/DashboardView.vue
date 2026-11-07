
<template>
  <div class="page-container">
    <!-- Error -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-4"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- Bienvenida -->
    <v-card class="welcome-card mb-5" rounded="lg" elevation="0">
      <v-card-text class="welcome-content">
        <div class="welcome-text">
          <span class="welcome-eyebrow">
            SISTEMA DE BIBLIOTECA ESCOLAR
          </span>

          <h2>
            ¡Bienvenido, {{ adminName }}!
          </h2>

          <p>
            Aquí tienes un resumen del estado actual de la biblioteca.
          </p>
        </div>

        <div class="welcome-icon">
          <v-icon icon="mdi-bookshelf" size="30" />
        </div>
      </v-card-text>
    </v-card>

    <!-- Estadísticas -->
    <div class="section-heading">
      <div>
        <h2>Resumen de la biblioteca</h2>
        <p>Indicadores generales del sistema</p>
      </div>
    </div>

    <v-row dense class="statistics-grid">
      <v-col
        v-for="item in statisticCards"
        :key="item.title"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card class="stat-card" rounded="lg" elevation="0">
          <v-card-text class="stat-content">
            <div class="stat-information">
              <span class="stat-title">{{ item.title }}</span>

              <template v-if="loading && !hasLoaded">
                <v-skeleton-loader
                  type="text"
                  width="85"
                  class="stat-skeleton"
                />
              </template>

              <strong v-else class="stat-value">
                {{ formatNumber(item.value) }}
              </strong>
            </div>

            <div
              class="stat-icon"
              :style="{
                backgroundColor: `${item.color}15`,
                color: item.color
              }"
            >
              <v-icon :icon="item.icon" size="23" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Préstamos recientes -->
    <div class="section-heading loans-heading">
      <div>
        <h2>Préstamos recientes</h2>
        <p>Últimos movimientos registrados en el sistema</p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        size="small"
        append-icon="mdi-arrow-right"
        to="/loans"
        class="view-all-button"
      >
        Ver préstamos
      </v-btn>
    </div>

    <v-card class="loans-card" rounded="lg" elevation="0">
      <v-progress-linear
        v-if="loading && hasLoaded"
        indeterminate
        color="primary"
        height="2"
      />

      <div v-if="loading && !hasLoaded" class="loading-table">
        <v-skeleton-loader
          v-for="n in 4"
          :key="n"
          type="list-item-two-line"
          class="loading-row"
        />
      </div>

      <div
        v-else-if="recentLoans.length"
        class="table-container"
      >
        <v-table class="loans-table" density="comfortable">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Libro</th>
              <th>Fecha de préstamo</th>
              <th>Fecha de entrega</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="loan in recentLoans"
              :key="loan.id"
            >
              <td>
                <div class="table-primary">
                  {{ loan.student?.full_name || 'Sin nombre' }}
                </div>

                <div class="table-secondary">
                  {{ loan.student?.document_number || 'Sin documento' }}
                </div>
              </td>

              <td>
                <div class="table-primary book-title">
                  {{ loan.copy?.book?.title || 'Libro no disponible' }}
                </div>

                <div class="table-secondary">
                  Código: {{ loan.copy?.copy_code || 'N/A' }}
                </div>
              </td>

              <td class="date-cell">
                {{ formatDate(loan.loan_date) }}
              </td>

              <td>
                <span
                  :class="{
                    'overdue-date': isOverdue(loan)
                  }"
                >
                  {{ formatDate(loan.due_date) }}
                </span>
              </td>

              <td>
                <v-chip
                  size="small"
                  :color="getLoanStatusColor(loan)"
                  variant="tonal"
                  class="status-chip"
                >
                  <v-icon
                    :icon="getLoanStatusIcon(loan)"
                    size="13"
                    start
                  />
                  {{ getLoanStatusLabel(loan) }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div
        v-else
        class="empty-state"
      >
        <div class="empty-icon">
          <v-icon
            icon="mdi-book-open-page-variant-outline"
            size="27"
          />
        </div>

        <strong>No hay préstamos registrados</strong>

        <p>
          Cuando se registren préstamos, aparecerán aquí.
        </p>

        <v-btn
          to="/loans"
          color="primary"
          variant="tonal"
          size="small"
          class="mt-3"
        >
          Ir a préstamos
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { dashboardService } from '../../services/dashboard';

const authStore = useAuthStore();

const loading = ref(false);
const hasLoaded = ref(false);
const errorMessage = ref('');

const statistics = ref({
  total_books: 0,
  total_copies: 0,
  available_copies: 0,
  loaned_copies: 0,
  total_students: 0,
  total_loans: 0,
  active_loans: 0,
  overdue_loans: 0,
});

const recentLoans = ref([]);

const adminName = computed(() => {
  return authStore.user?.username || 'Administrador';
});

const statisticCards = computed(() => [
  {
    title: 'Libros registrados',
    value: statistics.value.total_books,
    icon: 'mdi-book-multiple',
    color: '#2563EB',
  },
  {
    title: 'Total de ejemplares',
    value: statistics.value.total_copies,
    icon: 'mdi-bookshelf',
    color: '#7C3AED',
  },
  {
    title: 'Ejemplares disponibles',
    value: statistics.value.available_copies,
    icon: 'mdi-book-check',
    color: '#16A36A',
  },
  {
    title: 'Ejemplares prestados',
    value: statistics.value.loaned_copies,
    icon: 'mdi-book-arrow-right',
    color: '#D97706',
  },
  {
    title: 'Estudiantes registrados',
    value: statistics.value.total_students,
    icon: 'mdi-account-group',
    color: '#0891B2',
  },
  {
    title: 'Préstamos registrados',
    value: statistics.value.total_loans,
    icon: 'mdi-clipboard-list',
    color: '#6366F1',
  },
  {
    title: 'Préstamos activos',
    value: statistics.value.active_loans,
    icon: 'mdi-book-clock',
    color: '#0D9488',
  },
  {
    title: 'Préstamos vencidos',
    value: statistics.value.overdue_loans,
    icon: 'mdi-alert-circle',
    color: '#DC4545',
  },
]);

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const data = await dashboardService.getOverview();

    statistics.value = {
      ...statistics.value,
      ...(data.statistics || {}),
    };

    recentLoans.value = data.recent_loans || [];
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);

    errorMessage.value =
      error.response?.data?.message ||
      'No fue posible cargar la información del panel.';
  } finally {
    loading.value = false;
    hasLoaded.value = true;
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('es-CO');
}

function formatDate(date) {
  if (!date) return 'N/A';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'N/A';

  return parsedDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isOverdue(loan) {
  if (loan.status !== 'ACTIVE' || !loan.due_date) return false;

  const dueDate = new Date(loan.due_date);
  dueDate.setHours(23, 59, 59, 999);

  return dueDate < new Date();
}

function getLoanStatusLabel(loan) {
  if (loan.status === 'RETURNED') return 'Devuelto';
  if (isOverdue(loan)) return 'Vencido';

  return 'Activo';
}

function getLoanStatusColor(loan) {
  if (loan.status === 'RETURNED') return 'success';
  if (isOverdue(loan)) return 'error';

  return 'info';
}

function getLoanStatusIcon(loan) {
  if (loan.status === 'RETURNED') return 'mdi-check-circle-outline';
  if (isOverdue(loan)) return 'mdi-alert-circle-outline';

  return 'mdi-clock-outline';
}

onMounted(loadDashboard);
</script>

<style scoped>
.page-container {
  width: 100%;
}

/* Bienvenida */
.welcome-card {
  overflow: hidden;
  background: linear-gradient(110deg, #123b5d 0%, #1d5278 100%);
}

.welcome-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 25px;
}

.welcome-eyebrow {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.1px;
}

.welcome-text h2 {
  margin-top: 5px;
  color: white;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.welcome-text p {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  color: #123b5d;
  background: #ffffff;
}

/* Encabezados de sección */
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-heading h2 {
  color: #263648;
  font-size: 14px;
  font-weight: 700;
}

.section-heading p {
  margin-top: 3px;
  color: #8995a3;
  font-size: 11px;
}

.statistics-grid {
  margin-bottom: 5px;
}

/* Estadísticas */
.stat-card {
  height: 100%;
  border: 1px solid #e9edf2;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(18, 59, 93, 0.07);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 91px;
  padding: 15px 16px;
}

.stat-information {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.stat-title {
  color: #7b8795;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
}

.stat-value {
  color: #263648;
  font-size: 25px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.7px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 11px;
}

.stat-skeleton {
  width: 85px;
}

/* Préstamos */
.loans-heading {
  margin-top: 25px;
}

.view-all-button {
  flex-shrink: 0;
}

.loans-card {
  overflow: hidden;
  border: 1px solid #e9edf2;
  background: white;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.loans-table {
  min-width: 760px;
}

.loans-table :deep(th) {
  height: 43px !important;
  color: #7b8795 !important;
  background: #f8fafc;
  font-size: 10px !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.loans-table :deep(td) {
  height: 59px !important;
  color: #526173;
  font-size: 11px;
}

.loans-table :deep(tbody tr:hover) {
  background: #f8fafc;
}

.table-primary {
  max-width: 230px;
  overflow: hidden;
  color: #263648;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-secondary {
  margin-top: 3px;
  color: #8995a3;
  font-size: 10px;
}

.book-title {
  max-width: 220px;
}

.date-cell {
  white-space: nowrap;
}

.overdue-date {
  color: #dc4545;
  font-weight: 700;
}

.status-chip {
  font-size: 10px;
  font-weight: 600;
}

/* Carga y estado vacío */
.loading-table {
  padding: 8px 16px;
}

.loading-row {
  border-bottom: 1px solid #f0f2f5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 35px 20px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 12px;
  border-radius: 14px;
  color: #8192a5;
  background: #f1f5f9;
}

.empty-state strong {
  color: #334155;
  font-size: 12px;
}

.empty-state p {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 11px;
}

@media (max-width: 600px) {
  .welcome-content {
    padding: 18px;
  }

  .welcome-text h2 {
    font-size: 18px;
  }

  .welcome-text p {
    max-width: 230px;
    line-height: 1.5;
  }

  .welcome-icon {
    width: 43px;
    height: 43px;
  }

  .stat-content {
    min-height: 78px;
    padding: 12px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-icon {
    width: 37px;
    height: 37px;
  }

  .loans-heading {
    align-items: flex-end;
  }

  .view-all-button {
    font-size: 10px;
  }
}
</style>
