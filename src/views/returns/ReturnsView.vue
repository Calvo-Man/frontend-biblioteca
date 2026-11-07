
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="mb-5">
      <p class="text-body-2 text-medium-emphasis">
        Consulta los préstamos activos y registra la devolución de ejemplares.
      </p>
    </div>

    <!-- Filtros -->
    <v-card class="mb-5" rounded="lg" elevation="0" border>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Buscar préstamo"
              placeholder="Estudiante, documento, ejemplar o libro"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:model-value="handleSearch"
              @click:clear="handleSearch"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-btn
              block
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
              @click="clearFilters"
            >
              Limpiar búsqueda
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Préstamos activos -->
    <v-card rounded="lg" elevation="0" border>
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="loans"
        :items-length="total"
        :loading="loading"
        item-value="id"
        loading-text="Cargando préstamos activos..."
        no-data-text="No hay préstamos activos pendientes de devolución"
        items-per-page-text="Registros por página"
        @update:options="handleTableOptions"
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

        <template #item.loan_date="{ item }">
          {{ formatDate(item.loan_date) }}
        </template>

        <template #item.due_date="{ item }">
          <div>
            <span>{{ formatDate(item.due_date) }}</span>
            <div
              v-if="isOverdue(item.due_date)"
              class="text-caption text-error font-weight-medium"
            >
              Vencido
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            :color="isOverdue(item.due_date) ? 'error' : 'warning'"
            variant="tonal"
          >
            {{ isOverdue(item.due_date) ? 'Vencido' : 'Activo' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip text="Registrar devolución">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-book-check-outline"
                size="small"
                color="success"
                variant="tonal"
                @click="openReturnDialog(item)"
              />
            </template>
          </v-tooltip>
        </template>

        <template #bottom>
          <div class="d-flex align-center justify-space-between flex-wrap pa-4 ga-3">
            <span class="text-caption text-medium-emphasis">
              {{ total }} préstamo(s) activo(s)
            </span>

            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="5"
              density="comfortable"
              @update:model-value="loadLoans"
            />
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Registrar devolución -->
    <v-dialog
      v-model="returnDialog"
      max-width="600"
      persistent
    >
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between pa-5">
          <span class="text-h6 font-weight-bold">
            Registrar devolución
          </span>

          <v-btn
            icon="mdi-close"
            variant="text"
            :disabled="saving"
            @click="closeReturnDialog"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <template v-if="selectedLoan">
            <v-alert
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-5"
            >
              Verifica el estado físico del ejemplar antes de confirmar la devolución.
            </v-alert>

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

            <div class="detail-item">
              <span>Libro</span>
              <strong>
                {{ selectedLoan.copy?.book?.title || 'N/A' }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Ejemplar</span>
              <strong>
                {{ selectedLoan.copy?.copy_code || 'N/A' }}
              </strong>
            </div>

            <div class="detail-item mb-5">
              <span>Vencimiento</span>
              <strong>
                {{ formatDate(selectedLoan.due_date) }}
              </strong>
            </div>

            <v-divider class="mb-5" />

            <v-form ref="formRef" @submit.prevent="registerReturn">
              <v-select
                v-model="form.copy_status"
                :items="copyStatusOptions"
                label="Estado del ejemplar después de la devolución"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-book-check"
                :rules="[rules.required]"
                class="mb-3"
              />

              <v-alert
                v-if="form.copy_status === 'DAMAGED'"
                type="warning"
                variant="tonal"
                density="comfortable"
                class="mb-4"
              >
                El ejemplar quedará marcado como dañado y no estará disponible para préstamos.
              </v-alert>

              <v-alert
                v-if="form.copy_status === 'IN_REPAIR'"
                type="warning"
                variant="tonal"
                density="comfortable"
                class="mb-4"
              >
                El ejemplar quedará en reparación y no podrá prestarse.
              </v-alert>

              <v-textarea
                v-model="form.notes"
                label="Observaciones"
                placeholder="Describe el estado del ejemplar o cualquier novedad..."
                variant="outlined"
                density="comfortable"
                rows="3"
                counter="1000"
                maxlength="1000"
                hide-details="auto"
              />
            </v-form>
          </template>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-5">
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="saving"
            @click="closeReturnDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="success"
            prepend-icon="mdi-check-circle-outline"
            :loading="saving"
            @click="registerReturn"
          >
            Confirmar devolución
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
import { ref, reactive, onMounted } from 'vue';

import { loansService } from '../../services/loans';
import { returnsService } from '../../services/returns';

const loading = ref(false);
const saving = ref(false);

const loans = ref([]);
const total = ref(0);
const totalPages = ref(1);

const page = ref(1);
const itemsPerPage = ref(10);

const search = ref('');

const returnDialog = ref(false);
const selectedLoan = ref(null);
const formRef = ref(null);

let searchTimeout = null;

const form = reactive({
  copy_status: 'AVAILABLE',
  notes: '',
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

const copyStatusOptions = [
  { title: 'Disponible', value: 'AVAILABLE' },
  { title: 'Dañado', value: 'DAMAGED' },
  { title: 'En reparación', value: 'IN_REPAIR' },
];

const rules = {
  required: (value) => {
    return value !== null && value !== undefined && value !== ''
      ? true
      : 'Selecciona el estado del ejemplar';
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
      status: 'ACTIVE',
    };

    if (search.value?.trim()) {
      params.search = search.value.trim();
    }

    const response = await loansService.getAll(params);

    loans.value = response.data || [];
    total.value = response.total || 0;
    totalPages.value = Math.max(1, response.totalPages || 1);
  } catch (error) {
    console.error('Error cargando préstamos activos:', error);

    showMessage(
      getErrorMessage(error, 'No fue posible cargar los préstamos activos'),
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

function handleTableOptions(options) {
  const newPage = options.page;
  const newLimit = options.itemsPerPage;

  if (
    page.value !== newPage ||
    itemsPerPage.value !== newLimit
  ) {
    page.value = newPage;
    itemsPerPage.value = newLimit;
    loadLoans();
  }
}

function clearFilters() {
  search.value = '';
  page.value = 1;
  loadLoans();
}

function openReturnDialog(loan) {
  selectedLoan.value = loan;

  form.copy_status = 'AVAILABLE';
  form.notes = '';

  returnDialog.value = true;
}

function closeReturnDialog() {
  if (saving.value) return;

  returnDialog.value = false;
  selectedLoan.value = null;

  formRef.value?.resetValidation();
}

async function registerReturn() {
  if (!selectedLoan.value) return;

  const validation = await formRef.value?.validate();

  if (!validation?.valid) return;

  saving.value = true;

  try {
    const returnData = {
      copy_status: form.copy_status,
      notes: form.notes.trim() || undefined,
    };

    await returnsService.register(
      selectedLoan.value.id,
      returnData,
    );

    returnDialog.value = false;
    selectedLoan.value = null;

    showMessage('Devolución registrada correctamente');

    await loadLoans();
  } catch (error) {
    console.error('Error registrando devolución:', error);

    showMessage(
      getErrorMessage(error, 'No fue posible registrar la devolución'),
      'error',
    );
  } finally {
    saving.value = false;
  }
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

  const due = new Date(`${String(dueDate).slice(0, 10)}T23:59:59`);

  return due < new Date();
}

onMounted(() => {
  loadLoans();
});
</script>

<style scoped>
.detail-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.detail-item span {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.65;
  font-size: 0.875rem;
}

.detail-item strong {
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
