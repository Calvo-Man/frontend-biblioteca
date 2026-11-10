
<template>
    <div class="admins-page">

        <!-- ENCABEZADO -->
        <div class="page-header">
            <div>
                <div class="section-label">
                    <v-icon icon="mdi-account-cog-outline" size="15" />
                    GESTIÓN DEL SISTEMA
                </div>


                <p>
                    Gestiona las cuentas de acceso del personal administrativo.
                </p>
            </div>

            <v-btn
                color="#F4B323"
                prepend-icon="mdi-account-plus-outline"
                class="create-button"
                elevation="0"
                @click="openCreateDialog"
            >
                Nuevo administrador
            </v-btn>
        </div>

        <!-- ESTADÍSTICAS -->
        <v-row class="stats-row">
            <v-col cols="12" sm="6" md="4">
                <v-card class="stat-card" elevation="0">
                    <div class="stat-content">
                        <div>
                            <span class="stat-label">TOTAL ADMINISTRADORES</span>
                            <h3>{{ total }}</h3>
                            <small>Cuentas registradas</small>
                        </div>

                        <div class="stat-icon blue">
                            <v-icon icon="mdi-account-group-outline" size="24" />
                        </div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-card class="stat-card" elevation="0">
                    <div class="stat-content">
                        <div>
                            <span class="stat-label">ACTIVOS</span>
                            <h3>{{ activeCount }}</h3>
                            <small>Cuentas habilitadas en esta página</small>
                        </div>

                        <div class="stat-icon green">
                            <v-icon icon="mdi-account-check-outline" size="24" />
                        </div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-card class="stat-card" elevation="0">
                    <div class="stat-content">
                        <div>
                            <span class="stat-label">INACTIVOS</span>
                            <h3>{{ inactiveCount }}</h3>
                            <small>Cuentas deshabilitadas en esta página</small>
                        </div>

                        <div class="stat-icon orange">
                            <v-icon icon="mdi-account-cancel-outline" size="24" />
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- TABLA -->
        <v-card class="table-card" elevation="0">

            <div class="table-toolbar">
                <div>
                    <h3>Listado de administradores</h3>
                    <span>Consulta las cuentas registradas en el sistema.</span>
                </div>

                <div class="search-container">
                    <v-text-field
                        v-model="searchInput"
                        placeholder="Buscar administrador..."
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        class="search-field"
                        @keyup.enter="searchAdmins"
                        @click:clear="clearSearch"
                    />

                    <v-btn
                        color="#155D91"
                        icon="mdi-magnify"
                        size="small"
                        elevation="0"
                        class="search-button"
                        title="Buscar"
                        @click="searchAdmins"
                    />
                </div>
            </div>

            <v-divider />

            <div v-if="loading" class="loading-container">
                <v-progress-circular
                    indeterminate
                    color="#155D91"
                    size="35"
                />
                <span>Cargando administradores...</span>
            </div>

            <div v-else-if="admins.length === 0" class="empty-state">
                <v-icon
                    icon="mdi-account-search-outline"
                    size="55"
                    color="#AAB5C2"
                />

                <h3>No hay administradores registrados</h3>

                <p>
                    {{ search
                        ? 'No encontramos resultados para tu búsqueda.'
                        : 'Registra el primer administrador adicional del sistema.' }}
                </p>

                <v-btn
                    v-if="!search"
                    color="#155D91"
                    variant="tonal"
                    prepend-icon="mdi-account-plus-outline"
                    @click="openCreateDialog"
                >
                    Crear administrador
                </v-btn>
            </div>

            <div v-else class="table-responsive">
                <v-table class="admins-table">
                    <thead>
                        <tr>
                            <th>ADMINISTRADOR</th>
                            <th>DOCUMENTO</th>
                            <th>CORREO ELECTRÓNICO</th>
                            <th>USUARIO</th>
                            <th>ESTADO</th>
                            <th>REGISTRO</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr
                            v-for="admin in admins"
                            :key="admin.id"
                        >
                            <td>
                                <div class="admin-cell">
                                    <v-avatar
                                        color="#E8F1F9"
                                        size="38"
                                    >
                                        <span class="admin-avatar-text">
                                            {{ getInitials(admin.full_name) }}
                                        </span>
                                    </v-avatar>

                                    <div class="admin-cell-info">
                                        <strong>{{ admin.full_name }}</strong>
                                        <small>ID: {{ admin.id }}</small>
                                    </div>
                                </div>
                            </td>

                            <td>{{ admin.document_id }}</td>

                            <td>{{ admin.email }}</td>

                            <td>
                                <span class="username-text">
                                    {{ admin.username }}
                                </span>
                            </td>

                            <td>
                                <v-chip
                                    :color="admin.is_active ? 'success' : 'error'"
                                    size="small"
                                    variant="tonal"
                                >
                                    {{ admin.is_active ? 'Activo' : 'Inactivo' }}
                                </v-chip>
                            </td>

                            <td>
                                <span class="date-text">
                                    {{ formatDate(admin.created_at) }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </div>

            <!-- PAGINACIÓN -->
            <div
                v-if="totalPages > 0 && admins.length > 0"
                class="pagination-container"
            >
                <span class="pagination-info">
                    Mostrando {{ admins.length }} de {{ total }} administradores
                </span>

                <div class="pagination-controls">
                    <v-btn
                        icon="mdi-chevron-left"
                        variant="text"
                        size="small"
                        :disabled="page <= 1 || loading"
                        @click="changePage(page - 1)"
                    />

                    <span class="page-number">
                        {{ page }} / {{ totalPages }}
                    </span>

                    <v-btn
                        icon="mdi-chevron-right"
                        variant="text"
                        size="small"
                        :disabled="page >= totalPages || loading"
                        @click="changePage(page + 1)"
                    />
                </div>
            </div>
        </v-card>

        <!-- DIÁLOGO CREAR ADMINISTRADOR -->
        <v-dialog
            v-model="createDialog"
            max-width="650"
            persistent
            scrollable
        >
            <v-card class="create-dialog">

                <div class="dialog-header">
                    <div class="dialog-header-icon">
                        <v-icon
                            icon="mdi-account-plus-outline"
                            size="25"
                        />
                    </div>

                    <div>
                        <h3>Nuevo administrador</h3>
                        <p>Registra una nueva cuenta administrativa.</p>
                    </div>

                    <v-spacer />

                    <v-btn
                        icon="mdi-close"
                        variant="text"
                        size="small"
                        :disabled="saving"
                        @click="closeCreateDialog"
                    />
                </div>

                <v-divider />

                <v-card-text class="dialog-content">
                    <v-form
                        ref="createForm"
                        @submit.prevent="createAdmin"
                    >
                        <div class="form-section-title">
                            <v-icon icon="mdi-account-outline" size="18" />
                            Información personal
                        </div>

                        <v-row>
                            <v-col cols="12">
                                <label class="form-label">Nombre completo *</label>

                                <v-text-field
                                    v-model="form.full_name"
                                    placeholder="Nombre y apellidos"
                                    prepend-inner-icon="mdi-account-outline"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="nameRules"
                                    maxlength="100"
                                    counter="100"
                                />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <label class="form-label">Documento *</label>

                                <v-text-field
                                    v-model="form.document_id"
                                    placeholder="Número de documento"
                                    prepend-inner-icon="mdi-card-account-details-outline"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="documentRules"
                                    maxlength="20"
                                />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <label class="form-label">Correo electrónico *</label>

                                <v-text-field
                                    v-model="form.email"
                                    placeholder="correo@institucion.com"
                                    prepend-inner-icon="mdi-email-outline"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="emailRules"
                                    maxlength="100"
                                />
                            </v-col>
                        </v-row>

                        <v-divider class="form-divider" />

                        <div class="form-section-title">
                            <v-icon icon="mdi-shield-account-outline" size="18" />
                            Credenciales de acceso
                        </div>

                        <v-row>
                            <v-col cols="12">
                                <label class="form-label">Nombre de usuario *</label>

                                <v-text-field
                                    v-model="form.username"
                                    placeholder="Nombre de usuario"
                                    prepend-inner-icon="mdi-at"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="usernameRules"
                                    maxlength="50"
                                />
                            </v-col>

                            <v-col cols="12">
                                <label class="form-label">Contraseña *</label>

                                <v-text-field
                                    v-model="form.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    placeholder="Mínimo 8 caracteres"
                                    prepend-inner-icon="mdi-lock-outline"
                                    :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="passwordRules"
                                    maxlength="100"
                                    @click:append-inner="showPassword = !showPassword"
                                />

                                <div class="password-hint">
                                    La contraseña debe tener al menos 8 caracteres.
                                </div>
                            </v-col>
                        </v-row>

                        <v-alert
                            type="info"
                            variant="tonal"
                            density="compact"
                            class="form-alert"
                        >
                            Esta cuenta tendrá permisos de administrador dentro del sistema.
                        </v-alert>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="dialog-actions">
                    <v-btn
                        variant="text"
                        color="grey-darken-1"
                        :disabled="saving"
                        @click="closeCreateDialog"
                    >
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        color="#155D91"
                        prepend-icon="mdi-account-plus-outline"
                        :loading="saving"
                        @click="createAdmin"
                    >
                        Crear administrador
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- NOTIFICACIONES -->
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
import { computed, onMounted, reactive, ref } from 'vue';

import { adminsService } from '../../services/admins';

const admins = ref([]);

const loading = ref(false);
const saving = ref(false);

const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(0);

const searchInput = ref('');
const search = ref('');

const createDialog = ref(false);
const createForm = ref(null);
const showPassword = ref(false);

const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
});

