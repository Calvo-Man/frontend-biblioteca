
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="page-header">
      <div>
        <p class="page-description">
          Organiza los libros de la biblioteca por categorías.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="openCreateDialog"
      >
        Nueva categoría
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

    <!-- Búsqueda -->
    <v-card class="filter-card mb-3" rounded="lg" elevation="0">
      <v-card-text class="pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="7">
            <v-text-field
              v-model="search"
              label="Buscar categoría"
              placeholder="Escribe el nombre..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleSearch"
            />
          </v-col>

          <v-col cols="12" md="5">
            <div class="total-categories">
              <v-icon
                icon="mdi-shape-outline"
                color="primary"
                size="19"
              />
              <span>Total de categorías:</span>
              <strong>{{ total }}</strong>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card class="table-card" rounded="lg" elevation="0">
      <div class="table-header">
        <div>
          <span class="table-title">Listado de categorías</span>
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
          :items="categories"
          :loading="loading"
          item-value="id"
          hide-default-footer
          density="comfortable"
          class="categories-table"
          no-data-text="No hay categorías registradas"
          loading-text="Cargando categorías..."
        >
          <!-- Nombre -->
          <template #item.name="{ item }">
            <div class="category-cell">
              <v-avatar
                color="primary"
                variant="tonal"
                size="36"
                rounded="lg"
              >
                <v-icon icon="mdi-shape-outline" size="19" />
              </v-avatar>

              <span class="category-name">
                {{ item.name }}
              </span>
            </div>
          </template>

          <!-- Descripción -->
          <template #item.description="{ item }">
            <span class="description-cell">
              {{ item.description || 'Sin descripción' }}
            </span>
          </template>

          <!-- Estado -->
          <template #item.is_active="{ item }">
            <v-chip
              :color="item.is_active ? 'success' : 'grey'"
              size="x-small"
              variant="tonal"
            >
              <v-icon
                :icon="item.is_active
                  ? 'mdi-check-circle-outline'
                  : 'mdi-minus-circle-outline'"
                start
                size="12"
              />
              {{ item.is_active ? 'Activa' : 'Inactiva' }}
            </v-chip>
          </template>

          <!-- Fecha -->
          <template #item.created_at="{ item }">
            <span class="date-cell">
              {{ formatDate(item.created_at) }}
            </span>
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <div class="table-actions">
              <v-tooltip text="Editar categoría">
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

              <v-tooltip
                :text="item.is_active
                  ? 'Desactivar categoría'
                  : 'Activar categoría'"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="item.is_active
                      ? 'mdi-toggle-switch'
                      : 'mdi-toggle-switch-off-outline'"
                    size="x-small"
                    variant="tonal"
                    :color="item.is_active ? 'success' : 'grey'"
                    :loading="changingStatusId === item.id"
                    :disabled="changingStatusId !== null"
                    @click="openStatusDialog(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <!-- Sin resultados -->
          <template #no-data>
            <div class="empty-state">
              <v-icon
                icon="mdi-shape-outline"
                size="38"
                color="grey-lighten-1"
              />

              <strong>No se encontraron categorías</strong>

              <span>
                Prueba con otro término de búsqueda o registra una categoría nueva.
              </span>

              <v-btn
                v-if="search"
                size="small"
                color="primary"
                variant="text"
                @click="clearSearch"
              >
                Limpiar búsqueda
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
          Mostrando {{ categories.length }} de {{ total }} categorías
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

    <!-- Crear / editar categoría -->
    <v-dialog
      v-model="dialog"
      max-width="540"
      persistent
    >
      <v-card rounded="lg">
        <v-card-title class="dialog-header">
          <div>
            <h3>
              {{ editingCategory ? 'Editar categoría' : 'Nueva categoría' }}
            </h3>

            <p>
              {{ editingCategory
                ? 'Modifica la información de esta categoría.'
                : 'Registra una nueva categoría para organizar los libros.' }}
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
          <v-form ref="formRef" @submit.prevent="saveCategory">
            <div class="form-section-title mb-3">
              <v-icon icon="mdi-shape-outline" size="17" />
              Información de la categoría
            </div>

            <v-text-field
              v-model="form.name"
              label="Nombre de la categoría *"
              placeholder="Ej. Literatura"
              prepend-inner-icon="mdi-tag-outline"
              variant="outlined"
              density="compact"
              :rules="nameRules"
              maxlength="100"
              counter="100"
              hide-details="auto"
            />

            <v-textarea
              v-model="form.description"
              label="Descripción"
              placeholder="Describe brevemente esta categoría..."
              prepend-inner-icon="mdi-text-box-outline"
              variant="outlined"
              density="compact"
              rows="3"
              auto-grow
              maxlength="500"
              counter="500"
              class="mt-4"
              hide-details="auto"
            />
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
            @click="saveCategory"
          >
            {{ editingCategory ? 'Guardar cambios' : 'Crear categoría' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmar cambio de estado -->
    <v-dialog
      v-model="statusDialog"
      max-width="420"
      persistent
    >
      <v-card rounded="lg">
        <v-card-text class="delete-dialog-content">
          <v-avatar
            :color="categoryToChange?.is_active ? 'warning' : 'success'"
            variant="tonal"
            size="52"
            rounded="lg"
            class="mb-3"
          >
            <v-icon
              :icon="categoryToChange?.is_active
                ? 'mdi-toggle-switch-off-outline'
                : 'mdi-toggle-switch'"
              size="27"
            />
          </v-avatar>

          <h3 class="delete-dialog-title">
            {{ categoryToChange?.is_active
              ? '¿Desactivar categoría?'
              : '¿Activar categoría?' }}
          </h3>

          <p class="delete-dialog-description">
            ¿Estás seguro de que deseas
            {{ categoryToChange?.is_active ? 'desactivar' : 'activar' }}
            la categoría
            <strong>{{ categoryToChange?.name }}</strong>?
          </p>

          <v-alert
            :type="categoryToChange?.is_active ? 'warning' : 'info'"
            variant="tonal"
            density="compact"
            class="mt-4 text-left"
          >
            {{ categoryToChange?.is_active
              ? 'La categoría dejará de estar disponible para nuevas operaciones del catálogo.'
              : 'La categoría volverá a estar disponible para su uso en el catálogo.' }}
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="delete-dialog-actions">
          <v-spacer />

          <v-btn
            variant="text"
            size="small"
            :disabled="changingStatusId !== null"
            @click="closeStatusDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            :color="categoryToChange?.is_active ? 'warning' : 'success'"
            variant="flat"
            size="small"
            :prepend-icon="categoryToChange?.is_active
              ? 'mdi-toggle-switch-off-outline'
              : 'mdi-check'"
            :loading="changingStatusId !== null"
            @click="confirmToggleStatus"
          >
            {{ categoryToChange?.is_active ? 'Desactivar' : 'Activar' }}
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
import { categoriesService } from '../../services/categories';

const categories = ref([]);

const loading = ref(false);
const saving = ref(false);
const changingStatusId = ref(null);

const search = ref('');
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(1);

const dialog = ref(false);
const statusDialog = ref(false);

const formRef = ref(null);
const editingCategory = ref(null);
const categoryToChange = ref(null);

const pageError = ref('');

const form = reactive({
  name: '',
  description: '',
});

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

let searchTimeout = null;

const headers = [
  { title: 'Nombre', key: 'name', sortable: false, minWidth: '180px' },
  { title: 'Descripción', key: 'description', sortable: false, minWidth: '220px' },
  { title: 'Estado', key: 'is_active', sortable: false },
  { title: 'Fecha de creación', key: 'created_at', sortable: false },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
    align: 'center',
    minWidth: '100px',
  },
];

const nameRules = [
  value => !!value?.trim() || 'El nombre es obligatorio.',
  value => value?.trim().length <= 100 || 'Máximo 100 caracteres.',
];

function showMessage(message, color = 'success') {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
}

function formatDate(date) {
  if (!date) return 'Sin fecha';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha';
  }

  return parsedDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;

  return Array.isArray(message)
    ? message.join(', ')
    : message || fallback;
}

