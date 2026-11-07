
<template>
    <v-layout class="admin-layout">
        <!-- Menú lateral -->
        <v-navigation-drawer
            v-model="drawer"
            :permanent="mdAndUp"
            :temporary="!mdAndUp"
            width="255"
            color="#102F49"
            class="admin-drawer"
            :scrim="!mdAndUp"
        >
            <div class="drawer-content">
                <div class="drawer-brand">
                    <div class="brand-icon">
                        <v-icon icon="mdi-book-open-page-variant" size="27" />
                    </div>

                    <div>
                        <h2>Biblioteca</h2>
                        <span>Panel administrativo</span>
                    </div>
                </div>

                <v-divider class="drawer-divider" />

                <div class="menu-label">MENÚ PRINCIPAL</div>

                <v-list nav density="comfortable" class="navigation-list">
                    <v-list-item
                        v-for="item in menuItems"
                        :key="item.title"
                        :to="item.to"
                        :prepend-icon="item.icon"
                        :title="item.title"
                        rounded="lg"
                        color="white"
                        class="navigation-item"
                        @click="closeMobileDrawer"
                    />
                </v-list>

                <div class="drawer-footer">
                    <v-divider class="drawer-divider mb-4" />

                    <div class="system-info">
                        <v-icon icon="mdi-shield-check-outline" size="18" />
                        <span>Sistema seguro</span>
                    </div>

                    <span class="version-text">Biblioteca Escolar</span>
                </div>
            </div>
        </v-navigation-drawer>

        <!-- Contenido principal -->
        <v-main class="main-content">
            <div class="main-container">

                <!-- Barra superior -->
                <div class="admin-app-bar">
                    <v-btn
                        v-if="!mdAndUp"
                        icon="mdi-menu"
                        variant="text"
                        @click="drawer = !drawer"
                    />

                    <div class="page-heading">
                        <div class="breadcrumb">
                            <span class="breadcrumb-parent">Menú principal</span>

                            <v-icon
                                icon="mdi-chevron-right"
                                size="16"
                                color="grey"
                            />

                            <span class="breadcrumb-current">
                                {{ currentPageTitle }}
                            </span>
                        </div>
                    </div>

                    <v-spacer />

                    <!-- Notificaciones de préstamos vencidos -->
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
                                color="primary"
                                class="notification-button"
                                title="Notificaciones"
                            >
                                <v-badge
                                    :content="overdueCount"
                                    :model-value="overdueCount > 0"
                                    color="error"
                                    floating
                                    :max="99"
                                >
                                    <v-icon
                                        icon="mdi-bell-outline"
                                        size="23"
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
                                        {{ overdueCount === 1 ? 'préstamo pendiente' : 'préstamos pendientes' }}
                                    </div>
                                </div>

                                <v-btn
                                    icon="mdi-refresh"
                                    variant="text"
                                    size="small"
                                    :loading="notificationsLoading"
                                    title="Actualizar notificaciones"
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

                    <!-- Usuario -->
                    <div class="user-info">
                        <v-avatar color="#EAF0F6" size="38">
                            <v-icon
                                icon="mdi-account-outline"
                                color="primary"
                                size="22"
                            />
                        </v-avatar>

                        <div class="user-details">
                            <span class="user-name">
                                {{ authStore.user?.username || 'Administrador' }}
                            </span>

                            <span class="user-role">Administrador</span>
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

                <!-- Única zona con desplazamiento -->
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
import {reportsService} from '../services/reports';

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

const menuItems = [
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
        title: 'Historial',
        icon: 'mdi-history',
        to: '/history',
    },
    {
        title: 'Reportes',
        icon: 'mdi-chart-box-outline',
        to: '/reports',
    },
];

const currentPageTitle = computed(() => {
    return route.meta.title || 'Biblioteca Escolar';
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

        const result = response.data;

        overdueLoans.value = Array.isArray(result?.data)
            ? result.data
            : [];

        overdueCount.value = Number(result?.total ?? overdueLoans.value.length);
    } catch (error) {
        console.error('Error al cargar préstamos vencidos:', error);
    } finally {
        notificationsLoading.value = false;
    }
}

function getDaysOverdue(dueDate) {
    if (!dueDate) return 0;

    const due = new Date(dueDate);
    const today = new Date();

    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const difference = today.getTime() - due.getTime();

    return Math.max(1, Math.ceil(difference / (1000 * 60 * 60 * 24)));
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

/* Menú lateral */
.admin-drawer {
    height: 100vh !important;
    border-right: none;
}

.drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.drawer-content::-webkit-scrollbar {
    width: 5px;
}

.drawer-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
}

