
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="page-header">
      <div>
        <p class="page-description">
          Administra las copias físicas y la disponibilidad de los libros.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-book-plus-outline"
        size="small"
        @click="openCreateDialog"
      >
        Registrar ejemplar
      </v-btn>
    </div>

    <!-- Error general -->
    <v-alert
      v-if="pageError"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-3"
      @click:close="pageError = ''"
    >
      {{ pageError }}
    </v-alert>

    <!-- Filtros -->
    <v-card class="filter-card mb-3" rounded="lg" elevation="0">
      <v-card-text class="pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Buscar ejemplares"
              placeholder="Código o título del libro..."
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              clearable
              hide-details
              @update:model-value="handleSearch"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Estado"
              prepend-inner-icon="mdi-filter-variant"
              density="compact"
              variant="outlined"
              clearable
              hide-details
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-autocomplete
              v-model="selectedBook"
              :items="bookOptions"
              item-title="title"
              item-value="id"
              label="Libro"
              placeholder="Buscar libro..."
              prepend-inner-icon="mdi-book-outline"
              density="compact"
              variant="outlined"
              clearable
              hide-details
              no-data-text="No se encontraron libros"
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              block
              color="secondary"
              variant="tonal"
              prepend-icon="mdi-filter-remove-outline"
              size="small"
              @click="clearFilters"
            >
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card class="table-card" rounded="lg" elevation="0">
      <div class="table-header">
        <div>
          <span class="table-title">Inventario de ejemplares</span>
          <span class="table-count">
            {{ total }} registros
          </span>
        </div>

        <v-chip size="small" color="primary" variant="tonal">
          Página {{ page }} de {{ totalPages }}
        </v-chip>
      </div>

      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        height="2"
      />

      <div class="table-scroll">
        <v-data-table
          :headers="headers"
          :items="copies"
          :loading="loading"
          item-value="id"
          hide-default-footer
          density="comfortable"
          class="copies-table"
          no-data-text="No hay ejemplares registrados"
          loading-text="Cargando ejemplares..."
        >
          <!-- Código -->
          <template #item.copy_code="{ item }">
            <div class="code-cell">
              <v-icon
                icon="mdi-barcode"
                size="17"
                color="primary"
              />
              <span>{{ item.copy_code }}</span>
            </div>
          </template>

          <!-- Libro -->
          <template #item.book="{ item }">
            <div class="book-cell">
              <v-avatar
                rounded="sm"
                size="36"
                color="grey-lighten-3"
              >
                <v-icon
                  icon="mdi-book-outline"
                  color="grey"
                  size="19"
                />
              </v-avatar>

              <div class="book-information">
                <span class="book-name">
                  {{ item.book?.title || 'Libro no disponible' }}
                </span>

                <span class="book-author">
                  {{ item.book?.author || 'Autor no disponible' }}
                </span>
              </div>
            </div>
          </template>

          <!-- Condición -->
          <template #item.condition="{ item }">
            <v-chip
              size="x-small"
              variant="tonal"
              :color="conditionColor(item.condition)"
            >
              {{ conditionLabel(item.condition) }}
            </v-chip>
          </template>

          <!-- Estado -->
          <template #item.status="{ item }">
            <v-chip
              size="x-small"
              variant="tonal"
              :color="statusColor(item.status)"
            >
              <v-icon
                :icon="statusIcon(item.status)"
                size="12"
                start
              />
              {{ statusLabel(item.status) }}
            </v-chip>
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <div class="table-actions">
              <v-tooltip text="Editar ejemplar">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    @click="openEditDialog(item)"
                  />
                </template>
              </v-tooltip>

              <v-tooltip text="Cambiar estado">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-swap-horizontal"
                    size="x-small"
                    variant="tonal"
                    color="warning"
                    @click="openStatusDialog(item)"
                  />
                </template>
              </v-tooltip>

              <v-tooltip text="Eliminar ejemplar">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-delete-outline"
                    size="x-small"
                    variant="tonal"
                    color="error"
                    :disabled="deletingId !== null"
                    @click="openDeleteDialog(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <!-- Sin resultados -->
          <template #no-data>
            <div class="empty-state">
              <v-icon
                icon="mdi-book-multiple-outline"
                size="38"
                color="grey-lighten-1"
              />

              <strong>No se encontraron ejemplares</strong>

              <span>
                Prueba con otros filtros o registra un nuevo ejemplar.
              </span>

              <v-btn
                v-if="search || selectedStatus || selectedBook"
                size="small"
                color="primary"
                variant="text"
                @click="clearFilters"
              >
                Limpiar filtros
              </v-btn>
            </div>
          </template>

          <template #bottom />
        </v-data-table>
      </div>

      <!-- Paginación -->
      <v-divider />

      <div class="pagination">
        <span class="pagination-info">
          Mostrando {{ copies.length }} de {{ total }} ejemplares
        </span>

        <div class="pagination-controls">
          <v-select
            v-model="limit"
            :items="[5, 10, 20, 50]"
            label="Por página"
            density="compact"
            variant="outlined"
            hide-details
            class="limit-select"
            @update:model-value="changeLimit"
          />

          <span class="pagination-page">
            Página {{ page }} de {{ totalPages }}
          </span>

          <v-btn
            icon="mdi-chevron-left"
            size="small"
            variant="tonal"
            color="primary"
            :disabled="page <= 1 || loading"
            @click="changePage(page - 1)"
          />

          <v-btn
            icon="mdi-chevron-right"
            size="small"
            variant="tonal"
            color="primary"
            :disabled="page >= totalPages || loading"
            @click="changePage(page + 1)"
          />
        </div>
      </div>
    </v-card>

    <!-- Crear / editar ejemplar -->
    <v-dialog
      v-model="dialog"
      max-width="560"
      persistent
      scrollable
    >
      <v-card rounded="lg">
        <v-card-title class="dialog-header">
          <div>
            <h3>
              {{ editingCopy ? 'Editar ejemplar' : 'Registrar ejemplar' }}
            </h3>

            <p>
              {{ editingCopy
                ? 'Modifica la información de esta copia física.'
                : 'Completa los datos para agregar una copia al inventario.' }}
            </p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="saving"
            @click="closeDialog"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="dialog-content">
          <v-form ref="formRef" @submit.prevent="saveCopy">
            <div class="form-section-title mb-3">
              <v-icon icon="mdi-book-information-variant" size="17" />
              Información del ejemplar
            </div>

            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.copy_code"
                  label="Código del ejemplar *"
                  placeholder="Ej. LIB-0001"
                  prepend-inner-icon="mdi-barcode"
                  variant="outlined"
                  density="compact"
                  :rules="requiredRules"
                  maxlength="50"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="form.book_id"
                  :items="bookOptions"
                  item-title="title"
                  item-value="id"
                  label="Libro *"
                  placeholder="Escribe para buscar un libro..."
                  prepend-inner-icon="mdi-book-open-page-variant"
                  variant="outlined"
                  density="compact"
                  :rules="[
                    value => !!value || 'Debes seleccionar un libro.'
                  ]"
                  no-data-text="No hay libros disponibles"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="form.condition"
                  :items="conditionOptions"
                  item-title="title"
                  item-value="value"
                  label="Condición física *"
                  prepend-inner-icon="mdi-book-check-outline"
                  variant="outlined"
                  density="compact"
                  :rules="requiredRules"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.notes"
                  label="Observaciones"
                  placeholder="Observaciones sobre el estado del ejemplar..."
                  prepend-inner-icon="mdi-text-box-outline"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  auto-grow
                  hide-details="auto"
                  maxlength="1000"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn
            variant="text"
            size="small"
            :disabled="saving"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            size="small"
            prepend-icon="mdi-content-save-outline"
            :loading="saving"
            @click="saveCopy"
          >
            {{ editingCopy ? 'Guardar cambios' : 'Registrar ejemplar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cambiar estado -->
    <v-dialog
      v-model="statusDialog"
      max-width="440"
      persistent
    >
      <v-card rounded="lg">
        <v-card-title class="dialog-header">
          <div>
            <h3>Cambiar estado</h3>
            <p>Actualiza la disponibilidad del ejemplar.</p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="changingStatus"
            @click="statusDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="dialog-content">
          <div class="selected-copy-card">
            <v-avatar
              color="primary"
              variant="tonal"
              rounded="lg"
              size="42"
            >
              <v-icon icon="mdi-book-outline" />
            </v-avatar>

            <div>
              <span class="selected-copy-label">
                Código del ejemplar
              </span>

              <strong>
                {{ selectedCopy?.copy_code }}
              </strong>
            </div>
          </div>

          <v-select
            v-model="newStatus"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            label="Nuevo estado"
            prepend-inner-icon="mdi-swap-horizontal"
            variant="outlined"
            density="compact"
            hide-details
            class="mt-4"
          />

          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            El estado determina si el ejemplar puede utilizarse para nuevos préstamos.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn
            variant="text"
            size="small"
            :disabled="changingStatus"
            @click="statusDialog = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            size="small"
            prepend-icon="mdi-check"
            :loading="changingStatus"
            :disabled="!newStatus || newStatus === selectedCopy?.status"
            @click="saveStatus"
          >
            Actualizar estado
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmar eliminación -->
    <v-dialog
      v-model="deleteDialog"
      max-width="420"
      persistent
    >
      <v-card rounded="lg">
        <v-card-text class="delete-dialog-content">
          <v-avatar
            color="error"
            variant="tonal"
            size="52"
            rounded="lg"
            class="mb-3"
          >
            <v-icon icon="mdi-trash-can-outline" size="27" />
          </v-avatar>

          <h3 class="delete-dialog-title">
            ¿Eliminar ejemplar?
          </h3>

          <p class="delete-dialog-description">
            Estás a punto de eliminar el ejemplar
            <strong>{{ copyToDelete?.copy_code }}</strong>.
            Esta acción no se puede deshacer.
          </p>

          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4 text-left"
          >
            El registro será eliminado del inventario.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="delete-dialog-actions">
          <v-btn
            variant="text"
            size="small"
            :disabled="deletingId !== null"
            @click="closeDeleteDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            size="small"
            prepend-icon="mdi-delete-outline"
            :loading="deletingId !== null"
            @click="confirmDelete"
          >
            Sí, eliminar
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

      <template #actions>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';

import { copiesService } from '../../services/copies';
import { booksService } from '../../services/books';

const copies = ref([]);
const books = ref([]);
const bookOptions = ref([]);

const loading = ref(false);
const saving = ref(false);
const changingStatus = ref(false);
const deletingId = ref(null);

const search = ref('');
const selectedStatus = ref(null);
const selectedBook = ref(null);

const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(1);

const dialog = ref(false);
const statusDialog = ref(false);
const deleteDialog = ref(false);

const formRef = ref(null);

const editingCopy = ref(null);
const selectedCopy = ref(null);
const copyToDelete = ref(null);
const newStatus = ref(null);

const pageError = ref('');

const form = reactive({
  copy_code: '',
  book_id: null,
  condition: 'GOOD',
  notes: '',
});

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

let searchTimeout = null;

const headers = [
  { title: 'Código', key: 'copy_code', sortable: false },
  { title: 'Libro', key: 'book', sortable: false, minWidth: '230px' },
  { title: 'Condición', key: 'condition', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
    align: 'center',
    minWidth: '125px',
  },
];

const requiredRules = [
  value =>
    !!String(value ?? '').trim() ||
    'Este campo es obligatorio.',
];

const statusOptions = [
  { title: 'Disponible', value: 'AVAILABLE' },
  { title: 'Prestado', value: 'LOANED' },
  { title: 'Dañado', value: 'DAMAGED' },
  { title: 'Perdido', value: 'LOST' },
  { title: 'En reparación', value: 'IN_REPAIR' },
];

const conditionOptions = [
  { title: 'Nuevo', value: 'NEW' },
  { title: 'Bueno', value: 'GOOD' },
  { title: 'Regular', value: 'FAIR' },
  { title: 'Deficiente', value: 'POOR' },
];

function showMessage(message, color = 'success') {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
}

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;

  return Array.isArray(message)
    ? message.join(', ')
    : message || fallback;
}

function statusLabel(status) {
  return statusOptions.find(item => item.value === status)?.title || status;
}

function conditionLabel(condition) {
  return conditionOptions.find(item => item.value === condition)?.title || condition;
}

function statusColor(status) {
  const colors = {
    AVAILABLE: 'success',
    LOANED: 'info',
    DAMAGED: 'error',
    LOST: 'grey-darken-1',
    IN_REPAIR: 'warning',
  };

  return colors[status] || 'grey';
}

function statusIcon(status) {
  const icons = {
    AVAILABLE: 'mdi-check-circle-outline',
    LOANED: 'mdi-book-arrow-right-outline',
    DAMAGED: 'mdi-alert-circle-outline',
    LOST: 'mdi-help-circle-outline',
    IN_REPAIR: 'mdi-tools',
  };

  return icons[status] || 'mdi-circle-outline';
}

function conditionColor(condition) {
  const colors = {
    NEW: 'success',
    GOOD: 'info',
    FAIR: 'warning',
    POOR: 'error',
  };

  return colors[condition] || 'grey';
}

async function loadBooks() {
  try {
    const response = await booksService.getAll({
      page: 1,
      limit: 100,
    });

    books.value = Array.isArray(response.data)
      ? response.data
      : [];

    bookOptions.value = books.value.map(book => ({
      id: book.id,
      title: book.title,
    }));
  } catch (error) {
    console.error('Error al cargar libros:', error);
    showMessage('No se pudieron cargar los libros.', 'error');
  }
}

async function loadCopies() {
  loading.value = true;
  pageError.value = '';

  try {
    const params = {
      page: page.value,
      limit: limit.value,
    };

    if (search.value?.trim()) {
      params.search = search.value.trim();
    }

    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }

    if (selectedBook.value) {
      params.book_id = selectedBook.value;
    }

    const response = await copiesService.getAll(params);

    copies.value = Array.isArray(response.data)
      ? response.data
      : [];

    total.value = response.total ?? 0;
    totalPages.value = Math.max(1, response.totalPages ?? 1);
  } catch (error) {
    console.error('Error al cargar ejemplares:', error);

    copies.value = [];
    total.value = 0;
    totalPages.value = 1;

    pageError.value = getErrorMessage(
      error,
      'No se pudieron cargar los ejemplares.',
    );
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadCopies();
  }, 350);
}

