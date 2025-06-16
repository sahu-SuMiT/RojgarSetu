import axios from 'axios';

const API = axios.create({
  baseURL: 'https://company.rojgarsetu.org/', 
});

export default API;
