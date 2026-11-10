
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="page-header">
      <div>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Administra el catálogo de libros de la biblioteca.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="openCreateDialog"
      >
        Nuevo libro
      </v-btn>
    </div>

    <!-- Mensajes -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-3"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      density="compact"
      closable
      class="mb-3"
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <!-- Filtros -->
    <v-card class="filter-card mb-3" rounded="lg" elevation="0">
      <v-card-text class="pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Buscar libros"
              placeholder="Título, autor, ISBN o categoría..."
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="statusFilter"
              label="Estado"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-filter-variant"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card class="table-card" rounded="lg" elevation="0">
      <div class="table-header">
        <div>
          <span class="table-title">Catálogo de libros</span>
          <span class="table-count">{{ total }} registros</span>
        </div>
      </div>

      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        height="2"
      />

      <div class="table-scroll">
        <v-table class="books-table" density="comfortable">
          <thead>
            <tr>
              <th>Libro</th>
              <th>Autor</th>
              <th>Categoría</th>
              <th>ISBN</th>
              <th>Año</th>
              <th class="text-center">Ejemplares</th>
              <th class="text-center">Disponibles</th>
              <th>Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="book in filteredBooks" :key="book.id">
              <td>
                <div class="book-cell">
                  <v-avatar
                    rounded="sm"
                    size="38"
                    color="grey-lighten-3"
                    class="book-cover"
                  >
                    <v-img
                      v-if="book.cover_image"
                      :src="getCoverUrl(book.cover_image)"
                      cover
                    />

                    <v-icon
                      v-else
                      icon="mdi-book-outline"
                      color="grey"
                      size="20"
                    />
                  </v-avatar>

                  <div class="book-information">
                    <span class="book-name">{{ book.title }}</span>
                    <span class="book-publisher">
                      {{ book.publisher || 'Sin editorial' }}
                    </span>
                  </div>
                </div>
              </td>

              <td>{{ book.author }}</td>

              <td>
                <v-chip size="x-small" color="primary" variant="tonal">
                  {{ book.category?.name || 'Sin categoría' }}
                </v-chip>
              </td>

              <td>{{ book.isbn || 'N/A' }}</td>

              <td>{{ book.publication_year || 'N/A' }}</td>

              <td class="text-center">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ book.total_copies ?? 0 }}
                </v-chip>
              </td>

              <td class="text-center">
                <v-chip
                  size="small"
                  :color="Number(book.available_copies) > 0 ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ book.available_copies ?? 0 }}
                </v-chip>
              </td>

              <td>
                <v-chip
                  size="x-small"
                  :color="book.is_active ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ book.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </td>

              <td>
                <div class="table-actions">
                  <v-tooltip text="Ver detalles">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-eye-outline"
                        size="x-small"
                        variant="tonal"
                        color="info"
                        @click="openDetailsDialog(book)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Editar libro">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-pencil-outline"
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        @click="openEditDialog(book)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip
                    :text="book.is_active ? 'Desactivar libro' : 'Activar libro'"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :icon="book.is_active
                          ? 'mdi-book-cancel-outline'
                          : 'mdi-book-check-outline'"
                        size="x-small"
                        variant="tonal"
                        :color="book.is_active ? 'error' : 'success'"
                        @click="openStatusDialog(book)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>

            <!-- Estado vacío -->
            <tr v-if="!loading && filteredBooks.length === 0">
              <td colspan="9">
                <div class="empty-state">
                  <v-icon
                    icon="mdi-book-search-outline"
                    size="38"
                    color="grey-lighten-1"
                  />

                  <strong>No se encontraron libros</strong>

                  <span>
                    Prueba con otro término de búsqueda o cambia el filtro.
                  </span>

                  <v-btn
                    v-if="search || statusFilter !== 'all'"
                    size="small"
                    color="primary"
                    variant="text"
                    @click="clearFilters"
                  >
                    Limpiar filtros
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Paginación -->
      <v-divider />

      <div class="pagination">
        <span class="pagination-info">
          {{ total }} libros registrados
        </span>

        <div class="pagination-controls">
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

    <!-- Crear / editar libro -->
    <v-dialog
      v-model="dialog"
      max-width="680"
      persistent
      scrollable
    >
      <v-card rounded="lg">
        <v-card-title class="dialog-header">
          <div>
            <h3>
              {{ editingBook ? 'Editar libro' : 'Registrar libro' }}
            </h3>

            <p>
              {{ editingBook
                ? 'Modifica la información del libro.'
                : 'Completa los datos para agregarlo al catálogo.' }}
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
          <v-form ref="bookForm" @submit.prevent="saveBook">
            <!-- Portada -->
            <div class="form-section">
              <div class="form-section-title">
                <v-icon icon="mdi-image-outline" size="17" />
                Portada del libro
              </div>

              <div class="cover-section">
                <div class="cover-preview">
                  <v-img
                    v-if="coverPreview"
                    :src="coverPreview"
                    cover
                    width="88"
                    height="116"
                  />

                  <div v-else class="cover-placeholder">
                    <v-icon
                      icon="mdi-book-open-page-variant"
                      size="30"
                    />
                    <span>Sin portada</span>
                  </div>
                </div>

                <div class="cover-controls">
                  <v-file-input
                    v-model="coverFile"
                    label="Seleccionar portada"
                    accept="image/jpeg,image/png,image/webp"
                    prepend-inner-icon="mdi-image-plus-outline"
                    prepend-icon=""
                    variant="outlined"
                    density="compact"
                    show-size
                    :rules="[rules.cover]"
                    clearable
                    hide-details="auto"
                  />

                  <p class="helper-text">
                    JPG, PNG o WEBP. Tamaño máximo: 5 MB.
                  </p>

                  <p class="helper-text">
                    {{ editingBook
                      ? 'Si no seleccionas otra imagen, se conservará la portada actual.'
                      : 'La portada es opcional.' }}
                  </p>
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <!-- Información general -->
            <div class="form-section-title mb-3">
              <v-icon icon="mdi-book-information-variant" size="17" />
              Información del libro
            </div>

            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.title"
                  label="Título *"
                  :rules="[rules.required, rules.max200]"
                  maxlength="200"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.author"
                  label="Autor *"
                  :rules="[rules.required, rules.max150]"
                  maxlength="150"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.publisher"
                  label="Editorial"
                  maxlength="150"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.isbn"
                  label="ISBN"
                  maxlength="20"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.publication_year"
                  label="Año de publicación"
                  type="number"
                  :rules="[rules.year]"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="form.category_id"
                  label="Categoría *"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  :loading="loadingCategories"
                  :rules="[rules.required]"
                  no-data-text="No se encontraron categorías"
                  placeholder="Escribe para buscar una categoría..."
                  prepend-inner-icon="mdi-shape-outline"
                  density="compact"
                  variant="outlined"
                  clearable
                  hide-details="auto"
                  auto-select-first
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Descripción"
                  rows="2"
                  auto-grow
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
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
            :loading="saving"
            prepend-icon="mdi-content-save-outline"
            @click="saveBook"
          >
            {{ editingBook ? 'Guardar cambios' : 'Registrar libro' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Detalles del libro -->
    <v-dialog
      v-model="detailsDialog"
      max-width="650"
      scrollable
    >
      <v-card rounded="lg">
        <v-card-title class="dialog-header">
          <div>
            <h3>Detalles del libro</h3>
            <p>Información general y disponibilidad de ejemplares.</p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedBook" class="details-content">
          <div class="details-book-header">
            <div class="details-cover">
              <v-img
                v-if="selectedBook.cover_image"
                :src="getCoverUrl(selectedBook.cover_image)"
                cover
                height="150"
                width="112"
              />

              <div v-else class="details-cover-placeholder">
                <v-icon icon="mdi-book-open-page-variant" size="38" />
                <span>Sin portada</span>
              </div>
            </div>

            <div class="details-book-info">
              <h3>{{ selectedBook.title }}</h3>
              <p>{{ selectedBook.author }}</p>

              <v-chip
                size="small"
                :color="selectedBook.is_active ? 'success' : 'error'"
                variant="tonal"
                class="mt-2"
              >
                {{ selectedBook.is_active ? 'Activo' : 'Inactivo' }}
              </v-chip>

              <span class="details-publisher">
                {{ selectedBook.publisher || 'Sin editorial' }}
              </span>
            </div>
          </div>

          <v-divider class="my-4" />

          <div class="details-section-title">
            <v-icon icon="mdi-book-information-variant" size="18" />
            Información bibliográfica
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span>ISBN</span>
              <strong>{{ selectedBook.isbn || 'No registrado' }}</strong>
            </div>

            <div class="detail-item">
              <span>Año de publicación</span>
              <strong>
                {{ selectedBook.publication_year || 'No registrado' }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Categoría</span>
              <strong>
                {{ selectedBook.category?.name || 'Sin categoría' }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Editorial</span>
              <strong>
                {{ selectedBook.publisher || 'No registrada' }}
              </strong>
            </div>
          </div>

          <v-divider class="my-4" />

          <div class="details-section-title">
            <v-icon icon="mdi-bookshelf" size="18" />
            Inventario de ejemplares
          </div>

          <v-row dense class="mt-2">
            <v-col cols="4">
              <div class="inventory-card">
                <span>Total</span>
                <strong>{{ selectedBook.total_copies ?? 0 }}</strong>
                <small>Ejemplares</small>
              </div>
            </v-col>

            <v-col cols="4">
              <div class="inventory-card available">
                <span>Disponibles</span>
                <strong>{{ selectedBook.available_copies ?? 0 }}</strong>
                <small>Para préstamo</small>
              </div>
            </v-col>

            <v-col cols="4">
              <div class="inventory-card unavailable">
                <span>No disponibles</span>
                <strong>
                  {{
                    Math.max(
                      0,
                      Number(selectedBook.total_copies || 0) -
                      Number(selectedBook.available_copies || 0)
                    )
                  }}
                </strong>
                <small>En otras condiciones</small>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="details-section-title">
            <v-icon icon="mdi-text-box-outline" size="18" />
            Descripción
          </div>

          <p class="details-description">
            {{
              selectedBook.description ||
              'Este libro no tiene una descripción registrada.'
            }}
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions">
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

    <!-- Confirmar cambio de estado -->
    <v-dialog v-model="statusDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-text class="status-dialog-content">
          <v-avatar
            :color="selectedBook?.is_active ? 'error' : 'success'"
            size="52"
            class="mb-3"
          >
            <v-icon
              :icon="selectedBook?.is_active
                ? 'mdi-book-cancel-outline'
                : 'mdi-book-check-outline'"
              color="white"
              size="25"
            />
          </v-avatar>

          <h3>
            {{ selectedBook?.is_active
              ? '¿Desactivar libro?'
              : '¿Activar libro?' }}
          </h3>

          <p class="selected-book-name">
            {{ selectedBook?.title }}
          </p>

          <p class="status-description">
            {{ selectedBook?.is_active
              ? 'El libro dejará de estar activo en el catálogo.'
              : 'El libro volverá a estar activo en el catálogo.' }}
          </p>
        </v-card-text>

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
            :color="selectedBook?.is_active ? 'error' : 'success'"
            size="small"
            :loading="changingStatus"
            @click="toggleBookStatus"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue';

import { booksService } from '../../services/books';
import { categoriesService } from '../../services/categories';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '');

const books = ref([]);
const categories = ref([]);

const loading = ref(false);
const loadingCategories = ref(false);
const saving = ref(false);
const changingStatus = ref(false);

const errorMessage = ref('');
const successMessage = ref('');

const search = ref('');
const statusFilter = ref('all');

const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(1);

const dialog = ref(false);
const detailsDialog = ref(false);
const statusDialog = ref(false);

const editingBook = ref(null);
const selectedBook = ref(null);

const bookForm = ref(null);
const coverFile = ref(null);
const coverPreview = ref('');
const originalCover = ref('');

let searchTimeout = null;
let previewObjectUrl = null;

const statusOptions = [
  { title: 'Todos los estados', value: 'all' },
  { title: 'Activos', value: 'active' },
  { title: 'Inactivos', value: 'inactive' },
];

const emptyForm = () => ({
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  publication_year: null,
  description: '',
  category_id: null,
});

const form = reactive(emptyForm());

const rules = {
  required: value => (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ''
  ) || 'Este campo es obligatorio.',

  max200: value =>
    !value || value.length <= 200 ||
    'Máximo 200 caracteres.',

  max150: value =>
    !value || value.length <= 150 ||
    'Máximo 150 caracteres.',

  year: value => {
    if (value === null || value === '') return true;

    const year = Number(value);

    return (
      Number.isInteger(year) &&
      year >= 1000 &&
      year <= 9999
    ) || 'Ingresa un año válido de cuatro cifras.';
  },

  cover: value => {
    if (!value) return true;

    const file = Array.isArray(value) ? value[0] : value;

    if (!file) return true;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten imágenes JPG, PNG o WEBP.';
    }

    return file.size <= 5 * 1024 * 1024 ||
      'La imagen no puede superar los 5 MB.';
  },
};

const filteredBooks = computed(() => {
  if (statusFilter.value === 'active') {
    return books.value.filter(book => book.is_active);
  }

  if (statusFilter.value === 'inactive') {
    return books.value.filter(book => !book.is_active);
  }

  return books.value;
});

watch(search, () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadBooks();
  }, 400);
});

