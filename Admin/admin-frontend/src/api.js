import axios from 'axios'

const base = import.meta.env.VITE_API_BASE || ''

const api = axios.create({
    baseURL: base,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Attach token from localStorage for admin frontend
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
