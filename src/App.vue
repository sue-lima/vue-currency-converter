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
  }
}
</script>

<template>
  <DarkMode />
  <Converter />
  <Attribution />
</template>
