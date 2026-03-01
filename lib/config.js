import axios from 'axios';

const CONFIG = {
  API_BASE_URL: 'https://naijatrips-app-dcarbon-server.cafyit.easypanel.host',
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


// https://naijatrips-app-dcarbon-server.cafyit.easypanel.host/

// https://services.dcarbon.solutions