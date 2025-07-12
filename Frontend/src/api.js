import axios from 'axios';
import { getApiUrl } from './config/apiConfig';

const API = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

export default API;
