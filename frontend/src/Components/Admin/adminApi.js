import axios from 'axios'

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API,
    withCredentials: true
})

export default adminApi
