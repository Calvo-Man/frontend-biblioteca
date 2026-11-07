
<template>
  <div class="student-loans">
    <!-- Encabezado -->
    <div class="page-heading">
      <div>
        <p>Consulta los libros que tienes prestados y sus fechas de devolución.</p>
      </div>

      <v-btn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadLoans"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Resumen -->
    <v-row class="mb-5">
      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon blue">
            <v-icon icon="mdi-book-open-page-variant" />
          </div>
          <div>
            <p>Total de préstamos</p>
            <h3>{{ summary.total }}</h3>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon green">
            <v-icon icon="mdi-book-clock-outline" />
          </div>
          <div>
            <p>Préstamos activos</p>
            <h3>{{ summary.active }}</h3>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon red">
            <v-icon icon="mdi-alert-circle-outline" />
          </div>
          <div>
            <p>Préstamos vencidos</p>
            <h3>{{ summary.overdue }}</h3>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-card class="content-card" elevation="0">
      <div class="filters-container">
        <div>
          <h3>Listado de préstamos</h3>
          <p>Revisa el estado de cada uno de tus préstamos.</p>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Buscar por título..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="search-field"
        />
      </div>

      <v-divider />

      <div class="filter-tabs">
        <v-btn
          v-for="filter in filters"
          :key="filter.value"
          :variant="activeFilter === filter.value ? 'flat' : 'text'"
          :color="activeFilter === filter.value ? 'primary' : 'grey-darken-1'"
          size="small"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </v-btn>
      </div>

      <v-divider />

      <!-- Cargando -->
      <div v-if="loading" class="state-container">
        <v-progress-circular
          indeterminate
          color="primary"
          size="36"
        />
        <p>Cargando tus préstamos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="state-container">
        <v-icon icon="mdi-alert-circle-outline" size="42" color="error" />
        <p>{{ errorMessage }}</p>
        <v-btn color="primary" variant="tonal" @click="loadLoans">
          Intentar nuevamente
        </v-btn>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="filteredLoans.length === 0" class="state-container">
        <v-icon icon="mdi-book-search-outline" size="48" color="grey" />
        <h4>No se encontraron préstamos</h4>
        <p>{{ emptyMessage }}</p>
      </div>

      <!-- Préstamos -->
      <div v-else class="loans-list">
        <v-card
          v-for="loan in paginatedLoans"
          :key="loan.id"
          class="loan-card"
          variant="outlined"
          elevation="0"
        >
          <div class="loan-main">
            <div class="book-icon">
              <v-icon icon="mdi-book-open-page-variant" size="30" />
            </div>

            <div class="book-information">
              <h4>{{ loan.copy?.book?.title || 'Libro sin título' }}</h4>

              <p v-if="loan.copy?.book?.author">
                {{ loan.copy.book.author }}
              </p>

              <span class="loan-number">
                Préstamo #{{ loan.id }}
              </span>
            </div>

            <v-chip
              :color="getLoanStatus(loan).color"
              size="small"
              variant="tonal"
              class="status-chip"
            >
              {{ getLoanStatus(loan).label }}
            </v-chip>
          </div>

          <v-divider class="loan-divider" />

          <div class="loan-dates">
            <div class="date-item">
              <span>Fecha de préstamo</span>
              <strong>{{ formatDate(loan.loan_date) }}</strong>
            </div>

            <div class="date-item">
              <span>Fecha límite</span>
              <strong :class="{ 'text-overdue': isOverdue(loan) }">
                {{ formatDate(loan.due_date) }}
              </strong>
            </div>

            <div v-if="loan.returned_at" class="date-item">
              <span>Fecha de devolución</span>
              <strong>{{ formatDate(loan.returned_at) }}</strong>
            </div>
          </div>

          <div v-if="isOverdue(loan)" class="overdue-notice">
            <v-icon icon="mdi-alert-outline" size="17" />
            Este préstamo tiene la fecha de devolución vencida.
          </div>
        </v-card>
      </div>

      <!-- Paginación -->
      <div
        v-if="filteredLoans.length > itemsPerPage"
        class="pagination-container"
      >
        <span>
          {{ filteredLoans.length }} préstamos encontrados
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

const loans = ref([]);

const summary = ref({
  total: 0,
  active: 0,
  overdue: 0,
});

const search = ref('');
const activeFilter = ref('ALL');
const page = ref(1);
const itemsPerPage = 8;

const filters = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Activos', value: 'ACTIVE' },
  { label: 'Vencidos', value: 'OVERDUE' },
  { label: 'Devueltos', value: 'RETURNED' },
];

const today = computed(() => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
  }).format(new Date());
});

function toDateOnly(value) {
  if (!value) return '';

  return String(value).slice(0, 10);
}

function isOverdue(loan) {
  return (
    loan.status === 'ACTIVE' &&
    toDateOnly(loan.due_date) < today.value
  );
}

