
<template>
    <div class="page-container">
        <!-- Encabezado -->
        <div class="welcome-section">
            <div>
                <h2 class="welcome-title">
                    ¡Hola, {{ studentName }}!
                </h2>

                <p class="welcome-description">
                    Consulta el estado de tus préstamos y tu actividad en la biblioteca.
                </p>
            </div>

            <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                variant="tonal"
                :loading="loading"
                @click="loadDashboard"
            >
                Actualizar
            </v-btn>
        </div>

        <!-- Error -->
        <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-5"
            closable
            @click:close="errorMessage = ''"
        >
            {{ errorMessage }}
        </v-alert>

        <!-- Estadísticas -->
        <v-row dense class="mb-5">
            <v-col
                v-for="stat in statistics"
                :key="stat.title"
                cols="12"
                sm="6"
                md="3"
            >
                <v-card class="stat-card" elevation="0">
                    <div class="stat-content">
                        <div>
                            <span class="stat-label">
                                {{ stat.title }}
                            </span>

                            <h3 class="stat-value">
                                {{ stat.value }}
                            </h3>

                            <span class="stat-description">
                                {{ stat.description }}
                            </span>
                        </div>

                        <div
                            class="stat-icon"
                            :style="{
                                backgroundColor: stat.background,
                                color: stat.color,
                            }"
                        >
                            <v-icon :icon="stat.icon" size="23" />
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Información y accesos -->
        <v-row dense class="mb-5">
            <v-col cols="12" md="7">
                <v-card class="section-card h-100" elevation="0">
                    <div class="card-heading">
                        <div>
                            <h3>Mis préstamos actuales</h3>
                            <p>Libros que tienes pendientes por devolver.</p>
                        </div>

                        <v-chip
                            color="primary"
                            variant="tonal"
                            size="small"
                        >
                            {{ activeLoans.length }} activos
                        </v-chip>
                    </div>

                    <v-divider />

                    <div
                        v-if="loading && loans.length === 0"
                        class="empty-state"
                    >
                        <v-progress-circular
                            indeterminate
                            color="primary"
                        />
                        <span>Consultando tus préstamos...</span>
                    </div>

                    <div
                        v-else-if="activeLoans.length === 0"
                        class="empty-state"
                    >
                        <v-icon
                            icon="mdi-book-check-outline"
                            color="success"
                            size="42"
                        />

                        <strong>No tienes préstamos activos</strong>

                        <span>
                            Cuando tengas un libro prestado aparecerá aquí.
                        </span>
                    </div>

                    <div v-else class="loan-list">
                        <div
                            v-for="loan in activeLoans.slice(0, 5)"
                            :key="loan.id"
                            class="loan-item"
                        >
                            <v-avatar
                                color="#EAF0F6"
                                rounded="lg"
                                size="43"
                            >
                                <v-icon
                                    icon="mdi-book-open-page-variant"
                                    color="primary"
                                    size="22"
                                />
                            </v-avatar>

                            <div class="loan-info">
                                <strong>
                                    {{ loan.copy?.book?.title || 'Libro sin título' }}
                                </strong>

                                <span>
                                    Ejemplar:
                                    {{ loan.copy?.copy_code || 'No disponible' }}
                                </span>
                            </div>

                            <div class="loan-date">
                                <v-chip
                                    :color="isOverdue(loan.due_date) ? 'error' : 'success'"
                                    size="small"
                                    variant="tonal"
                                >
                                    {{ isOverdue(loan.due_date) ? 'Vencido' : 'Activo' }}
                                </v-chip>

                                <span>
                                    Vence: {{ formatDate(loan.due_date) }}
                                </span>
                            </div>
                        </div>

                        <div class="view-all">
                            <v-btn
                                variant="text"
                                color="primary"
                                size="small"
                                to="/student/loans"
                            >
                                Ver todos mis préstamos
                                <v-icon
                                    icon="mdi-arrow-right"
                                    end
                                    size="16"
                                />
                            </v-btn>
                        </div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" md="5">
                <v-card class="section-card h-100" elevation="0">
                    <div class="card-heading">
                        <div>
                            <h3>Accesos rápidos</h3>
                            <p>Consulta tu información.</p>
                        </div>
                    </div>

                    <v-divider />

                    <div class="quick-access">
                        <v-btn
                            to="/student/loans"
                            variant="outlined"
                            color="primary"
                            prepend-icon="mdi-book-multiple-outline"
                            block
                            class="quick-button"
                        >
                            Consultar mis préstamos
                        </v-btn>

                        <v-btn
                            to="/student/history"
                            variant="outlined"
                            color="primary"
                            prepend-icon="mdi-history"
                            block
                            class="quick-button"
                        >
                            Ver mi historial
                        </v-btn>

                        <v-btn
                            to="/student/profile"
                            variant="outlined"
                            color="primary"
                            prepend-icon="mdi-account-outline"
                            block
                            class="quick-button"
                        >
                            Consultar mi perfil
                        </v-btn>
                    </div>

                    <div class="reminder-box">
                        <v-icon
                            icon="mdi-information-outline"
                            color="primary"
                            size="20"
                        />

                        <span>
                            Recuerda devolver tus libros antes de la fecha límite
                            para evitar retrasos.
                        </span>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Últimos movimientos -->
        <v-card class="section-card" elevation="0">
            <div class="card-heading">
                <div>
                    <h3>Actividad reciente</h3>
                    <p>Los últimos movimientos de tus préstamos.</p>
                </div>
            </div>

            <v-divider />

            <div
                v-if="recentLoans.length === 0"
                class="empty-state compact-empty"
            >
                <v-icon
                    icon="mdi-book-clock-outline"
                    color="grey"
                    size="36"
                />

                <span>Aún no tienes movimientos registrados.</span>
            </div>

            <div v-else class="table-container">
                <v-table density="comfortable">
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
                            v-for="loan in recentLoans"
                            :key="loan.id"
                        >
                            <td class="book-cell">
                                {{ loan.copy?.book?.title || 'Libro sin título' }}
                            </td>

                            <td>
                                {{ formatDate(loan.loan_date) }}
                            </td>

                            <td>
                                {{ formatDate(loan.returned_at) }}
                            </td>

                            <td>
                                <v-chip
                                    :color="getLoanStatusColor(loan)"
                                    size="small"
                                    variant="tonal"
                                >
                                    {{ getLoanStatus(loan) }}
                                </v-chip>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </div>
        </v-card>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

