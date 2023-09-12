<template>
  <div>
    <p>oi</p>
  </div>
</template>

<script>
import api from '@/services/api'
import { onMounted, ref } from 'vue'

export default {
  name: 'GraphConverter',
  props: {
    selectedOptionFrom: String,
  },

  setup(props) {
    const teste = ref([]);

    function formatarDataParaAAAA_MM_DD(data) {
      const ano = data.getFullYear();
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const dia = data.getDate().toString().padStart(2, '0');
      return  `${ano}-${mes}-${dia}`;
    }
    const data = new Date();
    const data2 = new Date();
    const diasParaSubtrair = 7;
    data.setDate(data.getDate() - diasParaSubtrair);
    const dataFormatada = formatarDataParaAAAA_MM_DD(data);
    const datahoje = formatarDataParaAAAA_MM_DD(data2);

    const fetchEita = () =>
      api.get(`/timeseries?&start_date=${dataFormatada}1&end_date=${datahoje}&base=${props.selectedOptionFrom}`).then((res) => 
      (teste.value = res.data.rates))
      console.log(teste)
    onMounted(fetchEita)
  }
}
</script>