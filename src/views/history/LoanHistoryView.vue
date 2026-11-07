
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <p class="text-body-2 text-medium-emphasis">
          Consulta y filtra los préstamos registrados en la biblioteca.
        </p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        size="small"
        :loading="loading"
        @click="loadHistory"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Resumen -->
    <v-row class="mb-2" dense>
      <v-col cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="0" border class="summary-card">
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <v-avatar color="primary" variant="tonal" size="42">
              <v-icon icon="mdi-book-multiple-outline" />
            </v-avatar>

            <div>
              <div class="text-caption text-medium-emphasis">
                Total de préstamos
              </div>
              <div class="text-h5 font-weight-bold">
                {{ loans.length }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="0" border class="summary-card">
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <v-avatar color="warning" variant="tonal" size="42">
              <v-icon icon="mdi-book-clock-outline" />
            </v-avatar>

            <div>
              <div class="text-caption text-medium-emphasis">
                Préstamos activos
              </div>
              <div class="text-h5 font-weight-bold">
                {{ activeLoans }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="0" border class="summary-card">
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <v-avatar color="success" variant="tonal" size="42">
              <v-icon icon="mdi-book-check-outline" />
            </v-avatar>

            <div>
              <div class="text-caption text-medium-emphasis">
                Préstamos devueltos
              </div>
              <div class="text-h5 font-weight-bold">
                {{ returnedLoans }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-card class="mb-4" rounded="lg" elevation="0" border>
      <v-card-text class="pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Buscar en el historial"
              placeholder="Estudiante, documento, libro o código"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Filtrar por estado"
              prepend-inner-icon="mdi-filter-variant"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card rounded="lg" elevation="0" border>
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 px-4 py-3">
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Historial de préstamos
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ filteredLoans.length }} registro(s) encontrado(s)
          </div>
        </div>

        <v-chip
          v-if="statusFilter === 'OVERDUE'"
          color="error"
          variant="tonal"
          size="small"
        >
          Solo vencidos
        </v-chip>
      </div>

      <v-divider />

      <div class="table-scroll">
        <v-data-table
          :headers="headers"
          :items="filteredLoans"
          :loading="loading"
          item-value="id"
          loading-text="Cargando historial..."
          no-data-text="No hay préstamos que coincidan con los filtros"
          items-per-page-text="Registros por página"
          :items-per-page="10"
          :items-per-page-options="[10, 25, 50, 100]"
          density="comfortable"
        >
          <template #item.id="{ item }">
            <span class="font-weight-medium">
              #{{ item.id }}
            </span>
          </template>

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

          <template #item.loan_date="{ item }">
            {{ formatDate(item.loan_date) }}
          </template>

          <template #item.due_date="{ item }">
            {{ formatDate(item.due_date) }}
          </template>

          <template #item.returned_at="{ item }">
            {{ formatDateTime(item.returned_at) }}
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item)"
              variant="tonal"
            >
              {{ getStatusLabel(item) }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-tooltip text="Ver detalles">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openDetails(item)"
                />
              </template>
            </v-tooltip>
          </template>

          <template #bottom>
            <div class="d-flex align-center justify-space-between flex-wrap pa-3 ga-2">
              <span class="text-caption text-medium-emphasis">
                {{ filteredLoans.length }} registro(s) encontrado(s)
              </span>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <!-- Detalles -->
    <v-dialog v-model="detailsDialog" max-width="550">
      <v-card v-if="selectedLoan" rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <span class="text-subtitle-1 font-weight-bold">
            Detalle del préstamo
          </span>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-body-2 text-medium-emphasis">
              Préstamo #{{ selectedLoan.id }}
            </span>

            <v-chip
              size="small"
              :color="getStatusColor(selectedLoan)"
              variant="tonal"
            >
              {{ getStatusLabel(selectedLoan) }}
            </v-chip>
          </div>

          <div class="detail-item">
            <span>Estudiante</span>
            <strong>
              {{ selectedLoan.student?.full_name || 'N/A' }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Documento</span>
            <strong>
              {{ selectedLoan.student?.document_number || 'N/A' }}
            </strong>
          </div>

          <v-divider class="my-3" />

          <div class="detail-item">
            <span>Libro</span>
            <strong>
              {{ selectedLoan.copy?.book?.title || 'N/A' }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Código del ejemplar</span>
            <strong>
              {{ selectedLoan.copy?.copy_code || 'N/A' }}
            </strong>
          </div>

          <v-divider class="my-3" />

          <div class="detail-item">
            <span>Fecha del préstamo</span>
            <strong>{{ formatDate(selectedLoan.loan_date) }}</strong>
          </div>

          <div class="detail-item">
            <span>Fecha de vencimiento</span>
            <strong>{{ formatDate(selectedLoan.due_date) }}</strong>
          </div>

          <div class="detail-item">
            <span>Fecha de devolución</span>
            <strong>{{ formatDateTime(selectedLoan.returned_at) }}</strong>
          </div>

          <template v-if="selectedLoan.return_notes">
            <v-divider class="my-3" />

            <div class="text-caption text-medium-emphasis mb-1">
              Observaciones de devolución
            </div>

            <p class="text-body-2">
              {{ selectedLoan.return_notes }}
            </p>
          </template>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            @click="detailsDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
const loans = ref([]);
const search = ref('');
const statusFilter = ref('ALL');

const detailsDialog = ref(false);
const selectedLoan = ref(null);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

const statusOptions = [
  { title: 'Todos los préstamos', value: 'ALL' },
  { title: 'Activos', value: 'ACTIVE' },
  { title: 'Devueltos', value: 'RETURNED' },
  { title: 'Vencidos', value: 'OVERDUE' },
];

const headers = [
  { title: '#', key: 'id', sortable: false },
  { title: 'Estudiante', key: 'student', sortable: false },
  { title: 'Libro / Ejemplar', key: 'copy', sortable: false },
  { title: 'Fecha préstamo', key: 'loan_date', sortable: false },
  { title: 'Vencimiento', key: 'due_date', sortable: false },
  { title: 'Devolución', key: 'returned_at', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];

const activeLoans = computed(() => {
  return loans.value.filter((loan) => loan.status === 'ACTIVE').length;
});

const returnedLoans = computed(() => {
  return loans.value.filter((loan) => loan.status === 'RETURNED').length;
});

const filteredLoans = computed(() => {
  const term = search.value.trim().toLowerCase();

  return loans.value.filter((loan) => {
    const matchesSearch = !term || [
      loan.id,
      loan.student?.full_name,
      loan.student?.document_number,
      loan.copy?.book?.title,
      loan.copy?.copy_code,
      loan.status,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(term),
    );

    let matchesStatus = true;

    if (statusFilter.value === 'ACTIVE') {
      matchesStatus = loan.status === 'ACTIVE' && !isOverdue(loan);
    } else if (statusFilter.value === 'RETURNED') {
      matchesStatus = loan.status === 'RETURNED';
    } else if (statusFilter.value === 'OVERDUE') {
      matchesStatus = isOverdue(loan);
    }

    return matchesSearch && matchesStatus;
  });
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

async function loadHistory() {
  loading.value = true;

  try {
    const response = await reportsService.getLoanHistory();

    loans.value = Array.isArray(response)
      ? response
      : response.data || [];
  } catch (error) {
    console.error('Error cargando historial:', error);

    showMessage(
      getErrorMessage(error, 'No fue posible cargar el historial'),
      'error',
    );
  } finally {
    loading.value = false;
  }
}

function openDetails(loan) {
  selectedLoan.value = loan;
  detailsDialog.value = true;
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

function formatDateTime(date) {
  if (!date) return 'Pendiente';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
}

function isOverdue(loan) {
  if (loan.status !== 'ACTIVE' || !loan.due_date) {
    return false;
  }

  const due = new Date(`${String(loan.due_date).slice(0, 10)}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(due.getTime()) && due < today;
}

function getStatusColor(loan) {
  if (loan.status === 'RETURNED') return 'success';

  return isOverdue(loan) ? 'error' : 'warning';
}

function getStatusLabel(loan) {
  if (loan.status === 'RETURNED') return 'Devuelto';

  return isOverdue(loan) ? 'Vencido' : 'Activo';
}

onMounted(() => {
  loadHistory();
});
</script>

<style scoped>
.summary-card {
  height: 100%;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.table-scroll :deep(table) {
  min-width: 1050px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 13px;
}

.detail-item span {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.65;
  font-size: 0.875rem;
}

.detail-item strong {
  max-width: 65%;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .detail-item {
    gap: 10px;
  }

  .detail-item strong {
    max-width: 60%;
  }
}
</style>
