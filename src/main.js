
import { createApp } from 'vue';

import App from './App.vue';

// Plugins principales.
import vuetify from './plugins/vuetify';

// Gestión de estado.
import { createPinia } from 'pinia';

// Navegación.
import router from './router';

// Estilos globales.
import './assets/main.css';

const app = createApp(App);

// Registrar Pinia.
app.use(createPinia());

// Registrar Vue Router.
app.use(router);

// Registrar Vuetify.
app.use(vuetify);

// Montar aplicación.
app.mount('#app');
