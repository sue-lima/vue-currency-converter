<script>
import { ref, onMounted, reactive, computed } from 'vue'
import api from '@/services/api'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'

export default {
  setup() {
    const symbol = ref([])
    const state = reactive({
      selectedOptionFrom: '',
      selectedOptionTo: '',
      amountValue: ''
    })

    const rules = computed(() => {
      return {
        selectedOptionFrom: { required },
        selectedOptionTo: { required },
        amountValue: { required },
      }
    })

    const v$ = useVuelidate(rules, state)

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

    return { symbol, state, v$ }
  },

  data() {
    return {
      customInputMessage: 'This field is required.',
      customSelectMessage: 'Please choose the currency.',
    };
  },

  methods: {
    exibirValorSelecionado() {
      api.get(`/latest?/source=ecb&base=${this.state.selectedOptionFrom}`)
        .then((response) => {
          const amount = this.state.amountValue;
          const currencyTo = this.state.selectedOptionTo;
          const currencyFrom = this.state.selectedOptionFrom;
          const rate = response.data.rates[currencyTo];
          this.v$.$validate()
          function convert(amount, rate) {
            return amount * rate;
          }
          if (!this.v$.$error) {
            const result = convert(amount, rate);
            document.querySelector(".display-result").innerHTML = `${amount} ${currencyFrom.toUpperCase()} equal to ${currencyTo} ${result.toFixed(2)}`;
          } else {
            alert('Select all fields correctly');
          }
        })
        .catch((error) => {
          console.log("Error: ", error);
        });
      return false;
    },
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
      <input v-model="state.amountValue" type="number" id="amount" step="0.01" placeholder="Enter the amount"/>
      <span v-if="v$.amountValue.$error">{{ customInputMessage }}</span>
      <select v-model="state.selectedOptionFrom" id="currency-from" required>
        <option value="" disabled selected hidden>Please Choose</option>
        <option v-for="(currency, i) in symbol" :key="i" :value="currency.code">
          {{ currency.code }} - {{ currency.description }}
        </option>
      </select>
      <span v-if="v$.selectedOptionFrom.$error">{{ customSelectMessage }}</span>
      <p>--</p>
      <select v-model="state.selectedOptionTo" id="currency-to" required>
        <option value="" disabled selected hidden>Please Choose</option>
        <option v-for="(currency, i) in symbol" :key="i" :value="currency.code">
          {{ currency.code }} - {{ currency.description }}
        </option>
      </select>
      <span v-if="v$.selectedOptionTo.$error">{{ customSelectMessage }}</span>
      <button @click="exibirValorSelecionado" class="bg-gray-500 p-3">Converter</button>
    </div>
    <div class="display-result d-flex justify-content-center text-success">
    </div>
  </main>
  <footer class="grow-0">
    <div class="text-center h-16 flex justify-center items-center">
      <p>Coded with ❤️ by <a href="https://github.com/sue-lima">Sue Lima</a></p>
    </div>
  </footer>
</template>
