import axios from "axios"

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401
    ) {
      window.location.href =
        "/login"
    }

    return Promise.reject(error)
  }
)