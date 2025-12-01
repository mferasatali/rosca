import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0891B2', // Sophisticated Teal
          secondary: '#64748B', // Slate Gray
          accent: '#0D9488', // Darker Teal
          error: '#DC2626',
          info: '#0284C7', // Professional Blue
          success: '#059669', // Refined Green
          warning: '#D97706', // Muted Amber
          background: '#F1F5F9', // Soft Gray
          surface: '#FFFFFF',
        },
      },
    },
  },
})