function applyFilters() {
  clearTimeout(searchTimeout);
  page.value = 1;
  loadCopies();
}

function clearFilters() {
  clearTimeout(searchTimeout);

  search.value = '';
  selectedStatus.value = null;
  selectedBook.value = null;
  page.value = 1;

  loadCopies();
}

function changeLimit() {
  page.value = 1;
  loadCopies();
}

function changePage(newPage) {
  if (
    newPage < 1 ||
    newPage > totalPages.value ||
    loading.value
  ) {
    return;
  }

  page.value = newPage;
  loadCopies();
}

function resetForm() {
  form.copy_code = '';
  form.book_id = null;
  form.condition = 'GOOD';
  form.notes = '';

  editingCopy.value = null;
  formRef.value?.resetValidation();
}

function openCreateDialog() {
  resetForm();
  dialog.value = true;
}

function openEditDialog(copy) {
  resetForm();

  editingCopy.value = copy;

  form.copy_code = copy.copy_code || '';
  form.book_id = copy.book_id || copy.book?.id || null;
  form.condition = copy.condition || 'GOOD';
  form.notes = copy.notes || '';

  dialog.value = true;
}

function closeDialog() {
  if (saving.value) return;

  dialog.value = false;
  resetForm();
}

async function saveCopy() {
  const validation = await formRef.value?.validate();

  if (!validation?.valid) return;

  saving.value = true;

  const copyData = {
    copy_code: form.copy_code.trim(),
    book_id: Number(form.book_id),
    condition: form.condition,
    notes: form.notes.trim() || null,
  };

  try {
    if (editingCopy.value) {
      await copiesService.update(editingCopy.value.id, copyData);
      showMessage('Ejemplar actualizado correctamente.');
    } else {
      await copiesService.create(copyData);
      showMessage('Ejemplar registrado correctamente.');
    }

    dialog.value = false;
    resetForm();

    await loadCopies();
  } catch (error) {
    console.error('Error al guardar ejemplar:', error);

    showMessage(
      getErrorMessage(error, 'No se pudo guardar el ejemplar.'),
      'error',
    );
  } finally {
    saving.value = false;
  }
}

