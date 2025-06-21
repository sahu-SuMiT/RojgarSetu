import axios from 'axios';

const API = axios.create({
  baseURL: 'https://campusadmin.onrender.com', 
  withCredentials: true,
});

export default API;
