
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

// Configuración de Vite para Vue 3 + Vuetify.
export default defineConfig({
  plugins: [
    vue(),

    // Importación automática de componentes y directivas Vuetify.
    vuetify({
      autoImport: true,
    }),
  ],

  server: {
    port: 5173,
    host: true,
  },
});
