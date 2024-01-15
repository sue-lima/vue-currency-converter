<template>
  <div class="grid grid-cols-2 justify-items-center items-center pt-7">
    <div>
      <p class="text-xl font-bold">View history by date</p>
      <div class="flex justify-center items-center gap-1.5">
        <VueDatePicker v-model="date" model-type="dd/MM/yyyy" :enable-time-picker="false" placeholder="Select Date" class="dark:bg-gold-500"></VueDatePicker>
        <button @click="viewHistory" class="bg-gold-400 text-white font-bold rounded-2xl p-3 dark:bg-gold-800 hover:animate-pulse">History</button>
      </div>
    </div>
    <div class="display-historical text-lg italic font-medium w-52 text-center text-gold-700 dark:text-gold-50"></div>
  </div>
</template>

<script>
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import api from '@/services/api'
import Swal from 'sweetalert2'

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
    async viewHistory() {
      if (!this.date) {
        Swal.fire({
          icon: 'error',
          title: 'Oops! Something went wrong.',
          text: 'Please select a date',
        });
      }

      try {
        const response = await api.get(`v3/historical?apikey=${this.apiKey}&currencies=${this.selectedOptionTo}&base_currency=${this.selectedOptionFrom}&date=${this.date}`);
        const result = response.data.data[this.selectedOptionTo].value
        this.updateHistoricalResult(result)
      } catch (error) {
        console.error("Error:", error);
      }
    },
    updateHistoricalResult(result) {
      const resultDisplay = `On ${this.date} 1 ${this.selectedOptionFrom} was equal to ${result.toFixed(2)} ${this.selectedOptionTo}`;
      document.querySelector(".display-historical").innerHTML = resultDisplay;
    },
  }
}
</script>