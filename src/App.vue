<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import RoscaManager from './components/RoscaManager.vue'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  const next = isDark.value ? 'light' : 'dark'
  theme.global.name.value = next
  document.documentElement.setAttribute('data-theme', next)
}
</script>

<template>
  <v-app>
    <RoscaManager @toggle-theme="toggleTheme" :is-dark="isDark" />
  </v-app>
</template>

<style>
#app {
  font-family: 'Plus Jakarta Sans', Inter, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