.drawer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 25px 20px 22px;
    flex-shrink: 0;
}

.brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    border-radius: 12px;
    color: #123b5d;
    background: #f4b323;
}

.drawer-brand h2 {
    color: white;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
}

.drawer-brand span {
    color: #a9bac9;
    font-size: 11px;
}

.drawer-divider {
    border-color: rgba(255, 255, 255, 0.12);
}

.menu-label {
    padding: 23px 22px 10px;
    color: #91a7b9;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    flex-shrink: 0;
}

.navigation-list {
    padding: 0 12px;
    flex-shrink: 0;
}

.navigation-item {
    min-height: 43px;
    margin-bottom: 5px;
    color: #c3d0dc;
    font-size: 13px;
}

.navigation-item :deep(.v-list-item__prepend > .v-icon) {
    opacity: 0.9;
    font-size: 19px;
}

.navigation-item :deep(.v-list-item-title) {
    font-size: 13px;
    font-weight: 500;
}

.navigation-item.v-list-item--active {
    color: white;
    background: rgba(255, 255, 255, 0.13);
}

.navigation-item.v-list-item--active :deep(.v-list-item__overlay) {
    opacity: 0;
}

.drawer-footer {
    margin-top: auto;
    padding: 20px;
    flex-shrink: 0;
}

.system-info {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #b8c9d6;
    font-size: 12px;
}

.version-text {
    display: block;
    margin-top: 8px;
    color: #8199ac;
    font-size: 10px;
}

/* Contenido principal */
.main-content {
    height: 100vh;
    min-height: 0;
    overflow: hidden;
    background: #f4f6fa;
}

.main-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

/* Barra superior */
.admin-app-bar {
    display: flex;
    align-items: center;
    flex: 0 0 68px;
    width: 100%;
    height: 68px;
    min-height: 68px;
    padding: 0 16px;
    background: white;
    border-bottom: 1px solid #e9edf2;
    z-index: 2;
}

.page-heading {
    display: flex;
    align-items: center;
    color: #1b2533;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
}

.breadcrumb-parent {
    color: #8995a3;
    font-weight: 400;
}

.breadcrumb-current {
    color: #1b2533;
    font-weight: 700;
}

.notification-button {
    margin-right: 12px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 12px;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    color: #263648;
    font-size: 12px;
    font-weight: 700;
}

.user-role {
    color: #8491a1;
    font-size: 10px;
}

.logout-button {
    margin-right: 8px;
}

/* Menú de notificaciones */
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
    font-size: 14px;
    font-weight: 700;
}

.notification-subtitle {
    margin-top: 3px;
    color: #8491a1;
    font-size: 11px;
}

.notification-list {
    max-height: 340px;
    overflow-y: auto;
    padding: 5px 8px;
}

.notification-item {
    min-height: 62px;
    border-radius: 8px;
    cursor: pointer;
}

.notification-item:hover {
    background: #f4f6fa;
}

.notification-student {
    color: #263648;
    font-size: 12px;
    font-weight: 600;
}

.notification-book {
    max-width: 200px;
    margin-top: 3px;
    color: #8491a1;
    font-size: 11px;
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
    font-size: 12px;
    font-weight: 600;
}

.notification-empty small {
    color: #8491a1;
    font-size: 11px;
    font-weight: 400;
}

.notification-footer {
    padding: 8px 12px;
}

.notification-footer > span {
    display: block;
    margin-bottom: 4px;
    color: #8491a1;
    font-size: 10px;
    text-align: center;
}

/* Scroll independiente de las vistas */
.content-scroll {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
}

.content-scroll::-webkit-scrollbar {
    width: 7px;
}

.content-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.content-wrapper {
    width: 100%;
    min-height: 100%;
    padding: 24px;
}

@media (max-width: 600px) {
    .admin-app-bar {
        padding: 0 10px;
    }

    .content-wrapper {
        padding: 16px 12px;
    }

    .breadcrumb {
        gap: 4px;
        font-size: 11px;
    }

    .user-details {
        display: none;
    }

    .user-info {
        margin-right: 4px;
    }

    .notification-button {
        margin-right: 4px;
    }

    .logout-button {
        margin-right: 2px;
    }
}
</style>