function openStatusDialog(copy) {
  selectedCopy.value = copy;
  newStatus.value = copy.status;
  statusDialog.value = true;
}

async function saveStatus() {
  if (!selectedCopy.value || !newStatus.value) return;

  changingStatus.value = true;

  try {
    await copiesService.updateStatus(selectedCopy.value.id, {
      status: newStatus.value,
    });

    showMessage('Estado del ejemplar actualizado correctamente.');

    statusDialog.value = false;
    selectedCopy.value = null;
    newStatus.value = null;

    await loadCopies();
  } catch (error) {
    console.error('Error al cambiar estado:', error);

    showMessage(
      getErrorMessage(error, 'No se pudo cambiar el estado del ejemplar.'),
      'error',
    );
  } finally {
    changingStatus.value = false;
  }
}

/* Eliminación con diálogo de Vuetify */
function openDeleteDialog(copy) {
  copyToDelete.value = copy;
  deleteDialog.value = true;
}

function closeDeleteDialog() {
  if (deletingId.value !== null) return;

  deleteDialog.value = false;
  copyToDelete.value = null;
}

async function confirmDelete() {
  if (!copyToDelete.value || deletingId.value !== null) return;

  const copy = copyToDelete.value;

  deletingId.value = copy.id;

  try {
    await copiesService.delete(copy.id);

    showMessage('Ejemplar eliminado correctamente.');

    deleteDialog.value = false;
    copyToDelete.value = null;

    if (copies.value.length === 1 && page.value > 1) {
      page.value--;
    }

    await loadCopies();
  } catch (error) {
    console.error('Error al eliminar ejemplar:', error);

    showMessage(
      getErrorMessage(error, 'No se pudo eliminar el ejemplar.'),
      'error',
    );
  } finally {
    deletingId.value = null;
  }
}

