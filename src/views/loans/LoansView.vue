
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="page-header d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Préstamos</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Registra y consulta los préstamos de la biblioteca.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        rounded="lg"
        @click="openCreateDialog"
      >
        Registrar préstamo
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card rounded="lg" elevation="0" border class="filter-card mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              label="Buscar préstamo"
              placeholder="Estudiante, documento, ejemplar o libro..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:model-value="handleSearch"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Estado del préstamo"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="handleStatusFilter"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn
              block
              variant="tonal"
              color="primary"
              prepend-icon="mdi-filter-remove"
              rounded="lg"
              @click="clearFilters"
            >
              Limpiar filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card rounded="lg" elevation="0" border class="table-card">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 px-4 py-4">
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Préstamos registrados
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ total }} préstamo(s) encontrado(s)
          </div>
        </div>

        <v-chip
          v-if="statusFilter === 'OVERDUE'"
          color="error"
          variant="tonal"
          size="small"
        >
          <v-icon start size="small">mdi-alert-circle-outline</v-icon>
          Préstamos vencidos
        </v-chip>
      </div>

      <v-divider />

      <div class="table-scroll">
        <v-data-table-server
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="loans"
          :items-length="total"
          :loading="loading"
          item-value="id"
          loading-text="Cargando préstamos..."
          no-data-text="No hay préstamos registrados"
          items-per-page-text="Registros por página"
          @update:options="handleTableOptions"
        >
          <template #item.student="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <v-avatar color="primary" variant="tonal" size="38">
                <v-icon>mdi-account-outline</v-icon>
              </v-avatar>

              <div>
                <div class="font-weight-medium">
                  {{ item.student?.full_name || 'Sin información' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.student?.document_number || 'Sin documento' }}
                </div>
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
            <div>
              <span>{{ formatDate(item.due_date) }}</span>

              <div
                v-if="item.status === 'ACTIVE' && isOverdue(item.due_date)"
                class="text-caption text-error font-weight-medium"
              >
                <v-icon size="small">mdi-alert-circle-outline</v-icon>
                Vencido
              </div>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item)"
              variant="tonal"
            >
              <v-icon start size="small">
                {{ item.status === 'RETURNED'
                  ? 'mdi-check-circle-outline'
                  : isOverdue(item.due_date)
                    ? 'mdi-alert-circle-outline'
                    : 'mdi-clock-outline' }}
              </v-icon>

              {{ getStatusLabel(item) }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-center">
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
            </div>
          </template>

          <template #bottom>
            <v-divider />

            <div class="d-flex align-center justify-space-between flex-wrap pa-4 ga-3">
              <div class="text-body-2 text-medium-emphasis">
                {{ total }} préstamo(s) encontrado(s)
              </div>

              <v-pagination
                v-if="totalPages > 1"
                v-model="page"
                :length="totalPages"
                :total-visible="5"
                density="comfortable"
                @update:model-value="handlePageChange"
              />
            </div>
          </template>
        </v-data-table-server>
      </div>
    </v-card>

    <!-- Registrar préstamo -->
    <v-dialog
      v-model="createDialog"
      max-width="650"
      persistent
      scrollable
    >
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-3">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-book-plus-outline</v-icon>
            Registrar préstamo
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            rounded="lg"
            class="mb-5"
          >
            Solo se pueden prestar ejemplares disponibles.
            Cada estudiante puede tener máximo 8 préstamos activos.
          </v-alert>

          <v-form ref="formRef" @submit.prevent="createLoan">
            <v-autocomplete
              v-model="form.student_document"
              :items="studentOptions"
              :loading="loadingStudents"
              item-title="display"
              item-value="document_number"
              label="Estudiante"
              placeholder="Buscar por nombre o documento"
              prepend-inner-icon="mdi-account-search-outline"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              no-data-text="No se encontraron estudiantes"
              class="mb-3"
            />

            <v-autocomplete
              v-model="form.copy_id"
              :items="copyOptions"
              :loading="loadingCopies"
              item-title="display"
              item-value="id"
              label="Ejemplar disponible"
              placeholder="Buscar por título o código"
              prepend-inner-icon="mdi-book-open-page-variant-outline"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              no-data-text="No hay ejemplares disponibles"
              class="mb-3"
            />

            <v-text-field
              v-model.number="form.loan_days"
              label="Duración del préstamo"
              placeholder="Cantidad de días"
              prepend-inner-icon="mdi-calendar-clock-outline"
              suffix="días"
              type="number"
              min="1"
              step="1"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.positiveInteger]"
              hint="Puedes establecer la duración del préstamo."
              persistent-hint
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-5">
          <v-spacer />

          <v-btn
            variant="text"
            color="grey-darken-1"
            :disabled="saving"
            @click="closeCreateDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="mdi-check"
            :loading="saving"
            @click="createLoan"
          >
            Registrar préstamo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Detalles del préstamo -->
    <v-dialog
      v-model="detailsDialog"
      max-width="550"
    >
      <v-card v-if="selectedLoan" rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between pa-5">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-book-information-variant</v-icon>
            Detalle del préstamo
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-5">
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

          <div class="detail-section-title">
            <v-icon size="small">mdi-account-outline</v-icon>
            Información del estudiante
          </div>

          <div class="detail-item">
            <span>Estudiante</span>
            <strong>{{ selectedLoan.student?.full_name || 'N/A' }}</strong>
          </div>

          <div class="detail-item">
            <span>Documento</span>
            <strong>{{ selectedLoan.student?.document_number || 'N/A' }}</strong>
          </div>

          <v-divider class="my-4" />

          <div class="detail-section-title">
            <v-icon size="small">mdi-book-outline</v-icon>
            Información del ejemplar
          </div>

          <div class="detail-item">
            <span>Libro</span>
            <strong>{{ selectedLoan.copy?.book?.title || 'N/A' }}</strong>
          </div>

          <div class="detail-item">
            <span>Código del ejemplar</span>
            <strong>{{ selectedLoan.copy?.copy_code || 'N/A' }}</strong>
          </div>

          <v-divider class="my-4" />

          <div class="detail-section-title">
            <v-icon size="small">mdi-calendar-outline</v-icon>
            Fechas del préstamo
          </div>

          <div class="detail-item">
            <span>Fecha del préstamo</span>
            <strong>{{ formatDate(selectedLoan.loan_date) }}</strong>
          </div>

          <div class="detail-item">
            <span>Fecha de vencimiento</span>
            <strong>{{ formatDate(selectedLoan.due_date) }}</strong>
          </div>

          <div
            v-if="selectedLoan.returned_at"
            class="detail-item"
          >
            <span>Fecha de devolución</span>
            <strong>{{ formatDateTime(selectedLoan.returned_at) }}</strong>
          </div>

          <div
            v-if="selectedLoan.return_notes"
            class="mt-4"
          >
            <div class="text-caption text-medium-emphasis mb-2">
              Observaciones de devolución
            </div>

            <v-card
              color="surface"
              variant="tonal"
              rounded="lg"
              class="pa-3"
            >
              <p class="text-body-2">
                {{ selectedLoan.return_notes }}
              </p>
            </v-card>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            color="primary"
            variant="tonal"
            rounded="lg"
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
      location="bottom end"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';