async function loadCategories() {
  loading.value = true;
  pageError.value = '';

  try {
    const response = await categoriesService.getAll({
      page: page.value,
      limit: limit.value,
      search: search.value?.trim() || undefined,
    });

    categories.value = Array.isArray(response.data)
      ? response.data
      : [];

    total.value = response.total ?? 0;
    totalPages.value = Math.max(1, response.totalPages ?? 1);

    if (page.value > totalPages.value) {
      page.value = totalPages.value;
      await loadCategories();
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);

    categories.value = [];
    total.value = 0;
    totalPages.value = 1;

    pageError.value = getErrorMessage(
      error,
      'No se pudieron cargar las categorías.',
    );
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadCategories();
  }, 350);
}

function clearSearch() {
  clearTimeout(searchTimeout);
  search.value = '';
  page.value = 1;
  loadCategories();
}

function changeLimit() {
  page.value = 1;
  loadCategories();
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
  loadCategories();
}

function resetForm() {
  form.name = '';
  form.description = '';
  editingCategory.value = null;

  formRef.value?.resetValidation();
}

function openCreateDialog() {
  resetForm();
  dialog.value = true;
}

function openEditDialog(category) {
  resetForm();

  editingCategory.value = category;

  form.name = category.name || '';
  form.description = category.description || '';

  dialog.value = true;
}

