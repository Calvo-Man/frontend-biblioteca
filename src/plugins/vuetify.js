
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import { createVuetify } from 'vuetify';

export default createVuetify({
  theme: {
    defaultTheme: 'bibliotecaLight',

    themes: {
      bibliotecaLight: {
        dark: false,

        colors: {
          // Colores institucionales.
          primary: '#123B5D',
          secondary: '#1D5278',
          accent: '#F4B323',

          // Fondos y superficies.
          background: '#F4F6FA',
          surface: '#FFFFFF',

          // Estados.
          success: '#16A36A',
          warning: '#E9A323',
          error: '#DC4545',
          info: '#3184C6',

          // Texto.
          'on-background': '#1B2533',
          'on-surface': '#1B2533',
        },
      },
    },
  },

  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
      style: 'text-transform: none; font-weight: 600;',
    },

    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },

    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },

    VCard: {
      rounded: 'lg',
      elevation: 0,
    },

    VChip: {
      rounded: 'lg',
    },
  },
});
