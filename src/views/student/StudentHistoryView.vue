
<template>
  <div class="student-history">
    <!-- Encabezado -->
    <div class="page-heading">
      <div>
        <p>Consulta los libros que has solicitado y devuelto anteriormente.</p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadHistory"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Resumen -->
    <v-row class="mb-5">
      <v-col cols="12" sm="6">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon blue">
            <v-icon icon="mdi-book-check-outline" />
          </div>
          <div>
            <p>Libros devueltos</p>
            <h3>{{ history.length }}</h3>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon green">
            <v-icon icon="mdi-calendar-check-outline" />
          </div>
          <div>
            <p>Última devolución</p>
            <h3 class="last-return">
              {{ lastReturnDate }}
            </h3>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Historial -->
    <v-card class="content-card" elevation="0">
      <div class="content-header">
        <div>
          <h3>Préstamos anteriores</h3>
          <p>Registro de tus libros devueltos.</p>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Buscar libro..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="search-field"
        />
      </div>

      <v-divider />

      <!-- Cargando -->
      <div v-if="loading" class="state-container">
        <v-progress-circular
          indeterminate
          color="primary"
          size="36"
        />
        <p>Cargando tu historial...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="state-container">
        <v-icon
          icon="mdi-alert-circle-outline"
          color="error"
          size="42"
        />
        <p>{{ errorMessage }}</p>
        <v-btn color="primary" variant="tonal" @click="loadHistory">
          Intentar nuevamente
        </v-btn>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="filteredHistory.length === 0" class="state-container">
        <v-icon
          icon="mdi-history"
          color="grey"
          size="48"
        />
        <h4>No hay registros para mostrar</h4>
        <p>{{ emptyMessage }}</p>
      </div>

      <!-- Tabla -->
      <div v-else class="table-container">
        <v-table class="history-table">
          <thead>
            <tr>
              <th>Libro</th>
              <th>Fecha de préstamo</th>
              <th>Fecha de devolución</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="loan in paginatedHistory"
              :key="loan.id"
            >
              <td>
                <div class="book-cell">
                  <div class="book-icon">
                    <v-icon
                      icon="mdi-book-open-page-variant"
                      size="20"
                    />
                  </div>

                  <div class="book-info">
                    <strong>
                      {{ loan.copy?.book?.title || 'Libro sin título' }}
                    </strong>

                    <span v-if="loan.copy?.book?.author">
                      {{ loan.copy.book.author }}
                    </span>

                    <small>Préstamo #{{ loan.id }}</small>
                  </div>
                </div>
              </td>

              <td>
                {{ formatDate(loan.loan_date) }}
              </td>

              <td>
                {{ formatDate(loan.returned_at) }}
              </td>

              <td>
                <v-chip
                  color="success"
                  variant="tonal"
                  size="small"
                >
                  <v-icon
                    start
                    icon="mdi-check-circle-outline"
                    size="15"
                  />
                  Devuelto
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Paginación -->
      <div
        v-if="filteredHistory.length > itemsPerPage"
        class="pagination-container"
      >
        <span>
          {{ filteredHistory.length }} registros encontrados
        </span>

        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          density="comfortable"
          rounded="circle"
        />
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { loansService } from '../../services/loans';

const loading = ref(false);
const errorMessage = ref('');

const history = ref([]);
const search = ref('');
const page = ref(1);

const itemsPerPage = 8;

function toDateOnly(value) {
  if (!value) return '';

  return String(value).slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'No disponible';

  const dateOnly = toDateOnly(value);
  const [year, month, day] = dateOnly.split('-').map(Number);

  if (!year || !month || !day) return 'No disponible';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

const filteredHistory = computed(() => {
  let result = [...history.value];

  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase();

    result = result.filter(loan => {
      const title = loan.copy?.book?.title || '';
      const author = loan.copy?.book?.author || '';

      return (
        title.toLowerCase().includes(term) ||
        author.toLowerCase().includes(term)
      );
    });
  }

  return result.sort((a, b) => {
    return toDateOnly(b.returned_at).localeCompare(
      toDateOnly(a.returned_at),
    );
  });
});

