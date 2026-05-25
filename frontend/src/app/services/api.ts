import axios from "axios";
import type { ApiEnvelope, ApiUser, Category, FarmerProfile, Product } from "../types/api";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const refreshToken = localStorage.getItem("fd_refresh_token");
    if (error.response?.status === 401 && refreshToken && !error.config._retry) {
      error.config._retry = true;
      const response = await axios.post<ApiEnvelope<{ token: string }>>(`${API_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem("fd_token", response.data.data.token);
      error.config.headers.Authorization = `Bearer ${response.data.data.token}`;
      return api(error.config);
    }
    return Promise.reject(error);
  },
);

const unwrap = <T>(promise: Promise<{ data: ApiEnvelope<T> }>) => promise.then((response) => response.data.data);

export const authApi = {
  login: (email: string, password: string) =>
    unwrap<{ user: ApiUser; token: string; refreshToken: string }>(api.post("/auth/login", { email, password })),
  signup: (payload: { email: string; fullName: string; password: string; role?: string }) =>
    unwrap<{ user: ApiUser; token: string; refreshToken: string }>(api.post("/auth/signup", payload)),
  me: () => unwrap<ApiUser>(api.get("/auth/me")),
  logout: (refreshToken?: string) => unwrap<void>(api.post("/auth/logout", { refreshToken })),
};

export const marketplaceApi = {
  products: (params?: Record<string, string | number | undefined>) =>
    unwrap<{ products: Product[]; total: number; pages: number; skip: number; take: number }>(api.get("/products", { params })),
  featured: () => unwrap<Product[]>(api.get("/products/featured")),
  product: (id: string) => unwrap<Product>(api.get(`/products/${id}`)),
  categories: () => unwrap<Category[]>(api.get("/categories")),
  farmers: () => unwrap<FarmerProfile[]>(api.get("/farmers")),
  farmer: (id: string) => unwrap<FarmerProfile & { products: Product[] }>(api.get(`/farmers/${id}`)),
  reviews: (productId: string) => unwrap<any[]>(api.get(`/reviews/product/${productId}`)),
};

export const cartApi = {
  list: () => unwrap<any[]>(api.get("/cart")),
  add: (productId: string, quantity = 1) => unwrap<any>(api.post("/cart", { productId, quantity })),
  update: (productId: string, quantity: number) => unwrap<any>(api.put(`/cart/${productId}`, { quantity })),
  remove: (productId: string) => unwrap<void>(api.delete(`/cart/${productId}`)),
  clear: () => unwrap<void>(api.delete("/cart")),
};

export const orderApi = {
  create: (payload: { items: { productId: string; quantity: number }[]; deliveryAddress: string }) =>
    unwrap<any>(api.post("/orders", payload)),
  list: () => unwrap<any[]>(api.get("/orders")),
  checkoutSession: (orderId: string) => unwrap<any>(api.post("/payments/checkout-session", { orderId })),
};
