<template>
  <header class="grow-0 flex justify-end p-5">
    <div @click="toggleDarkTheme" class="relative w-14 h-7 rounded-full cursor-pointer bg-gold-400 dark:bg-gold-600">
      <i id="toggle" class="absolute w-7 h-7 rounded-full bg-gold-200 dark:bg-gold-400 scale-75 dark:left-7"></i>
    </div>
  </header>
</template>

<script>
export default {
  name: 'DarkModeHeader',

  methods: {
    toggleDarkTheme() {
      this.$emit('dark-switch')
    },
  },
}
</script>