function getLoanStatus(loan) {
  if (isOverdue(loan)) {
    return {
      label: 'Vencido',
      color: 'error',
    };
  }

  if (loan.status === 'RETURNED') {
    return {
      label: 'Devuelto',
      color: 'success',
    };
  }

  return {
    label: 'Activo',
    color: 'primary',
  };
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

const filteredLoans = computed(() => {
  let result = [...loans.value];

  if (activeFilter.value === 'ACTIVE') {
    result = result.filter(
      loan => loan.status === 'ACTIVE' && !isOverdue(loan),
    );
  }

  if (activeFilter.value === 'OVERDUE') {
    result = result.filter(isOverdue);
  }

  if (activeFilter.value === 'RETURNED') {
    result = result.filter(loan => loan.status === 'RETURNED');
  }

  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase();

    result = result.filter(loan =>
      loan.copy?.book?.title?.toLowerCase().includes(term),
    );
  }

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredLoans.value.length / itemsPerPage);
});

const paginatedLoans = computed(() => {
  const start = (page.value - 1) * itemsPerPage;

  return filteredLoans.value.slice(start, start + itemsPerPage);
});

const emptyMessage = computed(() => {
  if (search.value.trim()) {
    return 'No hay préstamos que coincidan con tu búsqueda.';
  }

  if (activeFilter.value === 'ACTIVE') {
    return 'No tienes préstamos activos actualmente.';
  }

  if (activeFilter.value === 'OVERDUE') {
    return 'No tienes préstamos vencidos.';
  }

  if (activeFilter.value === 'RETURNED') {
    return 'Todavía no tienes préstamos devueltos.';
  }

  return 'Todavía no tienes préstamos registrados.';
});

watch([activeFilter, search], () => {
  page.value = 1;
});

watch(totalPages, value => {
  if (page.value > value) {
    page.value = Math.max(1, value);
  }
});

async function loadLoans() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await loansService.getMyLoans();

    loans.value = Array.isArray(response?.loans)
      ? response.loans
      : [];

    summary.value = {
      total: Number(response?.total ?? loans.value.length),
      active: Number(response?.active ?? 0),
      overdue: Number(response?.overdue ?? 0),
    };
  } catch (error) {
    console.error('Error al cargar los préstamos:', error);

    errorMessage.value =
      error.response?.data?.message ||
      'No fue posible cargar tus préstamos. Intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadLoans);
</script>

<style scoped>
.student-loans {
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

.stat-icon.red {
  color: #c34b4b;
  background: #fbecec;
}

.stat-card p {
  color: #718096;
  font-size: 12px;
}

.stat-card h3 {
  margin-top: 3px;
  color: #183b56;
  font-size: 23px;
  font-weight: 800;
}

.content-card {
  overflow: hidden;
  border: 1px solid #e9eef4;
  border-radius: 13px;
  background: white;
}

.filters-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
}

.filters-container h3 {
  color: #183b56;
  font-size: 16px;
  font-weight: 700;
}

.filters-container p {
  margin-top: 4px;
  color: #8793a3;
  font-size: 12px;
}

.search-field {
  width: 260px;
  max-width: 100%;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 12px 20px;
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

.loans-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 20px;
}

.loan-card {
  padding: 17px;
  border-color: #e7edf3;
  border-radius: 11px;
}

.loan-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.book-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 9px;
  color: #245879;
  background: #edf3f8;
}

.book-information {
  min-width: 0;
  flex: 1;
}

.book-information h4 {
  overflow: hidden;
  color: #243b53;
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
}

.book-information p {
  margin-top: 3px;
  color: #718096;
  font-size: 12px;
}

.loan-number {
  display: inline-block;
  margin-top: 5px;
  color: #98a3b1;
  font-size: 10px;
}

.status-chip {
  flex-shrink: 0;
}

.loan-divider {
  margin: 15px 0;
}

.loan-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 45px;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-item span {
  color: #8793a3;
  font-size: 11px;
}

.date-item strong {
  color: #344256;
  font-size: 12px;
  font-weight: 600;
}

.date-item .text-overdue {
  color: #c03939;
}

.overdue-notice {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  padding: 9px 11px;
  border-radius: 7px;
  color: #b53e3e;
  background: #fff1f1;
  font-size: 11px;
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
  .page-heading {
    align-items: flex-start;
  }

  .page-heading h2 {
    font-size: 20px;
  }

  .filters-container {
    align-items: stretch;
    padding: 16px;
  }

  .search-field {
    width: 100%;
  }

  .filter-tabs {
    padding: 10px 12px;
  }

  .loans-list {
    padding: 12px;
  }

  .loan-card {
    padding: 13px;
  }

  .loan-main {
    flex-wrap: wrap;
  }

  .status-chip {
    margin-left: auto;
  }

  .loan-dates {
    gap: 15px 25px;
  }

  .pagination-container {
    justify-content: center;
  }
}
</style>