const emptyForm = () => ({
    full_name: '',
    document_id: '',
    email: '',
    username: '',
    password: '',
});

const form = reactive(emptyForm());

const activeCount = computed(() => {
    return admins.value.filter(admin => admin.is_active).length;
});

const inactiveCount = computed(() => {
    return admins.value.filter(admin => !admin.is_active).length;
});

const nameRules = [
    value => !!value?.trim() || 'El nombre es obligatorio.',
    value => value?.trim().length <= 100 || 'Máximo 100 caracteres.',
];

const documentRules = [
    value => !!value?.trim() || 'El documento es obligatorio.',
    value => value?.trim().length <= 20 || 'Máximo 20 caracteres.',
];

const emailRules = [
    value => !!value?.trim() || 'El correo es obligatorio.',
    value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '') || 'Ingresa un correo válido.',
    value => value?.length <= 100 || 'Máximo 100 caracteres.',
];

const usernameRules = [
    value => !!value?.trim() || 'El usuario es obligatorio.',
    value => value?.trim().length <= 50 || 'Máximo 50 caracteres.',
];

const passwordRules = [
    value => !!value || 'La contraseña es obligatoria.',
    value => value?.length >= 8 || 'Mínimo 8 caracteres.',
    value => value?.length <= 100 || 'Máximo 100 caracteres.',
];