onMounted(async () => {
  await Promise.all([
    loadBooks(),
    loadCopies(),
  ]);
});

onUnmounted(() => {
  clearTimeout(searchTimeout);
});
</script>

<style scoped>
.page-container {
  width: 100%;
}

/* Encabezado */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 17px;
}

.page-description {
  margin-top: 3px;
  color: #8995a3;
  font-size: 12px;
}

/* Tarjetas */
.filter-card,
.table-card {
  border: 1px solid #e9edf2;
  background: white;
}

/* Tabla */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 13px 16px;
}

.table-title {
  color: #263648;
  font-size: 12px;
  font-weight: 700;
}

.table-count {
  margin-left: 9px;
  color: #8995a3;
  font-size: 11px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.copies-table {
  min-width: 760px;
}

.copies-table :deep(th) {
  height: 42px !important;
  color: #7b8795 !important;
  background: #f8fafc;
  font-size: 10px !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.copies-table :deep(td) {
  height: 57px !important;
  color: #526173;
  font-size: 11px;
}

.copies-table :deep(tbody tr:hover) {
  background: #f8fafc;
}

.code-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #315b85;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
  padding: 5px 0;
}

.book-information {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.book-name {
  max-width: 260px;
  overflow: hidden;
  color: #263648;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  color: #8995a3;
  font-size: 10px;
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 11px 16px;
}

.pagination-info,
.pagination-page {
  color: #8995a3;
  font-size: 11px;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.limit-select {
  width: 115px;
}

/* Estado vacío */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 35px 15px;
  text-align: center;
}

.empty-state strong {
  color: #334155;
  font-size: 12px;
}

.empty-state span {
  color: #94a3b8;
  font-size: 11px;
}

/* Diálogos */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 13px;
}

.dialog-header h3 {
  color: #263648;
  font-size: 16px;
  font-weight: 700;
}

.dialog-header p {
  margin-top: 3px;
  color: #8995a3;
  font-size: 11px;
  font-weight: 400;
}

.dialog-content {
  padding: 17px 20px;
}

.dialog-actions {
  padding: 12px 20px;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.selected-copy-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e9edf2;
  border-radius: 8px;
  background: #f8fafc;
}

.selected-copy-card > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.selected-copy-label {
  color: #8995a3;
  font-size: 10px;
}

.selected-copy-card strong {
  color: #263648;
  font-size: 12px;
}

/* Diálogo de eliminación */
.delete-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 26px 24px 20px;
  text-align: center;
}

.delete-dialog-title {
  color: #263648;
  font-size: 17px;
  font-weight: 700;
}

.delete-dialog-description {
  margin-top: 9px;
  color: #748195;
  font-size: 12px;
  line-height: 1.6;
}

.delete-dialog-description strong {
  color: #263648;
}

.delete-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
}

/* Responsive */
@media (max-width: 600px) {
  .page-header {
    align-items: flex-start;
  }

  .pagination {
    padding: 10px 12px;
  }

  .pagination-info {
    width: 100%;
  }

  .pagination-controls {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .dialog-content {
    padding: 15px;
  }

  .dialog-header {
    padding: 14px 15px;
  }

  .dialog-actions {
    padding: 10px 15px;
  }

  .delete-dialog-content {
    padding: 22px 16px 16px;
  }

  .delete-dialog-actions {
    padding: 10px 15px;
  }
}
</style>