const lastReturnDate = computed(() => {
  if (!history.value.length) return 'Sin registros';

  const latest = [...history.value].sort((a, b) => {
    return toDateOnly(b.returned_at).localeCompare(
      toDateOnly(a.returned_at),
    );
  })[0];

  return formatDate(latest.returned_at);
});

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / itemsPerPage);
});

const paginatedHistory = computed(() => {
  const start = (page.value - 1) * itemsPerPage;

  return filteredHistory.value.slice(
    start,
    start + itemsPerPage,
  );
});

const emptyMessage = computed(() => {
  if (search.value.trim()) {
    return 'No encontramos libros que coincidan con tu búsqueda.';
  }

  return 'Cuando devuelvas libros, aparecerán aquí tus registros.';
});

watch(search, () => {
  page.value = 1;
});

watch(totalPages, value => {
  if (page.value > value) {
    page.value = Math.max(1, value);
  }
});

async function loadHistory() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await loansService.getMyLoans();

    const allLoans = Array.isArray(response?.loans)
      ? response.loans
      : [];

    history.value = allLoans.filter(
      loan => loan.status === 'RETURNED',
    );
  } catch (error) {
    console.error('Error al cargar el historial:', error);

    errorMessage.value =
      error.response?.data?.message ||
      'No fue posible cargar tu historial. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadHistory);
</script>

<style scoped>
.student-history {
  width: 100%;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}

.page-heading h2 {
  color: #183b56;
  font-size: 22px;
  font-weight: 800;
}

.page-heading p {
  margin-top: 5px;
  color: #718096;
  font-size: 13px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e9eef4;
  border-radius: 12px;
  background: white;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 12px;
  font-size: 22px;
}

.stat-icon.blue {
  color: #24618b;
  background: #e8f1f8;
}

.stat-icon.green {
  color: #25845b;
  background: #e7f5ed;
}

.stat-card p {
  color: #718096;
  font-size: 12px;
}

.stat-card h3 {
  margin-top: 4px;
  color: #183b56;
  font-size: 23px;
  font-weight: 800;
}

.stat-card .last-return {
  font-size: 17px;
}

.content-card {
  overflow: hidden;
  border: 1px solid #e9eef4;
  border-radius: 13px;
  background: white;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
}

.content-header h3 {
  color: #183b56;
  font-size: 16px;
  font-weight: 700;
}

.content-header p {
  margin-top: 4px;
  color: #8793a3;
  font-size: 12px;
}

.search-field {
  width: 260px;
  max-width: 100%;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 240px;
  padding: 30px 20px;
  text-align: center;
}

.state-container h4 {
  color: #344256;
  font-size: 15px;
}

.state-container p {
  color: #8793a3;
  font-size: 13px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.history-table {
  min-width: 700px;
}

.history-table th {
  height: 48px;
  color: #718096;
  background: #fafbfd;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.history-table td {
  height: 70px;
  color: #46566a;
  font-size: 12px;
  white-space: nowrap;
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 210px;
}

.book-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 8px;
  color: #245879;
  background: #edf3f8;
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.book-info strong {
  overflow: hidden;
  max-width: 230px;
  color: #243b53;
  font-size: 12px;
  text-overflow: ellipsis;
}

.book-info span {
  color: #718096;
  font-size: 11px;
}

.book-info small {
  color: #98a3b1;
  font-size: 10px;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid #edf0f4;
}

.pagination-container span {
  color: #8793a3;
  font-size: 11px;
}

@media (max-width: 600px) {
  .page-heading h2 {
    font-size: 20px;
  }

  .content-header {
    align-items: stretch;
    padding: 16px;
  }

  .search-field {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;
  }
}
</style>
