import axios from 'axios'
import { AppRoutes } from '@/configs/routes'

const api = axios.create({
  baseURL: import.meta.env.VITE_BE_URL || 'http://localhost:8000/api',
})

api.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem('token')!)

    if (token) {
      config.headers.Authorization = `Bearer ${token?.access_token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = AppRoutes.LOGIN.path
    }

    return Promise.reject(error)
  },
)

export default api
