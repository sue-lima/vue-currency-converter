<template>
  <div class="flex flex-col pt-7">
    <VueDatePicker v-model="date" model-type="yyyy-MM-dd"></VueDatePicker>
    <button @click="lua" class="bg-gold-400 text-white p-3">History</button>
  </div>
  <div class="display-historical d-flex justify-content-center text-success">
  </div>
</template>

<script>
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import api from '@/services/api'

export default {
  name: 'GraphConverter',
  components: { VueDatePicker },
  props: {
    selectedOptionFrom: String,
    selectedOptionTo: String,
  },

  setup() {
    const apiKey = import.meta.env.VITE_API_KEY
    return { apiKey }
  },

  data() {
    return {
      date: null,
    };
  },

  methods: {
    async lua() {
      try {
        const response = await api.get(`v3/historical?apikey=${this.apiKey}&currencies=${this.selectedOptionTo}&base_currency=${this.selectedOptionFrom}&date=${this.date}`);
        const result = response.data.data[this.selectedOptionTo].value
        this.updateHistoricalResult(result)
      } catch (error) {
        console.error("Error:", error);
      }
    },
    updateHistoricalResult(result) {
      const resultDisplay = `On ${this.date} ${this.selectedOptionFrom} was equal to ${result.toFixed(2)} ${this.selectedOptionTo}`;
      document.querySelector(".display-historical").innerHTML = resultDisplay;
    },
  }
}
</script>