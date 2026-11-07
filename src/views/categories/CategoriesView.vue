
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
      <div>
        <p class="text-body-2 text-medium-emphasis mt-1">
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

    <!-- Búsqueda -->
    <v-card rounded="lg" elevation="0" border class="mb-4">
      <v-card-text class="pa-3">
        <v-row align="center" dense>
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
            <div class="d-flex align-center justify-md-end ga-2">
              <v-icon
                icon="mdi-shape-outline"
                color="primary"
                size="20"
              />
              <span class="text-body-2 text-medium-emphasis">
                Total de categorías:
              </span>
              <span class="font-weight-bold text-body-1">
                {{ total }}
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card rounded="lg" elevation="0" border>
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 px-4 py-3">
        <div>
          <div class="font-weight-bold text-body-1">
            Listado de categorías
          </div>
          <div class="text-caption text-medium-emphasis">
            Administra las categorías disponibles en el catálogo.
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
          :items="categories"
          :loading="loading"
          item-value="id"
          hide-default-footer
          density="comfortable"
          class="categories-table"
          no-data-text="No hay categorías registradas"
          loading-text="Cargando categorías..."
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center ga-2 py-1">
              <v-avatar
                color="primary"
                variant="tonal"
                size="34"
                rounded="lg"
              >
                <v-icon icon="mdi-shape-outline" size="18" />
              </v-avatar>

              <span class="font-weight-medium">
                {{ item.name }}
              </span>
            </div>
          </template>

          <template #item.description="{ item }">
            <span class="text-medium-emphasis description-cell">
              {{ item.description || 'Sin descripción' }}
            </span>
          </template>

          <template #item.is_active="{ item }">
            <v-chip
              :color="item.is_active ? 'success' : 'grey'"
              size="small"
              variant="tonal"
            >
              <v-icon
                :icon="item.is_active ? 'mdi-check-circle-outline' : 'mdi-minus-circle-outline'"
                start
                size="14"
              />
              {{ item.is_active ? 'Activa' : 'Inactiva' }}
            </v-chip>
          </template>

          <template #item.created_at="{ item }">
            <span class="text-body-2 text-medium-emphasis text-no-wrap">
              {{ formatDate(item.created_at) }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end ga-1">
              <v-tooltip text="Editar categoría">
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

              <v-tooltip :text="item.is_active ? 'Desactivar categoría' : 'Activar categoría'">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="item.is_active ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'"
                    size="small"
                    variant="text"
                    :color="item.is_active ? 'success' : 'grey'"
                    :loading="changingStatusId === item.id"
                    :disabled="changingStatusId !== null"
                    @click="toggleStatus(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon
                icon="mdi-shape-outline"
                size="38"
                color="grey-lighten-1"
                class="mb-2"
              />
              <div class="text-body-2 font-weight-medium">
                No se encontraron categorías
              </div>
              <div class="text-caption text-medium-emphasis">
                Prueba con otro término de búsqueda o crea una categoría nueva.
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
          Mostrando {{ categories.length }} de {{ total }} categorías
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
            @update:model-value="loadCategories"
          />
        </div>
      </div>
    </v-card>

    <!-- Modal crear / editar -->
    <v-dialog
      v-model="dialog"
      max-width="540"
      persistent
    >
      <v-card rounded="lg">
        <div class="d-flex align-center justify-space-between px-5 pt-4 pb-2">
          <div>
            <div class="text-h6 font-weight-bold">
              {{ editingCategory ? 'Editar categoría' : 'Nueva categoría' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ editingCategory
                ? 'Modifica la información de esta categoría.'
                : 'Registra una nueva categoría para organizar los libros.' }}
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
          <v-form ref="formRef" @submit.prevent="saveCategory">
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
              autofocus
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
            @click="saveCategory"
          >
            {{ editingCategory ? 'Guardar cambios' : 'Crear categoría' }}
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
const formRef = ref(null);
const editingCategory = ref(null);

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
    align: 'end',
    minWidth: '110px',
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
  } catch (error) {
    console.error('Error al cargar categorías:', error);

    categories.value = [];
    total.value = 0;
    totalPages.value = 1;

    showMessage(
      getErrorMessage(error, 'No se pudieron cargar las categorías.'),
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
    loadCategories();
  }, 350);
}

function changeLimit() {
  page.value = 1;
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

async function toggleStatus(category) {
  const action = category.is_active ? 'desactivar' : 'activar';

  const confirmed = window.confirm(
    `¿Estás seguro de que deseas ${action} la categoría "${category.name}"?`,
  );

  if (!confirmed) return;

  changingStatusId.value = category.id;

  try {
    await categoriesService.toggleStatus(category.id);

    showMessage(
      `Categoría ${category.is_active ? 'desactivada' : 'activada'} correctamente.`,
    );

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
.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.categories-table {
  min-width: 700px;
}

.categories-table :deep(th) {
  font-size: 12px !important;
  font-weight: 700 !important;
  white-space: nowrap;
  color: rgb(var(--v-theme-on-surface-variant));
}

.categories-table :deep(td) {
  font-size: 13px;
}

.description-cell {
  display: block;
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .categories-table {
    min-width: 650px;
  }
}
</style>