import { useAuthStore } from '../../stores/auth';
import { loansService } from '../../services/loans';

const authStore = useAuthStore();

const loans = ref([]);
const loading = ref(false);
const errorMessage = ref('');

const studentName = computed(() => {
    return authStore.user?.full_name
        || authStore.user?.username
        || 'Estudiante';
});

const activeLoans = computed(() => {
    return loans.value.filter(loan => loan.status === 'ACTIVE');
});

const returnedLoans = computed(() => {
    return loans.value.filter(loan => loan.status === 'RETURNED');
});

const overdueLoans = computed(() => {
    return activeLoans.value.filter(loan => isOverdue(loan.due_date));
});

const recentLoans = computed(() => {
    return [...loans.value]
        .sort((a, b) => {
            return new Date(b.loan_date) - new Date(a.loan_date);
        })
        .slice(0, 5);
});

const statistics = computed(() => [
    {
        title: 'Préstamos activos',
        value: activeLoans.value.length,
        description: 'Libros pendientes',
        icon: 'mdi-book-open-page-variant',
        color: '#2463A0',
        background: '#EAF2FC',
    },
    {
        title: 'Préstamos vencidos',
        value: overdueLoans.value.length,
        description: 'Requieren devolución',
        icon: 'mdi-clock-alert-outline',
        color: '#D04444',
        background: '#FDECEC',
    },
    {
        title: 'Libros devueltos',
        value: returnedLoans.value.length,
        description: 'Préstamos finalizados',
        icon: 'mdi-book-check-outline',
        color: '#26966B',
        background: '#E8F6EF',
    },
    {
        title: 'Total de préstamos',
        value: loans.value.length,
        description: 'Actividad registrada',
        icon: 'mdi-bookshelf',
        color: '#B17B19',
        background: '#FFF5DF',
    },
]);

