<template>
  <main class="grow flex flex-col justify-center items-center">
    <div class="bg-gold-300 p-4 rounded-xl dark:bg-gold-700 w-96 animate__animated animate__zoomIn sm:w-[650px] lg:w-auto">
      <div class="gap-2 flex flex-col text-center">
        <div class="flex flex-col items-center justify-center md:flex-row">
          <img src="../assets/money.png" alt="" class="w-2/5">
          <div class="flex flex-col items-center justify-center">
            <span class="text-4xl p-4 font-bold">Currency converter</span>
            <span class="w-4/5">Convert any currency in the world by selecting the options below</span>
            <div class="pt-4 flex flex-col">
              <input v-model="state.amountValue" type="number" id="amount" step="0.01" placeholder="$ 0,00" class="p-3 outline-none rounded-xl w-28 text-center bg-gold-50 dark:bg-gold-500"/>
              <span v-if="v$.amountValue.$error">{{ customInputMessage }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center flex-col gap-2 justify-evenly pb-2 lg:flex-row">
          <div class="flex flex-col">
            <input v-model="selectedCurrencyFrom" @input="filterOptionsFrom" type="text" :placeholder="inputPlaceholderFrom" @focus="openSelectFrom()" @blur="closeSelectFrom" class="arrow cursor-pointer p-3 outline-none rounded-xl w-[332px] bg-gold-50 dark:bg-gold-500" required>
            <div class="flex flex-col" style="z-index: 2;" @mousedown="handleMouseDown">
              <div v-if="optionsFrom" class="absolute bg-gold-50 mt-1 min-w-[332px] h-56 overflow-auto border-2 border-gold-400 dark:border-gold-800 dark:bg-gold-600 rounded-md">
                <div v-for="(currency, i) in symbol" :key="i" @click="openOptionsFrom(currency)" class="current-from flex items-center gap-2 p-3 cursor-pointer border-solid border-2 border-gold-400  dark:border-gold-800  dark:hover:bg-gold-700 hover:bg-gold-300">
                  <img :src="imageSrc(currency)" alt="" class="w-7 h-7">
                  <p>{{ currency.code }} - {{ currency.name }}</p>
                </div>
              </div>
              <span v-if="v$.selectedOptionFrom.$error">{{ customSelectMessage }}</span>
            </div>
          </div>
          <div class="flex items-center justify-center cursor-pointer rounded-full w-12 h-12 bg-gold-50 dark:bg-gold-500 dark:hover:bg-gold-400 hover:bg-gold-200" title="Invert currency">
            <img src="../assets/transfer.png" alt="" @click="reverse()" class="w-7 h-7">
          </div>
          <div class="flex flex-col">
            <input v-model="selectedCurrencyTo" @input="filterOptionsTo" type="text" :placeholder="inputPlaceholderTo" @focus="openSelectTo()" @blur="closeSelectTo" class="arrow cursor-pointer p-3 outline-none rounded-xl w-[332px] bg-gold-50 dark:bg-gold-500 bg-arrow-down" required>
            <div class="flex flex-col" style="z-index: 2;" @mousedown="handleMouseDown">
              <div v-if="optionsTo" class="absolute bg-gold-50 mt-1 min-w-[332px] h-56 overflow-auto border-2 border-gold-400 dark:border-gold-800 dark:bg-gold-600 rounded-md">
                <div v-for="(currency, i) in symbol" :key="i" @click="openOptionsTo(currency)" class="current-to flex items-center gap-2 p-3 cursor-pointer border-solid border-2 border-gold-400  dark:border-gold-800  dark:hover:bg-gold-700 hover:bg-gold-300">
                  <img :src="imageSrc(currency)" alt="" class="w-7 h-7">
                  <p>{{ currency.code }} - {{ currency.name }}</p>
                </div>
              </div>
              <span v-if="v$.selectedOptionTo.$error">{{ customSelectMessage }}</span>
            </div>
          </div>
        </div>
        <div v-if="state.selectedOptionFrom" class="flex flex-col items-center justify-evenly md:flex-row">
          <img @error="imagFallbackFrom" :src="imageFrom" alt=""  class="w-48 h-48 animate__animated animate__fadeInDown">
          <img src="../assets/rightarrow.png" alt="" class="w-11 h-11">
          <img v-if="state.selectedOptionTo" @error="imagFallbackTo" :src="imageTo" alt="" class="w-48 h-48 animate__animated animate__fadeInDown">
        </div>
        <div class="flex flex-col items-center justify-center">
          <button @click="showConvertResult" class="bg-gold-400 dark:bg-gold-800 text-white font-bold w-40 hover:animate-pulse rounded-2xl p-3">Convert</button>
        </div>
      </div>
      <div class="display-result flex flex-col items-center justify-center pt-4 text-2xl dark:text-gold-50 text-gold-700 font-medium"></div>
      <History v-if="showComponent" :selectedOptionFrom="state.selectedOptionFrom" :selectedOptionTo="state.selectedOptionTo"/>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import api from '@/services/api'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import Swal from 'sweetalert2'
import History from './History.vue'

export default {
  name: 'ConverterBox',
  components: {
    History,
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
      inputPlaceholderFrom: 'Choose a currency',
      inputPlaceholderTo: 'Choose a currency',
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
            throw new Error('The GET request to the API failed');
          }
        }
      } catch (error) {
        console.error('Error retrieving data from cache or API:', error);
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
        Swal.fire({
          icon: 'error',
          title: 'Oops! Something went wrong.',
        });
      }
    },

    convertCurrency(amount, rate) {
      return amount * rate;
    },

    updateResultDisplay(amount, currencyFrom, currencyTo, result) {
      const resultDisplay = `${amount} ${currencyFrom} is equal to ${result.toFixed(2)} ${currencyTo}`;
      document.querySelector(".display-result").innerText = resultDisplay;
    },

    reverse() {
      const tempOption = this.state.selectedOptionFrom;
      this.state.selectedOptionFrom = this.state.selectedOptionTo;
      this.state.selectedOptionTo = tempOption;
      this.showConvertResult();
      this.showComponent = false;
    },

    imagFallbackFrom() {
      this.imageFrom = new URL(`/src/assets/flags/noimg.svg`, import.meta.url).href
    },

    imagFallbackTo() {
      this.imageTo = new URL(`/src/assets/flags/noimg.svg`, import.meta.url).href
    },

    checkImgExist() {
      return true;
    },

    openSelectTo() {
      this.optionsTo = true;
      this.inputPlaceholderTo = 'Type for search'
      this.optionsFrom = false;
    },

    closeSelectTo(event) {
      setTimeout(() => {
        if (!this.$el.contains(event.relatedTarget)) {
          this.optionsTo = false;
          this.inputPlaceholderTo = "Choose a currency";
        }
      }, 100);
    },

    openSelectFrom() {
      this.optionsFrom = true;
      this.inputPlaceholderFrom = 'Type for search'
      this.optionsTo = false;
    },

    closeSelectFrom(event) {
      setTimeout(() => {
        if (!this.$el.contains(event.relatedTarget)) {
          this.optionsFrom = false;
          this.inputPlaceholderFrom = "Choose a currency";
        }
      }, 100);
    },

    handleMouseDown(event) {
      event.stopPropagation();
    },

    openOptionsTo(currency) {
      this.optionsTo = false;
      this.selectedCurrencyTo = `${currency.code} - ${currency.name}`
      this.state.selectedOptionTo = `${currency.code}`;
    },

    openOptionsFrom(currency) {
      this.optionsFrom = false;
      this.selectedCurrencyFrom = `${currency.code} - ${currency.name}`
      this.state.selectedOptionFrom = `${currency.code}`;
    },

    filterOptionsFrom() {
      let dropdown_items = document.getElementsByClassName("current-from");
      if (!dropdown_items)
        return false;
      for (let i = 0; i < dropdown_items.length; i++) {
        if (dropdown_items[i].innerHTML.toUpperCase().includes(this.selectedCurrencyFrom.toUpperCase()))
          dropdown_items[i].style.display = 'flex';
        else
          dropdown_items[i].style.display = 'none';
      }
    },

    filterOptionsTo() {
      let dropdown_items = document.getElementsByClassName("current-to");
      if (!dropdown_items)
        return false;
      for (let i = 0; i < dropdown_items.length; i++) {
        if (dropdown_items[i].innerHTML.toUpperCase().includes(this.selectedCurrencyTo.toUpperCase()))
          dropdown_items[i].style.display = 'flex';
        else
          dropdown_items[i].style.display = 'none';
      }
    },

    imageSrc(image) {
      return new URL(`/src/assets/flags/${image.code.toLowerCase()}.svg`, import.meta.url).href
    },
  },

  watch: {
    'state.selectedOptionFrom': function (newOptionFrom) {
      if (newOptionFrom) {
        const imagePath = new URL(`/src/assets/flags/${newOptionFrom.toLowerCase()}.svg`, import.meta.url).href;
        this.imageFrom = this.checkImgExist(imagePath) ? imagePath : null;
      }
    },

    'state.selectedOptionTo': function (newOptionTo) {
      if (newOptionTo) {
        const imagePath = new URL(`/src/assets/flags/${newOptionTo.toLowerCase()}.svg`, import.meta.url).href;
        this.imageTo = this.checkImgExist(imagePath) ? imagePath : null;
      }
    },
  }
}
</script>

<style>
.arrow {
  background-image: url('../assets/down-arrow.png'); 
  background-repeat: no-repeat; 
  background-size: 25px; 
  background-position: right 10px top 50%;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: #EADBC8;
}

.dark ::-webkit-scrollbar-track {
  background-color: #756e64;
}

::-webkit-scrollbar-thumb {
  background-color: #46423c;
}

.dark ::-webkit-scrollbar-thumb {
  background-color: #2f2c28;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #5e5850;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background-color: #AE9A82;
}
</style>