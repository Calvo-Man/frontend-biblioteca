
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

    <!-- Banner institucional -->
    <v-card class="welcome-card mb-4" rounded="xl" elevation="0">
      <div class="welcome-decoration"></div>

      <div class="welcome-content">
        <div class="welcome-text">
          <div class="institution-label">
            <v-icon icon="mdi-school" size="13" />
            INSTITUCIÓN EDUCATIVA SANTA TERESITA · SAN PELAYO
          </div>

          <h1>Bienvenido, {{ adminName }}</h1>

          <p>
            Sistema Integral de Biblioteca Escolar. Administra los préstamos,
            registra las devoluciones y consulta la disponibilidad del
            material bibliográfico de la institución.
          </p>

          <div class="welcome-actions">
            <v-btn
              color="#F4B323"
              class="primary-action"
              prepend-icon="mdi-book-plus-outline"
              to="/loans"
              elevation="0"
            >
              Registrar préstamo
            </v-btn>

            <v-btn
              variant="outlined"
              color="white"
              prepend-icon="mdi-magnify"
              to="/books"
              class="secondary-action"
            >
              Consultar disponibilidad
            </v-btn>
          </div>

          <div class="current-date">
            <v-icon icon="mdi-calendar-month-outline" size="14" />
            {{ currentDate }}
          </div>
        </div>

        <div class="institution-brand">
          <div class="brand-emblem">
            <v-icon icon="mdi-book-open-page-variant" size="35" />
          </div>

          <strong>INESANTE</strong>
          <span>Virtual y Ciencia</span>
        </div>
      </div>
    </v-card>

    <!-- Estadísticas principales -->
    <div class="section-heading">
      <div>
        <h2>Resumen general</h2>
        <p>Estado actual de la biblioteca escolar</p>
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
        <v-card class="stat-card" rounded="xl" elevation="0">
          <v-card-text class="stat-content">
            <div class="stat-information">
              <span class="stat-title">{{ item.title }}</span>

              <v-skeleton-loader
                v-if="loading && !hasLoaded"
                type="text"
                width="75"
              />

              <strong v-else class="stat-value">
                {{ formatNumber(item.value) }}
              </strong>

              <span class="stat-description">
                {{ item.description }}
              </span>
            </div>

            <div
              class="stat-icon"
              :style="{
                backgroundColor: item.background,
                color: item.color
              }"
            >
              <v-icon :icon="item.icon" size="23" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Circulación e inventario -->
    <div class="section-heading mt-6">
      <div>
        <h2>Actividad de la biblioteca</h2>
        <p>Indicadores de circulación e inventario</p>
      </div>
    </div>

    <v-row dense>
      <!-- Circulación -->
      <v-col cols="12" md="6">
        <v-card class="content-card" rounded="xl" elevation="0">
          <v-card-title class="section-card-title">
            <div class="d-flex align-center ga-2">
              <v-icon color="primary">mdi-book-sync-outline</v-icon>
              Estado de circulación
            </div>

            <v-chip size="small" variant="tonal" color="primary">
              Préstamos
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <div class="circulation-item">
              <div class="circulation-icon active-icon">
                <v-icon>mdi-book-clock-outline</v-icon>
              </div>

              <div class="circulation-info">
                <strong>Préstamos activos</strong>
                <span>Libros actualmente prestados</span>
              </div>

              <strong class="circulation-number">
                {{ formatNumber(statistics.active_loans) }}
              </strong>
            </div>

            <v-divider class="my-3" />

            <div class="circulation-item">
              <div class="circulation-icon overdue-icon">
                <v-icon>mdi-alert-circle-outline</v-icon>
              </div>

              <div class="circulation-info">
                <strong>Préstamos vencidos</strong>
                <span>Requieren seguimiento</span>
              </div>

              <strong class="circulation-number text-error">
                {{ formatNumber(statistics.overdue_loans) }}
              </strong>
            </div>

            <v-divider class="my-3" />

            <div class="circulation-item">
              <div class="circulation-icon returned-icon">
                <v-icon>mdi-check-circle-outline</v-icon>
              </div>

              <div class="circulation-info">
                <strong>Préstamos devueltos</strong>
                <span>Total de préstamos completados</span>
              </div>

              <strong class="circulation-number text-success">
                {{ formatNumber(returnedLoans) }}
              </strong>
            </div>

            <v-btn
              block
              variant="tonal"
              color="primary"
              class="mt-4"
              to="/loans"
              rounded="lg"
            >
              Consultar préstamos
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Inventario -->
      <v-col cols="12" md="6">
        <v-card class="content-card" rounded="xl" elevation="0">
          <v-card-title class="section-card-title">
            <div class="d-flex align-center ga-2">
              <v-icon color="primary">mdi-bookshelf</v-icon>
              Estado del inventario
            </div>

            <v-chip size="small" variant="tonal" color="success">
              Ejemplares
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <div class="inventory-total">
              <div>
                <span class="text-caption text-medium-emphasis">
                  Total de ejemplares
                </span>

                <div class="inventory-number">
                  {{ formatNumber(statistics.total_copies) }}
                </div>
              </div>

              <div class="inventory-main-icon">
                <v-icon size="30">mdi-book-multiple-outline</v-icon>
              </div>
            </div>

            <div class="inventory-progress">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 font-weight-medium">
                  Disponibilidad
                </span>

                <strong class="text-body-2">
                  {{ availabilityPercentage }}%
                </strong>
              </div>

              <v-progress-linear
                :model-value="availabilityPercentage"
                color="success"
                bg-color="grey-lighten-3"
                height="9"
                rounded
              />
            </div>

            <div class="inventory-breakdown">
              <div class="inventory-legend">
                <span class="legend-dot available-dot"></span>
                <div>
                  <strong>
                    {{ formatNumber(statistics.available_copies) }}
                  </strong>
                  <span>Disponibles</span>
                </div>
              </div>

              <div class="inventory-legend">
                <span class="legend-dot loaned-dot"></span>
                <div>
                  <strong>
                    {{ formatNumber(statistics.loaned_copies) }}
                  </strong>
                  <span>Prestados</span>
                </div>
              </div>
            </div>

            <v-btn
              block
              variant="tonal"
              color="primary"
              class="mt-4"
              to="/copies"
              rounded="lg"
            >
              Gestionar ejemplares
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Últimos préstamos -->
    <div class="section-heading mt-6">
      <div>
        <h2>Últimos préstamos</h2>
        <p>Movimientos recientes registrados en la biblioteca</p>
      </div>

      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="mdi-format-list-bulleted"
        to="/loans"
      >
        Ver todos
      </v-btn>
    </div>

    <v-card class="content-card recent-loans-card" rounded="xl" elevation="0">
      <div v-if="loading && !hasLoaded" class="pa-4">
        <v-skeleton-loader
          v-for="n in 4"
          :key="n"
          type="list-item-two-line"
        />
      </div>

      <div
        v-else-if="recentLoans.length === 0"
        class="empty-state"
      >
        <v-icon size="42" color="grey-lighten-1">
          mdi-book-open-page-variant-outline
        </v-icon>

        <strong>No hay préstamos recientes</strong>

        <span>
          Cuando se registren préstamos, aparecerán aquí.
        </span>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          to="/loans"
          rounded="lg"
          class="mt-2"
        >
          Registrar préstamo
        </v-btn>
      </div>

      <v-table v-else class="recent-loans-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Libro</th>
            <th>Fecha de préstamo</th>
            <th>Vencimiento</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="loan in recentLoans"
            :key="loan.id"
          >
            <td>
              <div class="student-cell">
                <v-avatar size="34" color="primary" variant="tonal">
                  <v-icon size="18">mdi-account-outline</v-icon>
                </v-avatar>

                <div>
                  <strong>
                    {{ loan.student?.full_name || 'Sin información' }}
                  </strong>

                  <span>
                    {{ loan.student?.document_number || 'Sin documento' }}
                  </span>
                </div>
              </div>
            </td>

            <td>
              <div class="book-cell">
                <strong>
                  {{ loan.copy?.book?.title || 'Libro no disponible' }}
                </strong>

                <span>
                  Ejemplar: {{ loan.copy?.copy_code || 'N/A' }}
                </span>
              </div>
            </td>

            <td>
              {{ formatDate(loan.loan_date) }}
            </td>

            <td>
              <div>
                {{ formatDate(loan.due_date) }}

                <div
                  v-if="loan.status === 'ACTIVE' && isOverdue(loan.due_date)"
                  class="text-caption text-error font-weight-medium"
                >
                  Vencido
                </div>
              </div>
            </td>

            <td>
              <v-chip
                size="small"
                variant="tonal"
                :color="getLoanStatusColor(loan)"
              >
                {{ getLoanStatusLabel(loan) }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Accesos rápidos -->
    <div class="section-heading mt-6">
      <div>
        <h2>Accesos rápidos</h2>
        <p>Funciones principales del sistema</p>
      </div>
    </div>

    <v-row dense>
      <v-col
        v-for="action in quickActions"
        :key="action.title"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          class="quick-action-card"
          rounded="xl"
          elevation="0"
          :to="action.to"
        >
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <div
              class="quick-action-icon"
              :style="{
                backgroundColor: action.background,
                color: action.color
              }"
            >
              <v-icon :icon="action.icon" size="23" />
            </div>

            <div class="quick-action-info">
              <strong>{{ action.title }}</strong>
              <span>{{ action.description }}</span>
            </div>

            <v-spacer />

            <v-icon color="grey-lighten-1" size="19">
              mdi-chevron-right
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pie del dashboard -->
    <div v-if="loading && hasLoaded" class="refresh-indicator">
      <v-progress-linear
        indeterminate
        color="primary"
        height="2"
      />
    </div>

    <div class="dashboard-footer">
      <span>
        <v-icon icon="mdi-shield-check-outline" size="15" />
        Sistema de Gestión de Biblioteca Escolar
      </span>

      <v-btn
        icon="mdi-refresh"
        variant="text"
        color="primary"
        size="small"
        title="Actualizar información"
        :loading="loading"
        @click="loadDashboard"
      />
    </div>
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