async function loadDashboard() {
    loading.value = true;
    errorMessage.value = '';

    try {
        const response = await loansService.getMyLoans();

        loans.value = Array.isArray(response?.loans)
            ? response.loans
            : [];
    } catch (error) {
        console.error('Error al cargar el dashboard del estudiante:', error);

        errorMessage.value =
            error.response?.data?.message
            || 'No fue posible cargar tu información. Intenta nuevamente.';
    } finally {
        loading.value = false;
    }
}
function isOverdue(dueDate) {
    if (!dueDate) return false;

    const due = String(dueDate).slice(0, 10);

    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());

    return due < today;
}

function formatDate(date) {
    if (!date) return '—';

    let parsedDate;

    if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
        parsedDate = new Date(`${date}T12:00:00`);
    } else {
        parsedDate = new Date(date);
    }

    if (Number.isNaN(parsedDate.getTime())) return '—';

    return parsedDate.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function getLoanStatus(loan) {
    if (loan.status === 'RETURNED') return 'Devuelto';

    return isOverdue(loan.due_date) ? 'Vencido' : 'Activo';
}

function getLoanStatusColor(loan) {
    if (loan.status === 'RETURNED') return 'success';

    return isOverdue(loan.due_date) ? 'error' : 'primary';
}

onMounted(loadDashboard);
</script>

<style scoped>
.welcome-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
}

.welcome-title {
    color: #1b3045;
    font-size: 23px;
    font-weight: 700;
    letter-spacing: -0.5px;
}

.welcome-description {
    margin-top: 5px;
    color: #8290a0;
    font-size: 13px;
}

.stat-card,
.section-card {
    height: 100%;
    overflow: hidden;
    border: 1px solid #e9edf2;
    border-radius: 12px;
    background: white;
}

.stat-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px;
}

.stat-label {
    color: #8290a0;
    font-size: 12px;
    font-weight: 500;
}

.stat-value {
    margin-top: 6px;
    color: #20354a;
    font-size: 27px;
    font-weight: 700;
    line-height: 1.2;
}

.stat-description {
    display: block;
    margin-top: 5px;
    color: #9aa5b1;
    font-size: 10px;
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    flex-shrink: 0;
    border-radius: 12px;
}

.card-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 17px 19px;
}

.card-heading h3 {
    color: #26394c;
    font-size: 14px;
    font-weight: 700;
}

.card-heading p {
    margin-top: 4px;
    color: #91a0ae;
    font-size: 11px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 210px;
    padding: 25px;
    color: #8290a0;
    font-size: 12px;
    text-align: center;
}

.empty-state strong {
    color: #34485c;
    font-size: 13px;
}

.compact-empty {
    min-height: 130px;
}

.loan-list {
    padding: 4px 17px 12px;
}

.loan-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 2px;
    border-bottom: 1px solid #edf0f4;
}

.loan-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 4px;
}

.loan-info strong {
    overflow: hidden;
    color: #34485c;
    font-size: 12px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.loan-info span {
    color: #96a2ae;
    font-size: 10px;
}

.loan-date {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
}

.loan-date span {
    color: #8491a1;
    font-size: 10px;
}

.view-all {
    display: flex;
    justify-content: flex-end;
    padding-top: 9px;
}

.quick-access {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 17px 19px;
}

.quick-button {
    justify-content: flex-start;
    min-height: 42px;
    border-color: #e2e9f0;
    font-size: 12px;
}

.reminder-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 0 19px 17px;
    padding: 12px;
    border-radius: 9px;
    background: #edf4fa;
    color: #526b80;
    font-size: 11px;
    line-height: 1.5;
}

.table-container {
    width: 100%;
    overflow-x: auto;
}

.table-container :deep(th) {
    color: #7c8b9a !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    white-space: nowrap;
}

.table-container :deep(td) {
    color: #526274;
    font-size: 12px;
    white-space: nowrap;
}

.book-cell {
    color: #26394c !important;
    font-weight: 600;
}

@media (max-width: 600px) {
    .welcome-section {
        align-items: flex-start;
    }

    .welcome-title {
        font-size: 20px;
    }

    .welcome-description {
        max-width: 240px;
        line-height: 1.5;
    }

    .stat-content {
        padding: 15px;
    }

    .loan-item {
        flex-wrap: wrap;
    }

    .loan-date {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-left: 55px;
    }
}
</style>
