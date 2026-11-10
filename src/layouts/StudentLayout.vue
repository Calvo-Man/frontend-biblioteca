
<template>
    <v-layout class="student-layout">
        <!-- Menú lateral -->
        <v-navigation-drawer
            v-model="drawer"
            :permanent="mdAndUp"
            :temporary="!mdAndUp"
            width="255"
            color="#080F19"
            class="student-drawer"
            :scrim="!mdAndUp"
        >
            <div class="drawer-content">
                <div class="drawer-brand">
                    <div class="brand-icon">
                        <v-icon icon="mdi-book-open-page-variant" size="27" />
                    </div>

                    <div>
                        <h2>Biblioteca</h2>
                        <span>Portal del estudiante</span>
                    </div>
                </div>

                <v-divider class="drawer-divider" />

                <div class="menu-label">MI ESPACIO</div>

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
                        <span>Cuenta protegida</span>
                    </div>

                    <span class="version-text">Biblioteca Escolar</span>
                </div>
            </div>
        </v-navigation-drawer>

        <!-- Contenido principal -->
        <v-main class="main-content">
            <div class="main-container">

                <!-- Barra superior -->
                <div class="student-app-bar">
                    <v-btn
                        v-if="!mdAndUp"
                        icon="mdi-menu"
                        variant="text"
                        @click="drawer = !drawer"
                    />

                    <div class="page-heading">
                        <div class="breadcrumb">
                            <span class="breadcrumb-parent">Mi espacio</span>

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

                    <div class="user-info">
                        <v-avatar color="#EAF0F6" size="38">
                            <v-icon
                                icon="mdi-account-school-outline"
                                color="primary"
                                size="22"
                            />
                        </v-avatar>

                        <div class="user-details">
                            <span class="user-name">
                                {{ authStore.user?.username || 'Estudiante' }}
                            </span>

                            <span class="user-role">Estudiante</span>
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

                <!-- Zona de desplazamiento -->
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
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const { mdAndUp } = useDisplay();

const drawer = ref(true);

const menuItems = [
    {
        title: 'Inicio',
        icon: 'mdi-view-dashboard-outline',
        to: '/student/dashboard',
    },
    {
        title: 'Catálogo de libros',
        icon: 'mdi-book-search-outline',
        to: '/student/catalog',
    },
    {
        title: 'Mis préstamos',
        icon: 'mdi-book-arrow-right-outline',
        to: '/student/loans',
    },
    {
        title: 'Mi historial',
        icon: 'mdi-history',
        to: '/student/history',
    },
    {
        title: 'Mi perfil',
        icon: 'mdi-account-circle-outline',
        to: '/student/profile',
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

async function handleLogout() {
    try {
        await authStore.logout();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    } finally {
        await router.replace('/login');
    }
}
</script>

<style scoped>
.student-layout {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #F4F6FA;
}

/* Menú lateral */
.student-drawer {
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
    color: #123B5D;
    background: #F4B323;
}

.drawer-brand h2 {
    color: white;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
}

.drawer-brand span {
    color: #A9BAC9;
    font-size: 11px;
}

.drawer-divider {
    border-color: rgba(255, 255, 255, 0.09);
}

.menu-label {
    padding: 23px 22px 10px;
    color: #8190A0;
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
    color: #AEBAC7;
    font-size: 13px;
    transition: background 0.2s ease, color 0.2s ease;
}

.navigation-item :deep(.v-list-item__prepend > .v-icon) {
    opacity: 0.9;
    font-size: 19px;
}

.navigation-item :deep(.v-list-item-title) {
    font-size: 13px;
    font-weight: 500;
}

.navigation-item:not(.v-list-item--active):hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
}

.navigation-item.v-list-item--active {
    color: #17212B;
    background: #F4B323;
    font-weight: 700;
}

.navigation-item.v-list-item--active :deep(.v-list-item__overlay) {
    opacity: 0;
}

.navigation-item.v-list-item--active :deep(.v-list-item__prepend > .v-icon) {
    color: #17212B;
    opacity: 1;
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
    color: #B8C9D6;
    font-size: 12px;
}

.version-text {
    display: block;
    margin-top: 8px;
    color: #8199AC;
    font-size: 10px;
}

/* Contenido principal */
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

/* Barra superior */
.student-app-bar {
    display: flex;
    align-items: center;
    flex: 0 0 68px;
    width: 100%;
    height: 68px;
    min-height: 68px;
    padding: 0 16px;
    background: white;
    border-bottom: 1px solid #E9EDF2;
    z-index: 2;
}

.page-heading {
    display: flex;
    align-items: center;
    color: #1B2533;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
}

.breadcrumb-parent {
    color: #8995A3;
    font-weight: 400;
}

.breadcrumb-current {
    color: #1B2533;
    font-weight: 700;
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
    color: #8491A1;
    font-size: 10px;
}

.logout-button {
    margin-right: 8px;
}

/* Scroll independiente */
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
    padding: 24px;
}

/* Adaptación móvil */
@media (max-width: 600px) {
    .student-app-bar {
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

    .logout-button {
        margin-right: 2px;
    }
}
</style>