function showMessage(message, color = 'success') {
    snackbar.message = message;
    snackbar.color = color;
    snackbar.show = true;
}

function getInitials(name) {
    if (!name) return 'AD';

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
}

function formatDate(date) {
    if (!date) return 'Sin fecha';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Bogota',
    }).format(parsedDate);
}

async function loadAdmins() {
    loading.value = true;

    try {
        const response = await adminsService.getAll({
            page: page.value,
            limit: limit.value,
            search: search.value || undefined,
        });

        admins.value = Array.isArray(response?.data)
            ? response.data
            : [];

        total.value = Number(response?.total ?? admins.value.length);
        totalPages.value = Number(
            response?.totalPages ?? Math.ceil(total.value / limit.value)
        );
    } catch (error) {
        console.error('Error al cargar administradores:', error);

        showMessage(
            error.response?.data?.message || 'No se pudieron cargar los administradores.',
            'error'
        );
    } finally {
        loading.value = false;
    }
}

async function searchAdmins() {
    search.value = searchInput.value.trim();
    page.value = 1;

    await loadAdmins();
}

async function clearSearch() {
    searchInput.value = '';
    search.value = '';
    page.value = 1;

    await loadAdmins();
}

async function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages.value) return;

    page.value = newPage;
    await loadAdmins();
}

function openCreateDialog() {
    Object.assign(form, emptyForm());
    showPassword.value = false;
    createDialog.value = true;
}

function closeCreateDialog() {
    if (saving.value) return;

    createDialog.value = false;
    Object.assign(form, emptyForm());
    createForm.value?.resetValidation();
}

async function createAdmin() {
    if (saving.value) return;

    const validation = await createForm.value?.validate();

    if (!validation?.valid) return;

    saving.value = true;

    try {
        await adminsService.create({
            full_name: form.full_name.trim(),
            document_id: form.document_id.trim(),
            email: form.email.trim(),
            username: form.username.trim(),
            password: form.password,
        });

        createDialog.value = false;

        Object.assign(form, emptyForm());

        showMessage('Administrador creado correctamente.');

        page.value = 1;
        search.value = '';
        searchInput.value = '';

        await loadAdmins();
    } catch (error) {
        console.error('Error al crear administrador:', error);

        const message = error.response?.data?.message;

        showMessage(
            Array.isArray(message)
                ? message.join(', ')
                : message || 'No se pudo crear el administrador.',
            'error'
        );
    } finally {
        saving.value = false;
    }
}

onMounted(() => {
    loadAdmins();
});
</script>

<style scoped>
.admins-page {
    width: 100%;
    color: #263648;
}

/* ENCABEZADO */
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 23px;
}

.section-label {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 7px;
    color: #8794A5;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
}

.page-header h2 {
    color: #192536;
    font-size: 23px;
    font-weight: 800;
    letter-spacing: -0.6px;
}

.page-header p {
    margin-top: 5px;
    color: #8491A1;
    font-size: 12px;
}

.create-button {
    color: #17202C !important;
    font-size: 11px;
    font-weight: 750;
    text-transform: none;
    border-radius: 9px;
}

/* ESTADÍSTICAS */
.stats-row {
    margin-bottom: 12px;
}