import { loansService } from '../../services/loans';
import { studentsService } from '../../services/students';
import { copiesService } from '../../services/copies';

const loading = ref(false);
const saving = ref(false);
const loadingStudents = ref(false);
const loadingCopies = ref(false);

const loans = ref([]);
const students = ref([]);
const copies = ref([]);

const total = ref(0);
const totalPages = ref(1);

const page = ref(1);
const itemsPerPage = ref(10);

const search = ref('');
const statusFilter = ref('ALL');

const createDialog = ref(false);
const detailsDialog = ref(false);

const selectedLoan = ref(null);
const formRef = ref(null);

let searchTimeout = null;

const form = reactive({
  student_document: null,
  copy_id: null,
  loan_days: 15,
});

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

const headers = [
  { title: 'Estudiante', key: 'student', sortable: false },
  { title: 'Libro / Ejemplar', key: 'copy', sortable: false },
  { title: 'Fecha préstamo', key: 'loan_date', sortable: false },
  { title: 'Vencimiento', key: 'due_date', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];

const statusOptions = [
  { title: 'Todos', value: 'ALL' },
  { title: 'Activos', value: 'ACTIVE' },
  { title: 'Devueltos', value: 'RETURNED' },
  { title: 'Vencidos', value: 'OVERDUE' },
];

const studentOptions = ref([]);
const copyOptions = ref([]);

const rules = {
  required: (value) => {
    return value !== null && value !== undefined && value !== ''
      ? true
      : 'Este campo es obligatorio';
  },

  positiveInteger: (value) => {
    const number = Number(value);

    return Number.isInteger(number) && number >= 1
      ? true
      : 'Ingresa un número entero mayor o igual a 1';
  },
};

function showMessage(message, color = 'success') {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return message || fallback;
}

async function loadLoans() {
  loading.value = true;

  try {
    const params = {
      page: page.value,
      limit: itemsPerPage.value,
    };

    if (search.value?.trim()) {
      params.search = search.value.trim();
    }

    if (statusFilter.value !== 'ALL') {
      params.status = statusFilter.value;
    }

    const response = await loansService.getAll(params);

    loans.value = Array.isArray(response.data) ? response.data : [];
    total.value = Number(response.total || 0);
    totalPages.value = Math.max(1, Number(response.totalPages || 1));
  } catch (error) {
    console.error('Error cargando préstamos:', error);

    showMessage(
      getErrorMessage(error, 'No fue posible cargar los préstamos'),
      'error',
    );
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadLoans();
  }, 350);
}

