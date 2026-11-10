
<template>
  <div class="catalog-page">
    <!-- Encabezado -->
    <div class="page-heading">
      <div>
        <div class="heading-label">BIBLIOTECA ESCOLAR</div>
        <p>Explora los libros disponibles en nuestra biblioteca.</p>
      </div>

      <div class="total-books">
        <v-icon icon="mdi-book-multiple-outline" size="24" />
        <div>
          <strong>{{ totalBooks }}</strong>
          <span>Libros registrados</span>
        </div>
      </div>
    </div>

    <!-- Búsqueda -->
    <v-card class="search-card" elevation="0">
      <v-text-field
        v-model="search"
        placeholder="Buscar por título, autor, ISBN o categoría..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        clearable
        @click:clear="handleSearch"
        @keyup.enter="handleSearch"
      />

      <v-btn
        color="primary"
        height="44"
        :loading="loading"
        @click="handleSearch"
      >
        Buscar
      </v-btn>
    </v-card>

    <!-- Encabezado de resultados -->
    <div class="results-heading">
      <div>
        <h2>Explorar colección</h2>
        <span>{{ totalBooks }} libros encontrados</span>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular
        indeterminate
        color="primary"
        size="42"
      />
      <p>Cargando catálogo...</p>
    </div>

    <!-- Error -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-5"
    >
      {{ error }}

      <template #append>
        <v-btn variant="text" @click="loadBooks">
          Reintentar
        </v-btn>
      </template>
    </v-alert>

    <template v-else>
      <!-- Lista de libros -->
      <v-card
        v-if="books.length"
        class="catalog-table-card"
        elevation="0"
      >
        <div class="table-scroll">
          <v-table class="catalog-table">
            <thead>
              <tr>
                <th class="book-column">LIBRO</th>
                <th>CATEGORÍA</th>
                <th>DISPONIBILIDAD</th>
                <th>ESTADO</th>
                <th class="actions-column">ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="book in books"
                :key="book.id"
              >
                <!-- Libro -->
                <td>
                  <div class="book-cell">
                    <div class="book-thumbnail">
                      <v-img
                        v-if="book.cover_image"
                        :src="getCoverUrl(book.cover_image)"
                        width="48"
                        height="62"
                        cover
                      >
                        <template #error>
                          <div class="thumbnail-placeholder">
                            <v-icon
                              icon="mdi-book-open-page-variant"
                              size="23"
                            />
                          </div>
                        </template>
                      </v-img>

                      <div
                        v-else
                        class="thumbnail-placeholder"
                      >
                        <v-icon
                          icon="mdi-book-open-page-variant"
                          size="23"
                        />
                      </div>
                    </div>

                    <div class="book-description">
                      <strong>{{ book.title }}</strong>
                      <span>
                        <v-icon
                          icon="mdi-account-outline"
                          size="14"
                        />
                        {{ book.author || 'Autor no registrado' }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Categoría -->
                <td>
                  <span class="category-label">
                    {{ book.category?.name || 'Sin categoría' }}
                  </span>
                </td>

                <!-- Disponibilidad -->
                <td>
                  <div class="availability-cell">
                    <v-icon
                      icon="mdi-book-multiple-outline"
                      size="18"
                    />
                    <strong>{{ book.available_copies || 0 }}</strong>
                    <span>
                      {{
                        book.available_copies === 1
                          ? 'ejemplar'
                          : 'ejemplares'
                      }}
                    </span>
                  </div>
                </td>

                <!-- Estado -->
                <td>
                  <v-chip
                    :color="book.available_copies > 0 ? 'success' : 'error'"
                    variant="tonal"
                    size="small"
                  >
                    {{
                      book.available_copies > 0
                        ? 'Disponible'
                        : 'No disponible'
                    }}
                  </v-chip>
                </td>

                <!-- Acciones -->
                <td>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    class="details-button"
                    prepend-icon="mdi-eye-outline"
                    @click="openBookDetails(book)"
                  >
                    Ver detalles
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- Pie de tabla -->
        <div class="table-footer">
          <span>
            Mostrando {{ books.length }} de {{ totalBooks }} libros
          </span>
        </div>
      </v-card>

      <!-- Sin resultados -->
      <div v-else class="empty-state">
        <v-icon
          icon="mdi-book-search-outline"
          size="75"
        />

        <h3>No encontramos libros</h3>

        <p>
          No hay libros que coincidan con tu búsqueda.
          Intenta con otro título o autor.
        </p>

        <v-btn
          color="primary"
          variant="tonal"
          @click="clearSearch"
        >
          Ver todo el catálogo
        </v-btn>
      </div>

      <!-- Paginación -->
      <div
        v-if="totalPages > 1"
        class="pagination-container"
      >
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          rounded="lg"
          color="primary"
          @update:model-value="loadBooks"
        />
      </div>
    </template>

    <!-- Detalles del libro -->
    <v-dialog
      v-model="detailsDialog"
      max-width="700"
      scrollable
    >
      <v-card v-if="selectedBook" class="details-dialog">
        <v-card-title class="dialog-header">
          <span>Información del libro</span>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="details-content">
          <div class="details-layout">
            <div class="details-cover">
              <v-img
                v-if="selectedBook.cover_image"
                :src="getCoverUrl(selectedBook.cover_image)"
                height="260"
                width="180"
                cover
                class="rounded-lg"
              >
                <template #error>
                  <div class="cover-placeholder">
                    <v-icon
                      icon="mdi-book-open-page-variant"
                      size="65"
                    />
                  </div>
                </template>
              </v-img>

              <div
                v-else
                class="cover-placeholder details-placeholder"
              >
                <v-icon
                  icon="mdi-book-open-page-variant"
                  size="65"
                />
                <span>Sin portada</span>
              </div>
            </div>

            <div class="details-information">
              <div class="book-category">
                {{ selectedBook.category?.name || 'Sin categoría' }}
              </div>

              <h2>{{ selectedBook.title }}</h2>

              <p class="details-author">
                {{ selectedBook.author }}
              </p>

              <v-chip
                :color="selectedBook.available_copies > 0 ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                {{
                  selectedBook.available_copies > 0
                    ? `${selectedBook.available_copies} ejemplares disponibles`
                    : 'No disponible actualmente'
                }}
              </v-chip>
            </div>
          </div>

          <v-divider class="my-5" />

          <h3 class="section-title">Detalles bibliográficos</h3>

          <div class="metadata-grid">
            <div>
              <span>Editorial</span>
              <strong>{{ selectedBook.publisher || 'No registrada' }}</strong>
            </div>

            <div>
              <span>ISBN</span>
              <strong>{{ selectedBook.isbn || 'No registrado' }}</strong>
            </div>

            <div>
              <span>Año de publicación</span>
              <strong>
                {{ selectedBook.publication_year || 'No registrado' }}
              </strong>
            </div>
          </div>

          <div class="description-section">
            <h3 class="section-title">Descripción</h3>

            <p>
              {{
                selectedBook.description ||
                'Este libro no tiene una descripción registrada.'
              }}
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />

          <v-btn
            color="primary"
            variant="flat"
            @click="detailsDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { booksService } from '../../services/books';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '');

