import axios from "axios";

const api = axios.create({
  baseURL: "https://api.currencyapi.com/",
});

export default api