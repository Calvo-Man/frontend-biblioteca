
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
      <div>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Administra las copias físicas de los libros de la biblioteca.
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

    <!-- Mensajes -->
    <v-alert
      v-if="pageError"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-4"
      @click:close="pageError = ''"
    >
      {{ pageError }}
    </v-alert>

    <!-- Filtros -->
    <v-card rounded="lg" elevation="0" border class="mb-4">
      <v-card-text class="pa-3">
        <v-row align="center" dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Buscar ejemplar"
              placeholder="Código o título del libro..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleSearch"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Estado"
              variant="outlined"
              density="compact"
              hide-details
              clearable
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
              variant="outlined"
              density="compact"
              hide-details
              clearable
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
    <v-card rounded="lg" elevation="0" border>
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 px-4 py-3">
        <div>
          <div class="font-weight-bold text-body-1">Listado de ejemplares</div>
          <div class="text-caption text-medium-emphasis">
            {{ total }} ejemplares registrados
          </div>
        </div>

        <v-chip size="small" color="primary" variant="tonal">
          Página {{ page }} de {{ totalPages }}
        </v-chip>
      </div>

      <v-divider />

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
          <template #item.copy_code="{ item }">
            <span class="font-weight-bold text-primary text-no-wrap">
              {{ item.copy_code }}
            </span>
          </template>

          <template #item.book="{ item }">
            <div class="py-1">
              <div class="font-weight-medium">
                {{ item.book?.title || 'Libro no disponible' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.book?.author || 'Autor no disponible' }}
              </div>
            </div>
          </template>

          <template #item.condition="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              :color="conditionColor(item.condition)"
            >
              {{ conditionLabel(item.condition) }}
            </v-chip>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              :color="statusColor(item.status)"
            >
              {{ statusLabel(item.status) }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end ga-1">
              <v-tooltip text="Editar ejemplar">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    size="small"
                    variant="text"
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
                    size="small"
                    variant="text"
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
                    size="small"
                    variant="text"
                    color="error"
                    :loading="deletingId === item.id"
                    :disabled="deletingId !== null"
                    @click="deleteCopy(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon
                icon="mdi-book-multiple-outline"
                size="38"
                color="grey-lighten-1"
                class="mb-2"
              />
              <div class="text-body-2 font-weight-medium">
                No se encontraron ejemplares
              </div>
              <div class="text-caption text-medium-emphasis">
                Prueba cambiando los filtros o registra un nuevo ejemplar.
              </div>
            </div>
          </template>

          <template #bottom />
        </v-data-table>
      </div>

      <!-- Paginación -->
      <v-divider />

      <div class="d-flex align-center justify-space-between flex-wrap ga-3 pa-3">
        <div class="text-caption text-medium-emphasis">
          Mostrando {{ copies.length }} de {{ total }} ejemplares
        </div>

        <div class="d-flex align-center flex-wrap ga-2">
          <v-select
            v-model="limit"
            :items="[5, 10, 20, 50]"
            label="Por página"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 125px"
            @update:model-value="changeLimit"
          />

          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="5"
            density="compact"
            rounded="lg"
            @update:model-value="loadCopies"
          />
        </div>
      </div>
    </v-card>

    <!-- Modal crear / editar -->
    <v-dialog
      v-model="dialog"
      max-width="560"
      persistent
    >
      <v-card rounded="lg">
        <div class="d-flex align-center justify-space-between px-5 pt-4 pb-2">
          <div>
            <div class="text-h6 font-weight-bold">
              {{ editingCopy ? 'Editar ejemplar' : 'Registrar ejemplar' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ editingCopy
                ? 'Actualiza la información de esta copia física.'
                : 'Completa los datos para agregar una copia al inventario.' }}
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="saving"
            @click="closeDialog"
          />
        </div>

        <v-divider class="mt-2" />

        <v-card-text class="pa-5">
          <v-form ref="formRef" @submit.prevent="saveCopy">
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
                  :rules="[value => !!value || 'Debes seleccionar un libro.']"
                  no-data-text="No hay libros disponibles"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="form.condition"
                  :items="conditionOptions"
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

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            variant="text"
            color="grey-darken-1"
            :disabled="saving"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="saving"
            @click="saveCopy"
          >
            {{ editingCopy ? 'Guardar cambios' : 'Registrar ejemplar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal cambiar estado -->
    <v-dialog
      v-model="statusDialog"
      max-width="440"
      persistent
    >
      <v-card rounded="lg">
        <div class="d-flex align-center justify-space-between px-5 pt-4 pb-2">
          <div>
            <div class="text-h6 font-weight-bold">Cambiar estado</div>
            <div class="text-caption text-medium-emphasis">
              Actualiza la disponibilidad del ejemplar.
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="changingStatus"
            @click="statusDialog = false"
          />
        </div>

        <v-divider class="mt-2" />

        <v-card-text class="pa-5">
          <div class="d-flex align-center ga-3 pa-3 rounded-lg bg-grey-lighten-4 mb-4">
            <v-avatar color="primary" variant="tonal" rounded="lg">
              <v-icon icon="mdi-book-outline" />
            </v-avatar>

            <div>
              <div class="text-caption text-medium-emphasis">
                Código del ejemplar
              </div>
              <div class="font-weight-bold">
                {{ selectedCopy?.copy_code }}
              </div>
            </div>
          </div>

          <v-select
            v-model="newStatus"
            :items="statusOptions"
            label="Nuevo estado"
            prepend-inner-icon="mdi-swap-horizontal"
            variant="outlined"
            density="compact"
            hide-details
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

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="changingStatus"
            @click="statusDialog = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
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
const formRef = ref(null);

const editingCopy = ref(null);
const selectedCopy = ref(null);
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
  { title: 'Libro', key: 'book', sortable: false },
  { title: 'Condición', key: 'condition', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
    align: 'end',
    minWidth: '130px',
  },
];

const requiredRules = [
  value => !!String(value ?? '').trim() || 'Este campo es obligatorio.',
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

async function deleteCopy(copy) {
  const confirmed = window.confirm(
    `¿Estás seguro de que deseas eliminar el ejemplar "${copy.copy_code}"?`,
  );

  if (!confirmed) return;

  deletingId.value = copy.id;

  try {
    await copiesService.delete(copy.id);

    showMessage('Ejemplar eliminado correctamente.');

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
.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.copies-table {
  min-width: 700px;
}

.copies-table :deep(th) {
  font-size: 12px !important;
  font-weight: 700 !important;
  white-space: nowrap;
  color: rgb(var(--v-theme-on-surface-variant));
}

.copies-table :deep(td) {
  font-size: 13px;
}

@media (max-width: 600px) {
  .page-container {
    padding-bottom: 12px;
  }

  .copies-table {
    min-width: 650px;
  }
}
</style>