const books = ref([]);
const loading = ref(false);
const error = ref('');

const search = ref('');
const page = ref(1);
const limit = 12;

const totalBooks = ref(0);
const totalPages = ref(1);

const detailsDialog = ref(false);
const selectedBook = ref(null);

function getCoverUrl(coverImage) {
  if (!coverImage) return '';

  return `${API_BASE_URL}${coverImage}`;
}

async function loadBooks() {
  loading.value = true;
  error.value = '';

  try {
    const response = await booksService.getCatalog({
      page: page.value,
      limit,
      search: search.value.trim() || undefined,
    });

    books.value = response.data || [];
    totalBooks.value = response.total || 0;
    totalPages.value = Math.max(1, response.totalPages || 1);
  } catch (err) {
    console.error('Error cargando catálogo:', err);

    error.value =
      err.response?.data?.message ||
      'No fue posible cargar el catálogo. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  loadBooks();
}

function clearSearch() {
  search.value = '';
  page.value = 1;
  loadBooks();
}

async function openBookDetails(book) {
  selectedBook.value = book;
  detailsDialog.value = true;

  try {
    const response = await booksService.getCatalogById(book.id);
    selectedBook.value = response;
  } catch (err) {
    console.error('Error consultando libro:', err);
  }
}

onMounted(() => {
  loadBooks();
});
</script>

<style scoped>
.catalog-page {
  width: 100%;
}

/* Encabezado */
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.heading-label {
  color: #b18a28;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 7px;
}

.page-heading h1 {
  color: #173a56;
  font-size: 27px;
  font-weight: 750;
  margin-bottom: 5px;
}

.page-heading p {
  color: #7b8794;
  font-size: 14px;
}

.total-books {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 14px 20px;
  border-radius: 12px;
  color: #173a56;
  border: 1px solid #e9edf2;
  flex-shrink: 0;
}

.total-books strong {
  display: block;
  font-size: 20px;
}

.total-books span {
  display: block;
  font-size: 11px;
  color: #89939f;
}

/* Búsqueda */
.search-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e9edf2;
  border-radius: 13px;
  margin-bottom: 30px;
}

