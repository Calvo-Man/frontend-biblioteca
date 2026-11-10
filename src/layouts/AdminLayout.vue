
<template>
    <v-layout class="admin-layout">
        <!-- MENÚ LATERAL -->
        <v-navigation-drawer
            v-model="drawer"
            :permanent="mdAndUp"
            :temporary="!mdAndUp"
            width="260"
            color="#0B111B"
            class="admin-drawer"
            :scrim="!mdAndUp"
        >
            <div class="drawer-content">
                <div class="drawer-brand">
                    <div class="brand-icon">
                        <v-icon icon="mdi-book-open-page-variant" size="25" />
                    </div>

                    <div class="brand-text">
                        <h2>Biblioteca Escolar</h2>
                        <span>I.E Santa Teresita</span>
                    </div>
                </div>

                <v-divider class="drawer-divider" />

                <div class="menu-section">
                    <div class="menu-label">MENÚ PRINCIPAL</div>

                    <v-list nav class="navigation-list">
                        <v-list-item
                            v-for="item in mainMenuItems"
                            :key="item.title"
                            :to="item.to"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            rounded="lg"
                            class="navigation-item"
                            @click="closeMobileDrawer"
                        />
                    </v-list>
                </div>

                <div class="menu-section">
                    <div class="menu-label">CIRCULACIÓN</div>

                    <v-list nav class="navigation-list">
                        <v-list-item
                            v-for="item in circulationItems"
                            :key="item.title"
                            :to="item.to"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            rounded="lg"
                            class="navigation-item"
                            @click="closeMobileDrawer"
                        />
                    </v-list>
                </div>

                <div class="menu-section">
                    <div class="menu-label">SISTEMA</div>

                    <v-list nav class="navigation-list">
                        <v-list-item
                            v-for="item in systemItems"
                            :key="item.title"
                            :to="item.to"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            rounded="lg"
                            class="navigation-item"
                            @click="closeMobileDrawer"
                        />
                    </v-list>
                </div>

                <div class="drawer-footer">
                    <div class="system-status">
                        <v-icon icon="mdi-shield-check-outline" size="17" />
                        <span>Sistema seguro</span>
                    </div>

                    <div class="footer-version">
                        Biblioteca Escolar
                    </div>
                </div>
            </div>
        </v-navigation-drawer>

        <!-- CONTENIDO -->
        <v-main class="main-content">
            <div class="main-container">

                <!-- BARRA SUPERIOR -->
                <header class="admin-app-bar">
                    <div class="header-left">
                        <v-btn
                            v-if="!mdAndUp"
                            icon="mdi-menu"
                            variant="text"
                            class="mobile-menu-button"
                            @click="drawer = !drawer"
                        />

                        <div class="page-heading">
                            <div class="breadcrumb">
                                <span>Panel principal</span>
                                <v-icon icon="mdi-chevron-right" size="15" />
                                <strong>{{ currentPageTitle }}</strong>
                            </div>

                            <h1>{{ currentPageTitle }}</h1>
                        </div>
                    </div>

                    <v-spacer />

                    <div class="header-actions">
                        <!-- NOTIFICACIONES -->
                        <v-menu
                            v-model="notificationMenu"
                            location="bottom end"
                            :close-on-content-click="false"
                            max-width="370"
                        >
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    icon
                                    variant="text"
                                    class="notification-button"
                                    title="Notificaciones"
                                >
                                    <v-badge
                                        :content="overdueCount.toLocaleString('es-CO')"
                                        :model-value="overdueCount > 0"
                                        color="error"
                                        floating
                                        :max="999999999"
                                    >
                                        <v-icon
                                            icon="mdi-bell-outline"
                                            size="22"
                                        />
                                    </v-badge>
                                </v-btn>
                            </template>

                            <v-card class="notification-card" rounded="lg">
                                <div class="notification-header">
                                    <div>
                                        <div class="notification-title">
                                            Préstamos vencidos
                                        </div>

                                        <div class="notification-subtitle">
                                            {{ overdueCount }}
                                            {{ overdueCount === 1
                                                ? 'préstamo pendiente'
                                                : 'préstamos pendientes' }}
                                        </div>
                                    </div>

                                    <v-btn
                                        icon="mdi-refresh"
                                        variant="text"
                                        size="small"
                                        :loading="notificationsLoading"
                                        @click="loadOverdueLoans"
                                    />
                                </div>

                                <v-divider />

                                <div
                                    v-if="notificationsLoading && overdueLoans.length === 0"
                                    class="notification-empty"
                                >
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                        size="25"
                                    />
                                    <span>Consultando préstamos...</span>
                                </div>

                                <div
                                    v-else-if="overdueLoans.length === 0"
                                    class="notification-empty"
                                >
                                    <v-icon
                                        icon="mdi-check-circle-outline"
                                        color="success"
                                        size="34"
                                    />

                                    <span>No hay préstamos vencidos</span>
                                    <small>Todos los préstamos están al día.</small>
                                </div>

                                <v-list
                                    v-else
                                    class="notification-list"
                                    density="compact"
                                >
                                    <v-list-item
                                        v-for="loan in overdueLoans.slice(0, 8)"
                                        :key="loan.id"
                                        class="notification-item"
                                        @click="goToReturns"
                                    >
                                        <template #prepend>
                                            <v-avatar
                                                color="#FDECEC"
                                                size="36"
                                                class="mr-2"
                                            >
                                                <v-icon
                                                    icon="mdi-book-alert-outline"
                                                    color="error"
                                                    size="19"
                                                />
                                            </v-avatar>
                                        </template>

                                        <v-list-item-title class="notification-student">
                                            {{ loan.student?.full_name || 'Estudiante' }}
                                        </v-list-item-title>

                                        <v-list-item-subtitle class="notification-book">
                                            {{ loan.copy?.book?.title || 'Libro sin título' }}
                                        </v-list-item-subtitle>

                                        <template #append>
                                            <v-chip
                                                color="error"
                                                size="x-small"
                                                variant="tonal"
                                            >
                                                {{ getDaysOverdue(loan.due_date) }} d
                                            </v-chip>
                                        </template>
                                    </v-list-item>
                                </v-list>

                                <v-divider v-if="overdueLoans.length > 0" />

                                <div
                                    v-if="overdueLoans.length > 0"
                                    class="notification-footer"
                                >
                                    <span v-if="overdueLoans.length > 8">
                                        Mostrando 8 de {{ overdueCount }}
                                    </span>

                                    <v-btn
                                        color="primary"
                                        variant="text"
                                        size="small"
                                        block
                                        @click="goToReturns"
                                    >
                                        Ver devoluciones
                                        <v-icon
                                            icon="mdi-arrow-right"
                                            size="16"
                                            end
                                        />
                                    </v-btn>
                                </div>
                            </v-card>
                        </v-menu>

                        <div class="header-divider" />

                        <!-- USUARIO -->
                        <div class="user-info">
                            <v-avatar
                                color="#F4B323"
                                size="37"
                                class="user-avatar"
                            >
                                <span>{{ userInitials }}</span>
                            </v-avatar>

                            <div class="user-details">
                                <span class="user-name">
                                    {{ authStore.user?.username || 'Administrador' }}
                                </span>

                                <span class="user-role">
                                    Administrador
                                </span>
                            </div>
                        </div>

                        <v-btn
                            icon="mdi-logout"
                            variant="text"
                            color="error"
                            size="small"
                            class="logout-button"
                            :loading="authStore.loading"
                            title="Cerrar sesión"
                            @click="handleLogout"
                        />
                    </div>
                </header>

                <!-- VISTAS -->
                <div class="content-scroll">
                    <div class="content-wrapper">
                        <router-view />
                    </div>
                </div>
            </div>
        </v-main>
    </v-layout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