watch(statusFilter, () => {
  page.value = 1;
});

watch(coverFile, value => {
  clearPreviewUrl();

  const file = Array.isArray(value) ? value[0] : value;

  if (file instanceof File) {
    previewObjectUrl = URL.createObjectURL(file);
    coverPreview.value = previewObjectUrl;
  } else {
    coverPreview.value = originalCover.value;
  }
});

function getCoverUrl(path) {
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function clearPreviewUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
}

function resetCover() {
  clearPreviewUrl();
  coverFile.value = null;
  coverPreview.value = '';
  originalCover.value = '';
}

function clearFilters() {
  search.value = '';
  statusFilter.value = 'all';
  page.value = 1;
  loadBooks();
}

async function loadBooks() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await booksService.getAll({
      page: page.value,
      limit: limit.value,
      search: search.value.trim() || undefined,
    });

    books.value = response.data || [];
    total.value = response.total || 0;
    totalPages.value = Math.max(1, response.totalPages || 1);
  } catch (error) {
    console.error('Error al cargar libros:', error);

    errorMessage.value =
      error.response?.data?.message ||
      'No fue posible cargar los libros.';
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  loadingCategories.value = true;

  try {
    const response = await categoriesService.getAll({
      page: 1,
      limit: 100,
    });

    const categoryList = Array.isArray(response)
      ? response
      : response.data || [];

    categories.value = categoryList.filter(
      category => category.is_active
    );
  } catch (error) {
    console.error('Error al cargar categorías:', error);

    errorMessage.value =
      'No fue posible cargar las categorías.';
  } finally {
    loadingCategories.value = false;
  }
}