.search-card :deep(.v-input) {
  flex: 1;
}

/* Resultados */
.results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.results-heading h2 {
  color: #173a56;
  font-size: 19px;
  font-weight: 700;
}

.results-heading span {
  display: block;
  color: #89939f;
  font-size: 12px;
  margin-top: 3px;
}

/* Tabla */
.catalog-table-card {
  border: 1px solid #e9edf2;
  border-radius: 13px;
  overflow: hidden;
  background: #fff;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.catalog-table {
  min-width: 850px;
}

.catalog-table :deep(thead) {
  background: #f7f9fb;
}

.catalog-table :deep(th) {
  height: 52px !important;
  color: #788796 !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 0.7px;
  white-space: nowrap;
}

.catalog-table :deep(td) {
  height: 85px !important;
  color: #334b60;
  font-size: 13px;
}

.catalog-table :deep(tbody tr:hover) {
  background: #fafbfd;
}

.book-column {
  width: 34%;
  min-width: 280px;
}

.actions-column {
  width: 150px;
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 250px;
}

.book-thumbnail {
  width: 48px;
  height: 62px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 5px;
  background: #eef2f6;
  border: 1px solid #e9edf2;
}

.thumbnail-placeholder {
  width: 48px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa8b5;
  background: #eef2f6;
}

.book-description {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.book-description strong {
  color: #173a56;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  max-width: 300px;
}

.book-description span {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #89939f;
  font-size: 11px;
}

.category-label {
  color: #657586;
  font-size: 12px;
}

.availability-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #657586;
  white-space: nowrap;
}

.availability-cell strong {
  color: #173a56;
  font-size: 14px;
}

.availability-cell span {
  font-size: 11px;
}

.details-button {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 13px 20px;
  border-top: 1px solid #edf0f3;
  color: #89939f;
  font-size: 11px;
}

/* Estados */
.loading-container {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #7b8794;
}

.empty-state {
  min-height: 330px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  color: #9aa8b5;
}

.empty-state h3 {
  color: #173a56;
  font-size: 19px;
  margin-top: 15px;
}

.empty-state p {
  max-width: 360px;
  color: #89939f;
  font-size: 13px;
  margin: 8px 0 18px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 25px 0 10px;
}

/* Diálogo de detalles */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #173a56;
  font-size: 17px;
  font-weight: 700;
}

.details-content {
  padding: 24px;
}

.details-layout {
  display: flex;
  gap: 24px;
}

.details-cover {
  flex-shrink: 0;
}

.cover-placeholder {
  height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #9aa8b5;
  background: #eef2f6;
}

.cover-placeholder span {
  font-size: 12px;
}

.details-placeholder {
  width: 180px;
  height: 260px;
  border-radius: 8px;
}

.details-information {
  flex: 1;
  min-width: 0;
}

.book-category {
  color: #b18a28;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.details-information h2 {
  color: #173a56;
  font-size: 21px;
  line-height: 1.35;
  margin-bottom: 8px;
}

.details-author {
  color: #7b8794;
  font-size: 14px;
  margin-bottom: 15px;
}

.section-title {
  color: #173a56;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.metadata-grid div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.metadata-grid span {
  color: #89939f;
  font-size: 11px;
}

.metadata-grid strong {
  color: #334b60;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.description-section {
  margin-top: 25px;
}

.description-section p {
  color: #667789;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-line;
}

.dialog-actions {
  padding: 12px 20px;
}

/* Responsive */
@media (max-width: 600px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-heading h1 {
    font-size: 23px;
  }

  .total-books {
    width: 100%;
  }

  .search-card {
    flex-direction: column;
    align-items: stretch;
  }

  .search-card :deep(.v-btn) {
    width: 100%;
  }

  .details-layout {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }
}
</style>