import { useAuthStore } from '../stores/auth';
import { reportsService } from '../services/reports';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const { mdAndUp } = useDisplay();

const drawer = ref(true);

const notificationMenu = ref(false);
const overdueLoans = ref([]);
const overdueCount = ref(0);
const notificationsLoading = ref(false);

let notificationInterval = null;

const mainMenuItems = [
    {
        title: 'Inicio',
        icon: 'mdi-view-dashboard-outline',
        to: '/dashboard',
    },
    {
        title: 'Libros',
        icon: 'mdi-book-multiple-outline',
        to: '/books',
    },
    {
        title: 'Ejemplares',
        icon: 'mdi-book-multiple',
        to: '/copies',
    },
    {
        title: 'Categorías',
        icon: 'mdi-shape-outline',
        to: '/categories',
    },
    {
        title: 'Estudiantes',
        icon: 'mdi-account-school-outline',
        to: '/students',
    },
];

const circulationItems = [
    {
        title: 'Préstamos',
        icon: 'mdi-book-arrow-right-outline',
        to: '/loans',
    },
    {
        title: 'Devoluciones',
        icon: 'mdi-book-arrow-left-outline',
        to: '/returns',
    },
    {
        title: 'Historial de préstamos',
        icon: 'mdi-history',
        to: '/history',
    },
];