const recentLoans = ref([]);

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

const adminName = computed(() => {
  return authStore.user?.full_name ||
    authStore.user?.username ||
    'Administrador';
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const returnedLoans = computed(() => {
  return Math.max(
    0,
    Number(statistics.value.total_loans || 0) -
    Number(statistics.value.active_loans || 0),
  );
});

const availabilityPercentage = computed(() => {
  const totalCopies = Number(statistics.value.total_copies || 0);

  if (!totalCopies) return 0;

  const available = Number(statistics.value.available_copies || 0);

  return Math.min(100, Math.round((available / totalCopies) * 100));
});

const statisticCards = computed(() => [
  {
    title: 'LIBROS TOTALES',
    value: statistics.value.total_books,
    description: `${formatNumber(statistics.value.total_copies)} ejemplares registrados`,
    icon: 'mdi-book-open-page-variant',
    color: '#1765A0',
    background: '#EAF3FC',
  },
  {
    title: 'PRÉSTAMOS ACTIVOS',
    value: statistics.value.active_loans,
    description: `${formatNumber(statistics.value.overdue_loans)} con retraso por revisar`,
    icon: 'mdi-book-clock-outline',
    color: '#B17B19',
    background: '#FFF4D9',
  },
  {
    title: 'ESTUDIANTES REGISTRADOS',
    value: statistics.value.total_students,
    description: 'Estudiantes registrados en el sistema',
    icon: 'mdi-account-group-outline',
    color: '#64748B',
    background: '#EDF1F7',
  },
  {
    title: 'LIBROS DISPONIBLES',
    value: statistics.value.available_copies,
    description: 'Ejemplares listos para préstamo',
    icon: 'mdi-book-check-outline',
    color: '#26966B',
    background: '#E8F7EF',
  },
]);

const quickActions = [
  {
    title: 'Registrar préstamo',
    description: 'Entregar un ejemplar',
    icon: 'mdi-book-plus-outline',
    to: '/loans',
    color: '#1765A0',
    background: '#EAF3FC',
  },
  {
    title: 'Devoluciones',
    description: 'Gestionar devoluciones',
    icon: 'mdi-book-return-outline',
    to: '/returns',
    color: '#26966B',
    background: '#E8F7EF',
  },
  {
    title: 'Consultar libros',
    description: 'Buscar material bibliográfico',
    icon: 'mdi-bookshelf',
    to: '/books',
    color: '#B17B19',
    background: '#FFF4D9',
  },
  {
    title: 'Estudiantes',
    description: 'Consultar estudiantes',
    icon: 'mdi-account-group-outline',
    to: '/students',
    color: '#64748B',
    background: '#EDF1F7',
  },
];

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const data = await dashboardService.getOverview();

    statistics.value = {
      ...statistics.value,
      ...(data?.statistics || {}),
    };

    recentLoans.value = Array.isArray(data?.recent_loans)
      ? data.recent_loans
      : [];
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

  const parsedDate = new Date(`${String(date).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function isOverdue(dueDate) {
  if (!dueDate) return false;

  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(due.getTime()) && due < today;
}

function getLoanStatusColor(loan) {
  if (loan.status === 'RETURNED') return 'success';

  return isOverdue(loan.due_date) ? 'error' : 'warning';
}

function getLoanStatusLabel(loan) {
  if (loan.status === 'RETURNED') return 'Devuelto';

  return isOverdue(loan.due_date) ? 'Vencido' : 'Activo';
}

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.page-container {
  width: 100%;
}

/* Banner institucional */
.welcome-card {
  position: relative;
  overflow: hidden;
  min-height: 192px;
  background: linear-gradient(112deg, #07518b 0%, #0863a5 55%, #164f80 100%);
}

.welcome-decoration {
  position: absolute;
  top: -95px;
  right: -55px;
  width: 260px;
  height: 260px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.035);
}

.welcome-decoration::after {
  content: '';
  position: absolute;
  inset: 25px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

.welcome-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  min-height: 192px;
  padding: 23px 25px;
}

.welcome-text {
  max-width: 650px;
}

.institution-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 20px;
  color: #263648;
  background: #F4B323;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.welcome-text h1 {
  margin-top: 12px;
  color: white;
  font-size: 25px;
  font-weight: 750;
  letter-spacing: -0.8px;
  line-height: 1.2;
}

.welcome-text p {
  max-width: 540px;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.6;
}

.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 16px;
}

.primary-action {
  color: #25364a !important;
  font-size: 11px;
  font-weight: 700;
}

.secondary-action {
  border-color: rgba(255, 255, 255, 0.35);
  color: white !important;
  font-size: 11px;
}

.current-date {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 13px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 10px;
  text-transform: capitalize;
}

.institution-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 105px;
  min-height: 125px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.09);
  color: white;
}

.brand-emblem {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin-bottom: 8px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: linear-gradient(145deg, #1475c1, #064477);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
}

.institution-brand strong {
  font-size: 11px;
  letter-spacing: 0.7px;
}

.institution-brand span {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 8px;
}

/* Encabezados de sección */
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 13px;
}

.section-heading h2 {
  color: rgb(var(--v-theme-on-surface));
  font-size: 16px;
  font-weight: 750;
}

.section-heading p {
  margin-top: 3px;
  color: #929ba6;
  font-size: 11px;
}

/* Estadísticas */
.statistics-grid {
  margin-top: 2px;
}

.stat-card {
  height: 100%;
  min-height: 110px;
  border: 1px solid #e9edf2;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(18, 59, 93, 0.07);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 110px;
  padding: 17px 16px;
}

.stat-information {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-title {
  color: #929ba6;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.45px;
}

.stat-value {
  margin-top: 5px;
  color: #19232e;
  font-size: 27px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.8px;
}

.stat-description {
  margin-top: 6px;
  color: #98a1ab;
  font-size: 9px;
  line-height: 1.4;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 11px;
}

/* Tarjetas de contenido */
.content-card {
  height: 100%;
  border: 1px solid #e9edf2;
  background: #fff;
}

.section-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 18px;
  font-size: 14px;
  font-weight: 700;
}

.circulation-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.circulation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
}

.active-icon {
  color: #1765A0;
  background: #EAF3FC;
}

.overdue-icon {
  color: #c44545;
  background: #FCECEC;
}

.returned-icon {
  color: #26966B;
  background: #E8F7EF;
}

.circulation-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.circulation-info strong {
  font-size: 12px;
  font-weight: 650;
}

.circulation-info span {
  margin-top: 3px;
  color: #929ba6;
  font-size: 10px;
}

.circulation-number {
  font-size: 20px;
  font-weight: 800;
}

/* Inventario */
.inventory-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inventory-number {
  margin-top: 3px;
  color: #19232e;
  font-size: 29px;
  font-weight: 800;
}

.inventory-main-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #EAF3FC;
  color: #1765A0;
}

.inventory-progress {
  margin-top: 23px;
}

.inventory-breakdown {
  display: flex;
  gap: 30px;
  margin-top: 22px;
}

.inventory-legend {
  display: flex;
  align-items: center;
  gap: 9px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.available-dot {
  background: #26966B;
}

.loaned-dot {
  background: #B17B19;
}

.inventory-legend div {
  display: flex;
  flex-direction: column;
}

.inventory-legend strong {
  font-size: 14px;
}

.inventory-legend span:last-child {
  color: #929ba6;
  font-size: 10px;
}

/* Últimos préstamos */
.recent-loans-card {
  overflow: hidden;
}

.recent-loans-table {
  min-width: 750px;
}

.recent-loans-table :deep(th) {
  height: 48px !important;
  color: #929ba6 !important;
  font-size: 10px !important;
  font-weight: 750 !important;
  white-space: nowrap;
  text-transform: uppercase;
}

.recent-loans-table :deep(td) {
  height: 65px !important;
  font-size: 11px;
}

.recent-loans-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.035);
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}

.student-cell div,
.book-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.student-cell strong,
.book-cell strong {
  max-width: 200px;
  overflow: hidden;
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-cell span,
.book-cell span {
  color: #929ba6;
  font-size: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 220px;
  padding: 25px;
  text-align: center;
}

.empty-state strong {
  font-size: 13px;
}

.empty-state span {
  color: #929ba6;
  font-size: 11px;
}

/* Accesos rápidos */
.quick-action-card {
  height: 100%;
  border: 1px solid #e9edf2;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(18, 59, 93, 0.07);
}

.quick-action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 11px;
}

.quick-action-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.quick-action-info strong {
  font-size: 12px;
  font-weight: 700;
}

.quick-action-info span {
  color: #929ba6;
  font-size: 10px;
}

/* Pie */
.refresh-indicator {
  margin-top: 12px;
}

.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  color: #98a1ab;
  font-size: 10px;
}

.dashboard-footer span {
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 700px) {
  .welcome-content {
    padding: 20px;
  }

  .welcome-text h1 {
    font-size: 20px;
  }

  .institution-brand {
    width: 82px;
    min-height: 105px;
    padding: 8px;
  }

  .brand-emblem {
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 600px) {
  .section-heading {
    align-items: flex-start;
  }

  .section-heading h2 {
    font-size: 15px;
  }

  .inventory-breakdown {
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .welcome-content {
    align-items: flex-start;
  }

  .institution-brand {
    display: none;
  }

  .welcome-text h1 {
    font-size: 19px;
  }

  .institution-label {
    font-size: 8px;
  }

  .welcome-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .welcome-actions :deep(.v-btn) {
    width: 100%;
  }

  .stat-content {
    min-height: 90px;
    padding: 13px;
  }

  .stat-value {
    font-size: 24px;
  }

  .circulation-number {
    font-size: 18px;
  }

  .dashboard-footer {
    gap: 8px;
  }
}
</style>
