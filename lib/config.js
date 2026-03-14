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

// Redirect to login on expired sessions
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/api/auth/login') &&
      !error.config?.url?.includes('/api/user/register')
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('loginResponse');
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userProfilePicture');
        localStorage.removeItem('isPartnerOperator');
        localStorage.removeItem('partnerType');
        localStorage.removeItem('operatorDetails');
        localStorage.removeItem('utilityVerified');
        window.location.href = '/login?reason=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };
