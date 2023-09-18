<template>
  <main class="grow flex flex-col justify-center items-center">
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
    <Graph v-if="showComponent" :selectedOptionFrom="state.selectedOptionFrom" :selectedOptionTo="state.selectedOptionTo"/>
  </main>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import api from '@/services/api'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import Graph from './Graph.vue'

export default {
  name: 'ConverterBox',
  components: {
    Graph,
  },

  data() {
    return {
      customInputMessage: 'This field is required.',
      customSelectMessage: 'Please choose the currency.',
      showComponent: false,
    };
  },

  setup() {
    const symbol = ref([])
    const state = reactive({
      selectedOptionFrom: '',
      selectedOptionTo: '',
      amountValue: ''
    });

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

  methods: {
    async exibirValorSelecionado() {
      try {
        const response = await api.get(`/latest?/source=ecb&base=${this.state.selectedOptionFrom}`);
        const amount = this.state.amountValue;
        const currencyTo = this.state.selectedOptionTo;
        const currencyFrom = this.state.selectedOptionFrom;
        const rate = response.data.rates[currencyTo];

        this.v$.$validate();

        if (!this.v$.$error) {
          const result = this.convertCurrency(amount, rate);
          this.updateResultDisplay(amount, currencyFrom, currencyTo, result);
          this.showComponent = true;
        } else {
          alert('Select all fields correctly');
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    convertCurrency(amount, rate) {
      return amount * rate;
    },
    updateResultDisplay(amount, currencyFrom, currencyTo, result) {
      const resultDisplay = `${amount} ${currencyFrom.toUpperCase()} equal to ${currencyTo} ${result.toFixed(2)}`;
      document.querySelector(".display-result").innerHTML = resultDisplay;
    }
  }
}
</script>