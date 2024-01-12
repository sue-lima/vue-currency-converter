<script>
import DarkMode from './components/DarkMode.vue'
import Attribution from './components/Attribution.vue'
import Converter from './components/Converter.vue'

export default {
  name: 'App',
  components: {
    DarkMode,
    Attribution,
    Converter,
  },

  data() {
    return {
      isDarkTheme: false,
    };
  },

  methods: {
    onDarkSwitch() {
      this.isDarkTheme = !this.isDarkTheme;
    },
  },
}
</script>

<template>
  <div id="app" :class="{ dark: isDarkTheme }">
    <DarkMode @dark-switch="onDarkSwitch"/>
    <Converter/>
    <Attribution />
  </div>
</template>