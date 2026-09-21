import axios from "axios";
import { API_BASE_URL } from "../constants/index.js";

const BASE_URL = API_BASE_URL;

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 15000,
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    const response = await axios.post(
                        `${BASE_URL}/auth/refresh-token`,
                        { refreshToken },
                        { withCredentials: true },
                    );
                    const { accessToken, refreshToken: newRefreshToken } =
                        response.data.data;
                    localStorage.setItem("accessToken", accessToken);
                    if (newRefreshToken)
                        localStorage.setItem("refreshToken", newRefreshToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.debug(
                    "[API] Token refresh failed, forcing logout:",
                    refreshError?.message,
                );
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
            }
        }

        return Promise.reject(
            error.response?.data || error.message || "Network error",
        );
    },
);

export default apiClient;