const systemItems = [
    {
        title: 'Reportes',
        icon: 'mdi-chart-box-outline',
        to: '/reports',
    },
    {
        title: 'Administradores',
        icon: 'mdi-account-cog-outline',
        to: '/admins',
    },
];

const currentPageTitle = computed(() => {
    return route.meta.title || 'Biblioteca Escolar';
});

const userInitials = computed(() => {
    const username = authStore.user?.username || 'AD';
    return username.substring(0, 2).toUpperCase();
});

function closeMobileDrawer() {
    if (!mdAndUp.value) {
        drawer.value = false;
    }
}

async function loadOverdueLoans() {
    if (notificationsLoading.value) return;

    notificationsLoading.value = true;

    try {
        const response = await reportsService.getOverdueLoans();

        overdueLoans.value = Array.isArray(response?.data)
            ? response.data
            : [];

        overdueCount.value = Number(
            response?.total ?? overdueLoans.value.length
        );
    } catch (error) {
        console.error('Error al cargar préstamos vencidos:', error);
    } finally {
        notificationsLoading.value = false;
    }
}

function getDaysOverdue(dueDate) {
    if (!dueDate) return 0;

    const due = new Date(`${String(dueDate).slice(0, 10)}T12:00:00`);

    const todayString = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());

    const today = new Date(`${todayString}T12:00:00`);

    const difference = today.getTime() - due.getTime();

    return Math.max(1, Math.floor(difference / 86400000));
}

function goToReturns() {
    notificationMenu.value = false;
    router.push('/returns');
}

async function handleLogout() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }

    try {
        await authStore.logout();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    } finally {
        await router.replace('/login');
    }
}

onMounted(() => {
    loadOverdueLoans();

    notificationInterval = setInterval(() => {
        loadOverdueLoans();
    }, 60000);
});

onUnmounted(() => {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
});
</script>

<style scoped>
.admin-layout {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #f4f6fa;
}

/* SIDEBAR */
.admin-drawer {
    height: 100vh !important;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #303b4a transparent;
}

.drawer-content::-webkit-scrollbar {
    width: 5px;
}

.drawer-content::-webkit-scrollbar-thumb {
    background: #303b4a;
    border-radius: 10px;
}

.drawer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 19px;
    flex-shrink: 0;
}

.brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 11px;
    color: #101722;
    background: #F4B323;
}

.brand-text h2 {
    color: #fff;
    font-size: 14px;
    font-weight: 750;
    letter-spacing: -0.2px;
}

.brand-text span {
    display: block;
    margin-top: -9px;
    color: #8995a5;
    font-size: 10px;
}

.drawer-divider {
    border-color: rgba(255, 255, 255, 0.09);
}

.menu-section {
    margin-bottom: 8px;
}

.menu-label {
    padding: 22px 19px 9px;
    color: #778496;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.1px;
}

.navigation-list {
    padding: 0 10px;
}

.navigation-item {
    min-height: 40px;
    margin-bottom: 4px;
    color: #aeb9c7;
    transition: background 0.2s ease, color 0.2s ease;
}

.navigation-item :deep(.v-list-item-title) {
    font-size: 11px;
    font-weight: 550;
}

.navigation-item :deep(.v-list-item__prepend > .v-icon) {
    color: #8794a5;
    font-size: 18px;
    opacity: 1;
}

.navigation-item:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.055);
}

.navigation-item.v-list-item--active {
    color: #111820 !important;
    background: #F4B323 !important;
}

.navigation-item.v-list-item--active :deep(.v-list-item__prepend > .v-icon) {
    color: #111820 !important;
}

.navigation-item.v-list-item--active :deep(.v-list-item-title) {
    font-weight: 750;
}

