<template>
  <div>
    <Nu v-if="loaded" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="js">
import { Line as Nu } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, PointElement } from 'chart.js'
import api from '@/services/api'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
)

export default {
  name: 'GraphConverter',
  components: { Nu },
  props: {
    selectedOptionFrom: String,
    selectedOptionTo: String,
  },
  
  data() {
    return {
      loaded: false,
      chartData: {
        labels: [],
        datasets: [{
          label: '', 
          data: [] 
        }]
      },
      chartOptions: {
        responsive: true,
      },
    };
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      try {
        const { data } = await this.fetchData();
        const labels = [];
        const datasetData = [];

        for (const date in data.rates) {
          if (Object.prototype.hasOwnProperty.call(data.rates, date)) {
            if (Object.prototype.hasOwnProperty.call(data.rates[date], this.selectedOptionTo)) {
              labels.push(date);
              datasetData.push(data.rates[date][this.selectedOptionTo]);
            }
          }
        }

        this.chartData.labels = labels;
        this.chartData.datasets[0].data = datasetData;
        this.loaded = true;
      } catch (error) {
        console.error('Erro ao carregar os dados:', error.message);
      }
    },
    fetchData() {
      const startDate = this.calculateStartDate();
      const endDate = this.formatDate(new Date());
      const url = `/timeseries?start_date=${startDate}&end_date=${endDate}&base=${this.selectedOptionFrom}`;
      return api.get(url);
    },
    calculateStartDate() {
      const daysToSubtract = 3;
      const date = new Date();
      date.setDate(date.getDate() - daysToSubtract);
      return this.formatDate(date);
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  },
}
</script>