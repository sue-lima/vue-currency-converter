<template>
  <main class="grow flex flex-col justify-center items-center">
    <div class="bg-gold-300 p-4 rounded-xl dark:bg-gold-700">
      <div class="gap-2 flex flex-col text-center">
        <div class="flex items-center justify-center">
          <img src="../assets/money.png" alt="" class="w-2/5">
          <div class="flex flex-col items-center justify-center">
            <span class="text-4xl p-4 font-bold">Currency converter</span>
            <span class="w-4/5">Convert any currency in the world by selecting the options below</span>
            <div class="pt-4 flex flex-col">
              <input v-model="state.amountValue" type="number" id="amount" step="0.01" placeholder="$ 0,00" class="p-3 rounded-xl w-28 text-center bg-gold-50 dark:bg-gold-500"/>
              <span v-if="v$.amountValue.$error">{{ customInputMessage }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-evenly pb-2">
          <div class="flex flex-col">
            <input v-model="selectedCurrencyFrom" type="text" :placeholder="inputPlaceholder" @focus="openSelectFrom()" @blur="closeSelectFrom" class="cursor-pointer p-3 rounded-xl w-[332px] bg-gold-50 dark:bg-gold-500" required>
            <div class="flex flex-col" @mousedown="handleMouseDown">
              <ul v-if="optionsFrom" class="bg-gold-100 mt-1 h-56 overflow-auto border-2 border-gold-700 rounded-md">
                <li v-for="(currency, i) in symbol" :key="i" @click="popo(currency)" class="flex items-center gap-2 p-3 cursor-pointer border-solid border-2 border-gold-700 hover:bg-gold-400">
                  <img :src="`../../src/assets/flags/${currency.code.toLowerCase()}.svg`" alt="" class="w-7">
                  <p>{{ currency.code }} - {{ currency.name }}</p>
                </li>
              </ul>
              <span v-if="v$.selectedOptionFrom.$error">{{ customSelectMessage }}</span>
            </div>
          </div>
          <img src="../assets/transfer.png" alt="" @click="reverse()" class="w-7 h-7 cursor-pointer">
          <div class="flex flex-col">
            <input v-model="selectedCurrencyTo" type="text" :placeholder="inputPlaceholder" @focus="openSelectTo()" @blur="closeSelectTo" class="cursor-pointer p-3 rounded-xl w-[332px] bg-gold-50 dark:bg-gold-500" required>
            <div class="" @mousedown="handleMouseDown">
              <ul v-if="optionsTo" class="bg-gold-100 mt-1 h-56 overflow-auto border-2 border-gold-700 rounded-md">
                <li v-for="(currency, i) in symbol" :key="i" @click="papa(currency)" class="flex items-center gap-2 p-3 cursor-pointer border-solid border-2 border-gold-700 hover:bg-gold-400">
                  <img :src="`../../src/assets/flags/${currency.code.toLowerCase()}.svg`" alt="" class="w-7">
                  <p>{{ currency.code }} - {{ currency.name }}</p>
                </li>
              </ul>
              <span v-if="v$.selectedOptionTo.$error">{{ customSelectMessage }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="state.selectedOptionFrom" class="flex items-center justify-evenly">
        <img @error="imagFallbackFrom" :src="imageFrom" alt="" class="w-48 h-48">
        <img src="../assets/rightarrow.png" alt="" class="w-11 h-11">
        <img v-if="state.selectedOptionTo" @error="imagFallbackTo" :src="imageTo" alt="" class="w-48 h-48">
      </div>
      <div class="flex flex-col items-center justify-center">
        <button @click="showConvertResult" class="bg-gold-400 dark:bg-gold-800 text-white font-bold w-36 hover:animate-pulse rounded-2xl p-3">Convert</button>
      </div>
      <div class="display-result d-flex justify-content-center text-success">
      </div>
      <Graph v-if="showComponent" :selectedOptionFrom="state.selectedOptionFrom" :selectedOptionTo="state.selectedOptionTo"/>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import api from '@/services/api'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import Swal from 'sweetalert2'
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
      imageTo: null,
      imageFrom: null,
      optionsTo: false,
      optionsFrom: false,
      inputPlaceholder: 'Choose a currency',
      selectedCurrencyFrom: '',
      selectedCurrencyTo: ''
    };
  },

  setup() {
    const apiKey = import.meta.env.VITE_API_KEY
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

    const fetchSymbol = async () => {
      try {
        const cachedData = localStorage.getItem('symbolData');
        
        if (cachedData) {
          symbol.value = JSON.parse(cachedData);
        } else {
          const response = await api.get(`v3/currencies?apikey=${apiKey}`);
          if (response.status === 200) {
            const objetoDaAPI = response.data.data;
            symbol.value = Object.values(objetoDaAPI);
            localStorage.setItem('symbolData', JSON.stringify(symbol.value));
          } else {
            throw new Error('A solicitação GET à API falhou');
          }
        }
      } catch (error) {
        console.error('Erro ao obter dados do cache ou da API:', error);
      }
    };

    onMounted(fetchSymbol)

    return { symbol, state, v$, apiKey }
  },

  methods: {
    async showConvertResult() {
      try {
        const response = await api.get(`v3/latest?apikey=${this.apiKey}&currencies=${this.state.selectedOptionTo}&base_currency=${this.state.selectedOptionFrom}`);
        const amount = this.state.amountValue;
        const currencyTo = this.state.selectedOptionTo;
        const currencyFrom = this.state.selectedOptionFrom;
        const rate = response.data.data[currencyTo]?.value;

        if (!rate && !currencyTo && !currencyFrom) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops! Something went wrong.',
            text: 'Please select all fields before converting',
          });
          return;
        }

        this.v$.$validate();

        if (!this.v$.$error) {
          const result = this.convertCurrency(amount, rate);
          this.updateResultDisplay(amount, currencyFrom, currencyTo, result);
          this.showComponent = true;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops! Something went wrong.',
            text: 'Please select all fields correctly',
          });
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
    },

    reverse() {
      const tempOption = this.state.selectedOptionFrom;
      this.state.selectedOptionFrom = this.state.selectedOptionTo;
      this.state.selectedOptionTo = tempOption;
      this.showConvertResult();
      this.showComponent = false;
    },

    imagFallbackFrom() {
      this.imageFrom = '../../src/assets/flags/noimg.svg'
    },

    imagFallbackTo() {
      this.imageTo = '../../src/assets/flags/noimg.svg'
    },

    checkImgExist() {
      return true;
    },

    openSelectTo() {
      this.optionsTo = true;
      this.inputPlaceholder = 'Taype for search'
    },

    closeSelectTo(event) {
      setTimeout(() => {
        if (!this.$el.contains(event.relatedTarget)) {
          this.optionsTo = false;
          this.inputPlaceholder = "Choose a currency";
        }
      }, 100);
    },

    openSelectFrom() {
      this.optionsFrom = true;
      this.inputPlaceholder = 'Taype for search'
    },

    closeSelectFrom(event) {
      setTimeout(() => {
        if (!this.$el.contains(event.relatedTarget)) {
          this.optionsFrom = false;
          this.inputPlaceholder = "Choose a currency";
        }
      }, 100);
    },

    handleMouseDown(event) {
      event.stopPropagation();
    },

    papa(currency) {
      this.optionsTo = false;
      this.selectedCurrencyTo = `${currency.code} - ${currency.name}`
      this.state.selectedOptionTo = `${currency.code}`;
    },

    popo(currency) {
      this.optionsFrom = false;
      this.selectedCurrencyFrom = `${currency.code} - ${currency.name}`
      this.state.selectedOptionFrom = `${currency.code}`;
    },
  },

  watch: {
    'state.selectedOptionFrom': function (newOptionFrom) {
      if (newOptionFrom) {
        const imagePath = `../../src/assets/flags/${newOptionFrom.toLowerCase()}.svg`;
        this.imageFrom = this.checkImgExist(imagePath) ? imagePath : null;
      }
    },

    'state.selectedOptionTo': function (newOptionTo) {
      if (newOptionTo) {
        const imagePath = `../../src/assets/flags/${newOptionTo.toLowerCase()}.svg`;
        this.imageTo = this.checkImgExist(imagePath) ? imagePath : null;
      }
    },
  }
}
</script>