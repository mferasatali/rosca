import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const light = {
  dark: false,
  colors: {
    primary: '#059669',
    'primary-darken-1': '#047857',
    secondary: '#0D9488',
    accent: '#14B8A6',
    error: '#EF4444',
    info: '#0D9488',
    success: '#10B981',
    warning: '#F59E0B',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#F8FAFC',
    'surface-variant': '#ECFDF5',
    'on-surface-variant': '#475569',
  },
}

const dark = {
  dark: true,
  colors: {
    primary: '#34D399',
    'primary-darken-1': '#10B981',
    secondary: '#2DD4BF',
    accent: '#5EEAD4',
    error: '#F87171',
    info: '#2DD4BF',
    success: '#34D399',
    warning: '#FBBF24',
    background: '#0A120E',
    surface: '#111F18',
    'surface-bright': '#152620',
    'surface-light': '#152620',
    'surface-variant': '#1A2E24',
    'on-surface-variant': '#94A3B8',
  },
}

export default createVuetify({
  components,
  directives,
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      rounded: 'lg',
      color: 'primary',
    },
    VTextarea: {
      variant: 'outlined',
      rounded: 'lg',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      rounded: 'lg',
      color: 'primary',
    },
    VChip: {
      rounded: 'lg',
    },
    VAlert: {
      rounded: 'lg',
      variant: 'tonal',
    },
    VDialog: {
      transition: 'dialog-bottom-transition',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: { light, dark },
  },
})
