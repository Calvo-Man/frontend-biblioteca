
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
      <div>
        <p class="text-body-2 text-medium-emphasis">
          Indicadores y estadísticas generales de la biblioteca.
        </p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadReports"
      >
        Actualizar reportes
      </v-btn>
    </div>

    <!-- Indicadores generales -->
    <div class="section-heading mb-3">
      <h3 class="text-subtitle-1 font-weight-bold">
        Resumen general
      </h3>
    </div>

    <v-row class="mb-5">
      <v-col
        v-for="stat in statistics"
        :key="stat.key"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card rounded="lg" elevation="0" border class="stat-card">
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar :color="stat.color" variant="tonal" size="46">
              <v-icon :icon="stat.icon" />
            </v-avatar>

            <div class="min-width-0">
              <div class="text-caption text-medium-emphasis">
                {{ stat.label }}
              </div>
              <div class="text-h5 font-weight-bold">
                {{ formatNumber(summary[stat.key]) }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Distribución de ejemplares -->
    <div class="section-heading mb-3">
      <h3 class="text-subtitle-1 font-weight-bold">
        Estado de los ejemplares
      </h3>
    </div>

    <v-row class="mb-5">
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border class="h-100">
          <v-card-title class="text-subtitle-1 font-weight-bold pa-5">
            Disponibilidad
          </v-card-title>

          <v-card-text class="px-5 pb-5">
            <div class="d-flex justify-center mb-5">
              <div class="availability-chart">
                <v-progress-circular
                  :model-value="availabilityPercentage"
                  :size="170"
                  :width="15"
                  color="primary"
                  bg-color="surface-variant"
                >
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold">
                      {{ availabilityPercentage }}%
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Disponibles
                    </div>
                  </div>
                </v-progress-circular>
              </div>
            </div>

            <div class="d-flex justify-space-between align-center mb-3">
              <div class="d-flex align-center ga-2">
                <span class="legend-dot primary-dot" />
                <span class="text-body-2">Disponibles</span>
              </div>
              <strong>{{ formatNumber(summary.available_copies) }}</strong>
            </div>

            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center ga-2">
                <span class="legend-dot warning-dot" />
                <span class="text-body-2">Prestados</span>
              </div>
              <strong>{{ formatNumber(summary.loaned_copies) }}</strong>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex justify-space-between">
              <span class="text-body-2 text-medium-emphasis">
                Total de ejemplares
              </span>
              <strong>{{ formatNumber(summary.total_copies) }}</strong>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="0" border class="h-100">
          <v-card-title class="text-subtitle-1 font-weight-bold pa-5">
            Estado de los préstamos
          </v-card-title>

          <v-card-text class="px-5 pb-5">
            <div class="mb-5">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Activos</span>
                <strong>{{ formatNumber(summary.active_loans) }}</strong>
              </div>

              <v-progress-linear
                :model-value="activeLoanPercentage"
                color="warning"
                height="12"
                rounded
              />
            </div>

            <div class="mb-5">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Devueltos</span>
                <strong>{{ formatNumber(returnedLoanCount) }}</strong>
              </div>

              <v-progress-linear
                :model-value="returnedLoanPercentage"
                color="success"
                height="12"
                rounded
              />
            </div>

            <div class="mb-5">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Vencidos</span>
                <strong>{{ formatNumber(summary.overdue_loans) }}</strong>
              </div>

              <v-progress-linear
                :model-value="overdueLoanPercentage"
                color="error"
                height="12"
                rounded
              />
            </div>

            <v-divider class="my-4" />

            <div class="d-flex justify-space-between">
              <span class="text-body-2 text-medium-emphasis">
                Total de préstamos
              </span>
              <strong>{{ formatNumber(summary.total_loans) }}</strong>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Libros más prestados -->
    <div class="section-heading d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
      <h3 class="text-subtitle-1 font-weight-bold">
        Libros más prestados
      </h3>

      <v-chip size="small" color="primary" variant="tonal">
        Top 10
      </v-chip>
    </div>

    <v-card rounded="lg" elevation="0" border class="mb-5">
      <v-card-text class="pa-5">
        <div
          v-if="!mostBorrowed.length && !loading"
          class="empty-state"
        >
          <v-icon
            icon="mdi-chart-bar"
            size="40"
            color="medium-emphasis"
          />
          <p class="text-body-2 text-medium-emphasis mt-2">
            Todavía no hay datos de préstamos por libro.
          </p>
        </div>

        <div v-else>
          <div
            v-for="(book, index) in mostBorrowed"
            :key="book.book_id"
            class="book-ranking"
          >
            <div class="d-flex align-center ga-3 mb-2">
              <v-avatar
                size="30"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption font-weight-bold">
                  {{ index + 1 }}
                </span>
              </v-avatar>

              <div class="flex-grow-1 min-width-0">
                <div class="font-weight-medium text-body-2 text-truncate">
                  {{ book.title }}
                </div>
              </div>

              <div class="text-body-2 font-weight-bold">
                {{ formatNumber(book.total_loans) }}
              </div>
            </div>

            <v-progress-linear
              :model-value="getBookPercentage(book.total_loans)"
              color="primary"
              height="7"
              rounded
              class="mb-4"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Préstamos vencidos -->
    <div class="section-heading d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
      <div>
        <h3 class="text-subtitle-1 font-weight-bold">
          Préstamos vencidos
        </h3>
        <p class="text-caption text-medium-emphasis">
          Préstamos activos cuya fecha límite ya pasó.
        </p>
      </div>

      <v-chip color="error" variant="tonal" size="small">
        {{ overdueLoans.length }} vencidos
      </v-chip>
    </div>

    <v-card rounded="lg" elevation="0" border>
      <v-data-table
        :headers="overdueHeaders"
        :items="overdueLoans"
        :loading="loading"
        item-value="id"
        loading-text="Cargando préstamos vencidos..."
        no-data-text="No hay préstamos vencidos"
        items-per-page-text="Registros por página"
        :items-per-page="10"
        :items-per-page-options="[10, 25, 50]"
      >
        <template #item.student="{ item }">
          <div class="py-2">
            <div class="font-weight-medium">
              {{ item.student?.full_name || 'Sin información' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.student?.document_number || 'Sin documento' }}
            </div>
          </div>
        </template>

        <template #item.copy="{ item }">
          <div class="py-2">
            <div class="font-weight-medium">
              {{ item.copy?.book?.title || 'Libro no disponible' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Ejemplar: {{ item.copy?.copy_code || 'N/A' }}
            </div>
          </div>
        </template>

        <template #item.due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>

        <template #item.days_overdue="{ item }">
          <v-chip color="error" size="small" variant="tonal">
            {{ getDaysOverdue(item.due_date) }} días
          </v-chip>
        </template>

        <template #bottom>
          <div class="pa-4 text-caption text-medium-emphasis">
            {{ overdueLoans.length }} préstamo(s) vencido(s)
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3500"
      location="top right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

import { reportsService } from '../../services/reports';

const loading = ref(false);

const summary = ref({
  total_books: 0,
  total_copies: 0,
  available_copies: 0,
  loaned_copies: 0,
  total_students: 0,
  total_loans: 0,
  active_loans: 0,
  overdue_loans: 0,
});

const overdueLoans = ref([]);
const mostBorrowed = ref([]);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

const statistics = [
  {
    key: 'total_books',
    label: 'Libros registrados',
    icon: 'mdi-book-multiple',
    color: 'primary',
  },
  {
    key: 'total_copies',
    label: 'Ejemplares registrados',
    icon: 'mdi-bookshelf',
    color: 'info',
  },
  {
    key: 'total_students',
    label: 'Estudiantes activos',
    icon: 'mdi-account-group',
    color: 'success',
  },
  {
    key: 'total_loans',
    label: 'Préstamos registrados',
    icon: 'mdi-book-arrow-right',
    color: 'secondary',
  },
];

const overdueHeaders = [
  { title: 'Estudiante', key: 'student', sortable: false },
  { title: 'Libro / Ejemplar', key: 'copy', sortable: false },
  { title: 'Fecha de vencimiento', key: 'due_date', sortable: false },
  { title: 'Días de retraso', key: 'days_overdue', sortable: false },
];

const returnedLoanCount = computed(() => {
  return Math.max(
    0,
    summary.value.total_loans - summary.value.active_loans,
  );
});

const availabilityPercentage = computed(() => {
  if (!summary.value.total_copies) return 0;

  return Math.round(
    (summary.value.available_copies / summary.value.total_copies) * 100,
  );
});

const activeLoanPercentage = computed(() => {
  if (!summary.value.total_loans) return 0;

  return Math.min(
    100,
    (summary.value.active_loans / summary.value.total_loans) * 100,
  );
});

const returnedLoanPercentage = computed(() => {
  if (!summary.value.total_loans) return 0;

  return Math.min(
    100,
    (returnedLoanCount.value / summary.value.total_loans) * 100,
  );
});

const overdueLoanPercentage = computed(() => {
  if (!summary.value.active_loans) return 0;

  return Math.min(
    100,
    (summary.value.overdue_loans / summary.value.active_loans) * 100,
  );
});

const maxBookLoans = computed(() => {
  return Math.max(
    1,
    ...mostBorrowed.value.map((book) => Number(book.total_loans) || 0),
  );
});

function showMessage(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color,
  };
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return message || fallback;
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-CO').format(Number(value) || 0);
}

function getBookPercentage(totalLoans) {
  return Math.round(
    ((Number(totalLoans) || 0) / maxBookLoans.value) * 100,
  );
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

function getDaysOverdue(dueDate) {
  if (!dueDate) return 0;

  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((today.getTime() - due.getTime()) / 86400000),
  );
}

async function loadReports() {
  loading.value = true;

  const results = await Promise.allSettled([
    reportsService.getSummary(),
    reportsService.getOverdueLoans(),
    reportsService.getMostBorrowedBooks(),
  ]);

  const errors = [];

  if (results[0].status === 'fulfilled') {
    summary.value = {
      ...summary.value,
      ...results[0].value,
    };
  } else {
    console.error('Error cargando resumen:', results[0].reason);
    errors.push('resumen general');
  }

  if (results[1].status === 'fulfilled') {
    const response = results[1].value;

    overdueLoans.value = Array.isArray(response)
      ? response
      : response.data || [];
  } else {
    console.error('Error cargando préstamos vencidos:', results[1].reason);
    errors.push('préstamos vencidos');
  }

  if (results[2].status === 'fulfilled') {
    const response = results[2].value;

    mostBorrowed.value = Array.isArray(response)
      ? response
      : response.data || [];
  } else {
    console.error('Error cargando libros más prestados:', results[2].reason);
    errors.push('libros más prestados');
  }

  if (errors.length) {
    showMessage(
      `No fue posible cargar: ${errors.join(', ')}`,
      'error',
    );
  }

  loading.value = false;
}

onMounted(() => {
  loadReports();
});
</script>

<style scoped>
.stat-card {
  height: 100%;
}

.min-width-0 {
  min-width: 0;
}

.section-heading {
  min-height: 28px;
}

.availability-chart {
  display: flex;
  justify-content: center;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.primary-dot {
  background: rgb(var(--v-theme-primary));
}

.warning-dot {
  background: rgb(var(--v-theme-warning));
}

.book-ranking:last-child .v-progress-linear {
  margin-bottom: 0 !important;
}

.empty-state {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