function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return;

  page.value = newPage;
  loadBooks();
}

function resetForm() {
  Object.assign(form, emptyForm());

  editingBook.value = null;

  resetCover();

  bookForm.value?.resetValidation();
}

function openCreateDialog() {
  resetForm();
  dialog.value = true;
}

function openEditDialog(book) {
  resetForm();

  editingBook.value = book;

  Object.assign(form, {
    title: book.title || '',
    author: book.author || '',
    publisher: book.publisher || '',
    isbn: book.isbn || '',
    publication_year: book.publication_year || null,
    description: book.description || '',
    category_id: book.category_id || book.category?.id || null,
  });

  originalCover.value = book.cover_image
    ? getCoverUrl(book.cover_image)
    : '';

  coverPreview.value = originalCover.value;

  dialog.value = true;
}

function openDetailsDialog(book) {
  selectedBook.value = book;
  detailsDialog.value = true;
}

function closeDialog() {
  if (saving.value) return;

  dialog.value = false;
  resetForm();
}

async function saveBook() {
  const validation = await bookForm.value?.validate();

  if (!validation?.valid) return;

  saving.value = true;
  errorMessage.value = '';

  try {
    const bookData = new FormData();

    bookData.append('title', form.title.trim());
    bookData.append('author', form.author.trim());
    bookData.append('category_id', String(form.category_id));

    if (form.publisher.trim()) {
      bookData.append('publisher', form.publisher.trim());
    }

    if (form.isbn.trim()) {
      bookData.append('isbn', form.isbn.trim());
    }

    if (
      form.publication_year !== null &&
      form.publication_year !== ''
    ) {
      bookData.append(
        'publication_year',
        String(form.publication_year),
      );
    }

    if (form.description.trim()) {
      bookData.append('description', form.description.trim());
    }

    const selectedFile = Array.isArray(coverFile.value)
      ? coverFile.value[0]
      : coverFile.value;

    if (selectedFile instanceof File) {
      bookData.append('cover', selectedFile);
    }

    if (editingBook.value) {
      await booksService.update(editingBook.value.id, bookData);
      successMessage.value = 'Libro actualizado correctamente.';
    } else {
      await booksService.create(bookData);
      successMessage.value = 'Libro registrado correctamente.';
    }

    dialog.value = false;
    resetForm();

    await loadBooks();
  } catch (error) {
    console.error('Error al guardar libro:', error);

    const message = error.response?.data?.message;

    errorMessage.value = Array.isArray(message)
      ? message.join(', ')
      : message || 'No fue posible guardar el libro.';
  } finally {
    saving.value = false;
  }
}