function handleStatusFilter() {
  page.value = 1;
  loadLoans();
}

function handleTableOptions(options) {
  const newPage = options.page;
  const newLimit = options.itemsPerPage;

  const changed =
    page.value !== newPage ||
    itemsPerPage.value !== newLimit;

  if (!changed) return;

  page.value = newPage;
  itemsPerPage.value = newLimit;

  loadLoans();
}

function handlePageChange(newPage) {
  if (page.value === newPage) return;

  page.value = newPage;
  loadLoans();
}

function clearFilters() {
  clearTimeout(searchTimeout);

  search.value = '';
  statusFilter.value = 'ALL';
  page.value = 1;

  loadLoans();
}

async function loadStudents() {
  loadingStudents.value = true;

  try {
    const response = await studentsService.getAll({
      page: 1,
      limit: 100,
    });

    students.value = response.data || [];

    studentOptions.value = students.value
      .filter(student => student.is_active)
      .map(student => ({
        ...student,
        display: `${student.full_name} - ${student.document_number}`,
      }));
  } catch (error) {
    console.error('Error cargando estudiantes:', error);

    showMessage(
      getErrorMessage(error, 'No fue posible cargar los estudiantes'),
      'error',
    );
  } finally {
    loadingStudents.value = false;
  }
}

async function loadAvailableCopies() {
  loadingCopies.value = true;

  try {
    const response = await copiesService.getAll({
      page: 1,
      limit: 100,
      status: 'AVAILABLE',
    });

    copies.value = response.data || [];

    copyOptions.value = copies.value.map(copy => ({
      ...copy,
      display: `${copy.book?.title || 'Libro sin título'} | ${copy.copy_code}`,
    }));
  } catch (error) {
    console.error('Error cargando ejemplares:', error);

    showMessage(
      getErrorMessage(error, 'No fue posible cargar los ejemplares disponibles'),
      'error',
    );
  } finally {
    loadingCopies.value = false;
  }
}

async function openCreateDialog() {
  form.student_document = null;
  form.copy_id = null;
  form.loan_days = 15;

  createDialog.value = true;

  await Promise.all([
    loadStudents(),
    loadAvailableCopies(),
  ]);
}

function closeCreateDialog() {
  if (saving.value) return;

  createDialog.value = false;
  formRef.value?.resetValidation();
}

async function createLoan() {
  const validation = await formRef.value?.validate();

  if (!validation?.valid) return;

  const loanDays = Number(form.loan_days);

  if (!Number.isInteger(loanDays) || loanDays < 1) {
    showMessage(
      'La duración debe ser un número entero mayor o igual a 1',
      'error',
    );
    return;
  }

  saving.value = true;

  try {
    await loansService.create({
      student_document: form.student_document,
      copy_id: form.copy_id,
      loan_days: loanDays,
    });

    createDialog.value = false;

    showMessage('Préstamo registrado correctamente');

    await Promise.all([
      loadLoans(),
      loadAvailableCopies(),
    ]);
  } catch (error) {
    console.error('Error registrando préstamo:', error);

    showMessage(
      getErrorMessage(error, 'No fue posible registrar el préstamo'),
      'error',
    );
  } finally {
    saving.value = false;
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
  if (!date) return 'N/A';

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

function isOverdue(dueDate) {
  if (!dueDate) return false;

  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(due.getTime()) && due < today;
}

function getStatusColor(loan) {
  if (loan.status === 'RETURNED') return 'success';

  return isOverdue(loan.due_date) ? 'error' : 'warning';
}

function getStatusLabel(loan) {
  if (loan.status === 'RETURNED') return 'Devuelto';

  return isOverdue(loan.due_date) ? 'Vencido' : 'Activo';
}

onMounted(() => {
  loadLoans();
});

onUnmounted(() => {
  clearTimeout(searchTimeout);
});
</script>

<style scoped>
.page-container {
  width: 100%;
}

.page-header {
  min-height: 55px;
}

.filter-card,
.table-card {
  overflow: hidden;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.table-scroll :deep(table) {
  min-width: 850px;
}

:deep(.v-data-table thead th) {
  font-weight: 600 !important;
  white-space: nowrap;
}

:deep(.v-data-table tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.035);
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: rgb(var(--v-theme-primary));
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
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .page-header {
    align-items: flex-start !important;
  }

  .page-header .v-btn {
    width: 100%;
  }

  .detail-item {
    gap: 10px;
  }

  .detail-item strong {
    max-width: 60%;
  }
}
</style>