function closeDialog() {
  if (saving.value) return;

  dialog.value = false;
  resetForm();
}

async function saveCategory() {
  const validation = await formRef.value?.validate();

  if (!validation?.valid) return;

  saving.value = true;

  const categoryData = {
    name: form.name.trim(),
    description: form.description.trim() || null,
  };

  try {
    if (editingCategory.value) {
      await categoriesService.update(
        editingCategory.value.id,
        categoryData,
      );

      showMessage('Categoría actualizada correctamente.');
    } else {
      await categoriesService.create(categoryData);

      showMessage('Categoría creada correctamente.');
    }

    dialog.value = false;
    resetForm();

    await loadCategories();
  } catch (error) {
    console.error('Error al guardar categoría:', error);

    showMessage(
      getErrorMessage(error, 'No se pudo guardar la categoría.'),
      'error',
    );
  } finally {
    saving.value = false;
  }
}

/* Activar / desactivar categoría */
function openStatusDialog(category) {
  categoryToChange.value = category;
  statusDialog.value = true;
}

function closeStatusDialog() {
  if (changingStatusId.value !== null) return;

  statusDialog.value = false;
  categoryToChange.value = null;
}

async function confirmToggleStatus() {
  if (!categoryToChange.value || changingStatusId.value !== null) {
    return;
  }

  const category = categoryToChange.value;
  changingStatusId.value = category.id;

  try {
    await categoriesService.toggleStatus(category.id);

    showMessage(
      `Categoría ${category.is_active ? 'desactivada' : 'activada'} correctamente.`,
    );

    statusDialog.value = false;
    categoryToChange.value = null;

    await loadCategories();
  } catch (error) {
    console.error('Error al cambiar estado:', error);

    showMessage(
      getErrorMessage(error, 'No se pudo cambiar el estado de la categoría.'),
      'error',
    );
  } finally {
    changingStatusId.value = null;
  }
}

onMounted(() => {
  loadCategories();
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

/* Total */
.total-categories {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: #8995a3;
  font-size: 12px;
}

.total-categories strong {
  color: #263648;
  font-size: 14px;
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

.categories-table {
  min-width: 760px;
}

.categories-table :deep(th) {
  height: 42px !important;
  color: #7b8795 !important;
  background: #f8fafc;
  font-size: 10px !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.categories-table :deep(td) {
  height: 57px !important;
  color: #526173;
  font-size: 11px;
}

.categories-table :deep(tbody tr:hover) {
  background: #f8fafc;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}

.category-name {
  color: #263648;
  font-size: 11px;
  font-weight: 600;
}

.description-cell {
  display: block;
  max-width: 340px;
  overflow: hidden;
  color: #8995a3;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-cell {
  color: #8995a3;
  font-size: 11px;
  white-space: nowrap;
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

/* Confirmación */
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

  .total-categories {
    justify-content: flex-start;
    padding-top: 5px;
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