function openStatusDialog(book) {
  selectedBook.value = book;
  statusDialog.value = true;
}

async function toggleBookStatus() {
  if (!selectedBook.value) return;

  changingStatus.value = true;
  errorMessage.value = '';

  try {
    await booksService.toggleStatus(selectedBook.value.id);

    successMessage.value = selectedBook.value.is_active
      ? 'Libro desactivado correctamente.'
      : 'Libro activado correctamente.';

    statusDialog.value = false;
    selectedBook.value = null;

    await loadBooks();
  } catch (error) {
    console.error('Error al cambiar estado:', error);

    errorMessage.value =
      error.response?.data?.message ||
      'No fue posible cambiar el estado del libro.';
  } finally {
    changingStatus.value = false;
  }
}

onMounted(() => {
  loadBooks();
  loadCategories();
});

onUnmounted(() => {
  clearTimeout(searchTimeout);
  clearPreviewUrl();
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

/* Filtros */
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

.books-table {
  min-width: 1100px;
}

.books-table :deep(th) {
  height: 42px !important;
  color: #7b8795 !important;
  background: #f8fafc;
  font-size: 10px !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.books-table :deep(td) {
  height: 57px !important;
  color: #526173;
  font-size: 11px;
}

.books-table :deep(tbody tr:hover) {
  background: #f8fafc;
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 190px;
  padding: 5px 0;
}

.book-cover {
  flex-shrink: 0;
  border: 1px solid #e9edf2;
}

.book-information {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.book-name {
  max-width: 230px;
  overflow: hidden;
  color: #263648;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-publisher {
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
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
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

.cover-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.cover-preview {
  width: 88px;
  height: 116px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #f1f5f9;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: 100%;
  color: #94a3b8;
  font-size: 10px;
}

.cover-controls {
  flex: 1;
  min-width: 0;
}

.helper-text {
  margin-top: 6px;
  color: #8995a3;
  font-size: 10px;
  line-height: 1.4;
}

/* Detalles */
.details-content {
  padding: 20px;
}

.details-book-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.details-cover {
  width: 112px;
  height: 150px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f1f5f9;
}

.details-cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  color: #94a3b8;
  font-size: 10px;
}

.details-book-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.details-book-info h3 {
  color: #263648;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

.details-book-info p {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.details-publisher {
  margin-top: 8px;
  color: #8995a3;
  font-size: 11px;
}

.details-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
  margin-top: 17px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.detail-item span {
  color: #8995a3;
  font-size: 10px;
}

.detail-item strong {
  overflow-wrap: anywhere;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.inventory-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 13px 5px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  text-align: center;
}

.inventory-card span {
  color: #64748b;
  font-size: 10px;
}

.inventory-card strong {
  color: #334155;
  font-size: 23px;
  font-weight: 700;
}

.inventory-card small {
  color: #94a3b8;
  font-size: 9px;
}

.inventory-card.available {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.inventory-card.available strong {
  color: #15803d;
}

.inventory-card.unavailable {
  border-color: #fed7aa;
  background: #fff7ed;
}

.inventory-card.unavailable strong {
  color: #c2410c;
}

.details-description {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-line;
}

/* Confirmación */
.status-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 22px 12px;
  text-align: center;
}

.status-dialog-content h3 {
  color: #263648;
  font-size: 16px;
  font-weight: 700;
}

.selected-book-name {
  margin-top: 8px;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.status-description {
  margin-top: 7px;
  color: #8995a3;
  font-size: 11px;
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

  .cover-section {
    align-items: flex-start;
    gap: 12px;
  }

  .cover-preview {
    width: 75px;
    height: 100px;
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

  .details-content {
    padding: 15px;
  }

  .details-book-header {
    gap: 13px;
  }

  .details-cover {
    width: 90px;
    height: 125px;
  }

  .details-book-info h3 {
    font-size: 14px;
  }

  .details-grid {
    gap: 12px;
  }

  .inventory-card {
    padding: 10px 3px;
  }

  .inventory-card strong {
    font-size: 19px;
  }
}
</style>
