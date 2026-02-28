import axios from 'axios';

const CONFIG = {
  API_BASE_URL: '',
};

export default CONFIG;
const axiosInstance = axios.create({
    baseURL: CONFIG.API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export { axiosInstance };