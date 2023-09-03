<script>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

export default {
  setup() {
    const symbol = ref([])

    const fetchSymbol = () =>
      api.get('/symbols').then((response) => {
        if (response.status === 200) {
          const objetoDaAPI = response.data.symbols
          symbol.value = Object.values(objetoDaAPI)
        } else {
          throw new Error('A solicitação GET à API falhou')
        }
      })

    onMounted(fetchSymbol)

    return { symbol }
  },

  data() {
    return {
      selectedOptionFrom: '',
      selectedOptionTo: ''
    }
  },
  methods: {
    exibirValorSelecionado() {
      console.log('Valor selecionado From:', this.selectedOptionFrom)
      console.log('Valor selecionado To:', this.selectedOptionTo)
    }
  }
}
</script>

<template>
  <header class="grow-0 flex justify-end p-5">
    <div class="relative w-14 h-7 rounded-full cursor-pointer bg-pink-900">
      <i id="toggle" class="absolute w-7 h-7 rounded-full bg-pink-700 scale-75"></i>
    </div>
  </header>
  <main class="grow flex justify-center items-center">
    <div class="rounded-xl p-5 gap-2 flex border text-center">
      <input type="number" id="amount" step="0.01" />
      <select v-model="selectedOptionFrom" id="currency-from">
        <option value="" disabled selected hidden>Please Choose</option>
        <option v-for="(teste, i) in symbol" :key="i" :value="teste.code">
          {{ teste.code }} - {{ teste.description }}
        </option>
      </select>
      <p>--</p>
      <select v-model="selectedOptionTo" id="currency-to">
        <option value="" disabled selected hidden>Please Choose</option>
        <option v-for="(teste, i) in symbol" :key="i" :value="teste.code">
          {{ teste.code }} - {{ teste.description }}
        </option>
      </select>
      <button @click="exibirValorSelecionado" class="bg-gray-500 p-3">Converter</button>
    </div>
  </main>
  <footer class="grow-0">
    <div class="text-center h-16 flex justify-center items-center">
      <p>Coded with ❤️ by <a href="https://github.com/sue-lima">Sue Lima</a></p>
    </div>
  </footer>
</template>
