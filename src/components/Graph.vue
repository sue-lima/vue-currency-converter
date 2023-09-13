<template>
  <div>
    <div v-for="(dateData, date) in currency" :key="date">
      <p class="flex bg-purple-900">{{ date }}</p>
      <p> {{ dateData[selectedOptionTo]}}</p>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import { onMounted, ref } from 'vue'

export default {
  name: 'GraphConverter',
  props: {
    selectedOptionFrom: String,
    selectedOptionTo: String,
  },

  setup(props) {
    const currency = ref({});

    function formatarDataParaAAAA_MM_DD(data) {
      const ano = data.getFullYear();
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const dia = data.getDate().toString().padStart(2, '0');
      return  `${ano}-${mes}-${dia}`;
    }
    const data = new Date();
    const diasParaSubtrair = '3';
    data.setDate(data.getDate() - diasParaSubtrair);
    const dataFormatada = formatarDataParaAAAA_MM_DD(data);
    const datahoje = formatarDataParaAAAA_MM_DD(new Date());

    const fetchEita = () =>
      api.get(`/timeseries?&start_date=${dataFormatada}1&end_date=${datahoje}&base=${props.selectedOptionFrom}`).then((res) => {
        currency.value = res.data.rates
      })
    onMounted(fetchEita)

    return { currency }
  },
}
</script>