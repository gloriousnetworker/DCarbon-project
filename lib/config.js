import axios from 'axios';

const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.dev.dcarbon.solutions',
};

export default CONFIG;
const axiosInstance = axios.create({
    baseURL: CONFIG.API_BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export { axiosInstance };


// https://api.dev.dcarbon.solutions/

// https://services.dcarbon.solutions
