<script>
import DarkMode from './components/DarkMode.vue'
import Attribution from './components/Attribution.vue'
import Converter from './components/Converter.vue'
//import Graph from './components/Graph.vue'

export default {
  name: 'App',
  components: {
    DarkMode,
    Attribution,
    Converter,
    //Graph,
  }
}
</script>

<template>
  <DarkMode />
  <Converter />
  <Attribution />
</template>