.navigation-item.v-list-item--active :deep(.v-list-item__overlay) {
    opacity: 0;
}

.drawer-footer {
    margin-top: auto;
    padding: 17px 19px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.system-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #aeb9c7;
    font-size: 11px;
}

.system-status :deep(.v-icon) {
    color: #F4B323;
}

.footer-version {
    margin-top: 9px;
    color: #718094;
    font-size: 9px;
}

/* CONTENIDO PRINCIPAL */
.main-content {
    height: 100vh;
    min-height: 0;
    overflow: hidden;
    background: #F4F6FA;
}

.main-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

/* HEADER */
.admin-app-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 76px;
    min-height: 76px;
    width: 100%;
    padding: 0 27px;
    background: #fff;
    border-bottom: 1px solid #E9EDF2;
    z-index: 2;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.page-heading {
    min-width: 0;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #A0A9B5;
    font-size: 9px;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: 0.55px;
}

.breadcrumb strong {
    color: #2874A6;
    font-weight: 750;
}

.page-heading h1 {
    margin-top: 3px;
    color: #192536;
    font-size: 19px;
    font-weight: 750;
    letter-spacing: -0.5px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 13px;
}

.notification-button {
    color: #637184;
    overflow: visible !important;
}

.notification-button :deep(.v-badge) {
    overflow: visible;
}

.notification-button :deep(.v-badge__badge) {
    min-width: 20px;
    width: auto;
    height: 20px;
    padding: 0 5px;
    font-size: 10px;
    font-weight: 750;
    white-space: nowrap;
    letter-spacing: 0;
}

.header-divider {
    width: 1px;
    height: 30px;
    background: #E8ECF1;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 9px;
}

.user-avatar {
    color: #17202C;
    font-size: 11px;
    font-weight: 800;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.user-name {
    color: #29384A;
    font-size: 11px;
    font-weight: 750;
}

.user-role {
    color: #8995A4;
    font-size: 9px;
}

.logout-button {
    margin-left: 1px;
}

/* NOTIFICACIONES */
.notification-card {
    overflow: hidden;
}

.notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
}

.notification-title {
    color: #263648;
    font-size: 13px;
    font-weight: 750;
}

.notification-subtitle {
    margin-top: 3px;
    color: #8491A1;
    font-size: 10px;
}

.notification-list {
    max-height: 340px;
    overflow-y: auto;
    padding: 5px 8px;
}

.notification-item {
    min-height: 60px;
    border-radius: 8px;
    cursor: pointer;
}

.notification-item:hover {
    background: #F4F6FA;
}

.notification-student {
    color: #263648;
    font-size: 11px;
    font-weight: 650;
}

.notification-book {
    max-width: 200px;
    margin-top: 3px;
    color: #8491A1;
    font-size: 10px;
}

.notification-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 145px;
    padding: 20px;
    color: #526274;
    font-size: 11px;
    font-weight: 650;
}

.notification-empty small {
    color: #8491A1;
    font-size: 10px;
    font-weight: 400;
}

.notification-footer {
    padding: 8px 12px;
}

.notification-footer > span {
    display: block;
    margin-bottom: 4px;
    color: #8491A1;
    font-size: 10px;
    text-align: center;
}

/* ÁREA DE VISTAS */
.content-scroll {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scrollbar-width: thin;
    scrollbar-color: #CBD5E1 transparent;
}

.content-scroll::-webkit-scrollbar {
    width: 7px;
}

.content-scroll::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 10px;
}

.content-wrapper {
    width: 100%;
    min-height: 100%;
    padding: 25px 27px;
}

/* RESPONSIVE */
@media (max-width: 960px) {
    .admin-app-bar {
        padding: 0 18px;
    }

    .content-wrapper {
        padding: 20px 18px;
    }
}

@media (max-width: 600px) {
    .admin-app-bar {
        min-height: 66px;
        flex-basis: 66px;
        padding: 0 10px;
    }

    .page-heading h1 {
        font-size: 16px;
    }

    .breadcrumb {
        font-size: 8px;
    }

    .header-actions {
        gap: 5px;
    }

    .header-divider,
    .user-details {
        display: none;
    }

    .user-info {
        margin-left: 2px;
    }

    .content-wrapper {
        padding: 16px 12px;
    }

    .mobile-menu-button {
        margin-left: -7px;
    }
}
</style>