.stat-card {
    height: 105px;
    padding: 19px 17px;
    border: 1px solid #E8EDF3;
    border-radius: 15px;
    background: #fff;
}

.stat-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
}

.stat-label {
    color: #8995A5;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
}

.stat-content h3 {
    margin-top: 4px;
    color: #192536;
    font-size: 25px;
    font-weight: 800;
}

.stat-content small {
    display: block;
    margin-top: 2px;
    color: #9AA5B3;
    font-size: 10px;
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
}

.stat-icon.blue {
    color: #216A9F;
    background: #E8F2FA;
}

.stat-icon.green {
    color: #159B6B;
    background: #E7F7EF;
}

.stat-icon.orange {
    color: #D68A18;
    background: #FFF3DF;
}

/* TABLA */
.table-card {
    overflow: hidden;
    border: 1px solid #E8EDF3;
    border-radius: 15px;
    background: #fff;
}

.table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px;
}

.table-toolbar h3 {
    color: #263648;
    font-size: 14px;
    font-weight: 800;
}

.table-toolbar > div:first-child span {
    display: block;
    margin-top: 4px;
    color: #8995A5;
    font-size: 10px;
}

.search-container {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 310px;
}

.search-field {
    flex: 1;
}

.search-field :deep(.v-field) {
    border-radius: 9px;
    font-size: 11px;
}

.search-button {
    flex-shrink: 0;
    border-radius: 9px;
}

.table-responsive {
    width: 100%;
    overflow-x: auto;
}

.admins-table {
    min-width: 850px;
}

.admins-table :deep(thead th) {
    height: 43px;
    color: #8995A5;
    background: #F8FAFC;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.admins-table :deep(tbody td) {
    height: 66px;
    color: #536274;
    font-size: 11px;
    border-bottom: 1px solid #F0F2F5;
}

.admins-table :deep(tbody tr:hover) {
    background: #FAFBFD;
}

.admin-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.admin-avatar-text {
    color: #155D91;
    font-size: 11px;
    font-weight: 800;
}

.admin-cell-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.admin-cell-info strong {
    color: #263648;
    font-size: 11px;
    font-weight: 750;
}

.admin-cell-info small {
    color: #98A3B1;
    font-size: 9px;
}

.username-text {
    color: #155D91;
    font-weight: 650;
}

.date-text {
    white-space: nowrap;
    color: #778597;
}

.loading-container,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 260px;
    padding: 30px;
}

.loading-container {
    color: #8491A1;
    font-size: 11px;
}

.empty-state h3 {
    color: #344357;
    font-size: 14px;
    font-weight: 750;
}

.empty-state p {
    color: #8995A5;
    font-size: 11px;
    text-align: center;
}

.pagination-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 12px 20px;
    border-top: 1px solid #EDF0F4;
}

.pagination-info {
    color: #8995A5;
    font-size: 10px;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-number {
    color: #536274;
    font-size: 11px;
    font-weight: 700;
}

/* DIÁLOGO */
.create-dialog {
    border-radius: 15px !important;
}

.dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 19px 22px;
}

.dialog-header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 43px;
    height: 43px;
    border-radius: 11px;
    color: #155D91;
    background: #E8F2FA;
}

.dialog-header h3 {
    color: #263648;
    font-size: 15px;
    font-weight: 800;
}

.dialog-header p {
    margin-top: 3px;
    color: #8995A5;
    font-size: 10px;
}

.dialog-content {
    padding: 22px !important;
}

.form-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 17px;
    color: #155D91;
    font-size: 12px;
    font-weight: 800;
}

.form-label {
    display: block;
    margin-bottom: 7px;
    color: #536274;
    font-size: 10px;
    font-weight: 750;
}

.dialog-content :deep(.v-field) {
    border-radius: 9px;
    font-size: 11px;
}

.dialog-content :deep(.v-input) {
    margin-bottom: 1px;
}

.form-divider {
    margin: 10px 0 20px;
}

.password-hint {
    margin-top: -13px;
    margin-bottom: 10px;
    color: #8995A5;
    font-size: 10px;
}

.form-alert {
    margin-top: 5px;
    font-size: 10px;
}

.dialog-actions {
    padding: 13px 20px;
}

.dialog-actions :deep(.v-btn) {
    font-size: 11px;
    font-weight: 700;
    text-transform: none;
}

/* RESPONSIVE */
@media (max-width: 700px) {
    .page-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .create-button {
        width: 100%;
    }

    .table-toolbar {
        align-items: stretch;
        flex-direction: column;
    }

    .search-container {
        width: 100%;
    }

    .pagination-container {
        align-items: flex-start;
        flex-direction: column;
    }
}

@media (max-width: 450px) {
    .page-header h2 {
        font-size: 20px;
    }

    .dialog-content {
        padding: 16px !important;
    }
}
</style>
