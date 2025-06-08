import axios from 'axios';

const API = axios.create({
  baseURL: 'https://campusadmin.onrender.com/api', 
});

export default API;
