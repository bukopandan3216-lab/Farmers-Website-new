import axios from "axios";
import type { ApiEnvelope, ApiUser, Category, FarmerProfile, Product, Review, Message, MessageUser, ConversationSummary } from "../types/api";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

//export const api = axios.create({
//  baseURL: API_URL,
//  headers: { "Content-Type": "application/json" },
//});
//Added cache control headers to prevent caching of user data

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/*
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

Added more robust token refresh logic to handle token expiration and ensure users are redirected to login if refresh fails
*/

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const refreshToken = localStorage.getItem("fd_refresh_token");

    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post<
          ApiEnvelope<{ token: string }>
        >(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = response.data.data.token;

        localStorage.setItem("fd_token", newToken);

        // ensure headers object exists
        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("fd_token");
        localStorage.removeItem("fd_refresh_token");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const unwrap = <T>(promise: Promise<{ data: ApiEnvelope<T> }>) => promise.then((response) => response.data.data);

export const authApi = {
  login: (email: string, password: string) =>
    unwrap<{ user: ApiUser; token: string; refreshToken: string }>(api.post("/auth/login", { email, password })),
  signup: (payload: { email: string; fullName: string; password: string; role?: string }) =>
    unwrap<{ user: ApiUser; token: string; refreshToken: string }>(api.post("/auth/signup", payload)),
  me: () => unwrap<ApiUser>(api.get("/auth/me")),
  logout: (refreshToken?: string) => unwrap<void>(api.post("/auth/logout", { refreshToken })),
  createAccount: (applicationId: string, payload: { password: string; storeName?: string }) =>
    unwrap<{ user: ApiUser; message: string }>(api.post(`/applications/${applicationId}/create-account`, payload)),
  createAccountWithToken: (token: string, payload: { password: string; storeName?: string }) =>
    unwrap<{ user: ApiUser; message: string }>(api.post(`/applications/create-account`, { token, ...payload })),
};

export const marketplaceApi = {
  products: (params?: Record<string, string | number | undefined>) =>
    unwrap<{ products: Product[]; total: number; pages: number; skip: number; take: number }>(api.get("/products", { params })),
  featured: () => unwrap<Product[]>(api.get("/products/featured")),
  product: (id: string) => unwrap<Product>(api.get(`/products/${id}`)),
  categories: () => unwrap<Category[]>(api.get("/categories")),
  farmers: () => unwrap<FarmerProfile[]>(api.get("/farmers")),
  farmer: (id: string) => unwrap<FarmerProfile & { products: Product[] }>(api.get(`/farmers/${id}`)),
  featuredFarmers: () => unwrap<FarmerProfile[]>(api.get("/farmers/featured/list")),
  featureFarmer: (id: string, featured = true) => unwrap<FarmerProfile>(api.patch(`/farmers/${id}/featured`, { featured })),
  reviews: (productId: string) => unwrap<Review[]>(api.get(`/reviews/product/${productId}`)),
  createProductReview: (productId: string, rating: number, comment?: string) =>
    unwrap<Review>(api.post("/reviews/product", { productId, rating, comment })),
  createStoreReview: (farmerId: string, rating: number, comment?: string) =>
    unwrap<Review>(api.post("/reviews/store", { farmerId, rating, comment })),
  myReviews: () =>
    unwrap<{ productReviews: Review[]; storeReviews: Review[] }>(api.get("/reviews/my-reviews")),
  storeReviews: (farmerId: string) => unwrap<Review[]>(api.get(`/reviews/store/${farmerId}`)),
};

export const cartApi = {
  list: () => unwrap<any[]>(api.get("/cart")),
  add: (productId: string, quantity = 1) => unwrap<any>(api.post("/cart", { productId, quantity })),
  update: (productId: string, quantity: number) => unwrap<any>(api.put(`/cart/${productId}`, { quantity })),
  remove: (productId: string) => unwrap<void>(api.delete(`/cart/${productId}`)),
  clear: () => unwrap<void>(api.delete("/cart")),
};

export const analyticsApi = {
  farmerDashboard: () => unwrap<any>(api.get("/analytics/farmer/dashboard")),
  buyerDashboard: () => unwrap<any>(api.get("/analytics/buyer/dashboard")),
};

export const messageApi = {
  list: () => unwrap<Message[]>(api.get("/messages")),
  conversations: () => unwrap<ConversationSummary[]>(api.get("/messages/conversations")),
  conversation: (otherUserId: string) => unwrap<{ otherUser: MessageUser | null; messages: Message[] }>(api.get(`/messages/conversation/${otherUserId}`)),
  send: (receiverId: string, content: string) => unwrap<Message>(api.post("/messages", { receiverId, content })),
};

export const applicationApi = {
  submit: (payload: any) => unwrap<any>(api.post("/applications", payload)),
  get: (id: string) => unwrap<any>(api.get(`/applications/${id}`)),
  list: (params?: Record<string, string | number | undefined>) =>
    unwrap<any>(api.get("/applications", { params })),
  approve: (id: string) => unwrap<any>(api.patch(`/applications/${id}/approve`)),
  reject: (id: string, rejectionReason: string) =>
    unwrap<any>(api.patch(`/applications/${id}/reject`, { rejectionReason })),
  uploadFile: async (bucket: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/uploads/${bucket}`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || 'File upload failed');
    }
    const data = await response.json();
    return data.data;
  },
};

export const userApi = {
  list: () => unwrap<any[]>(api.get('/users')),
};

export const orderApi = {
  create: (payload: { items: { productId: string; quantity: number }[]; deliveryAddress: string }) =>
    unwrap<any>(api.post("/orders", payload)),
  list: () => unwrap<any[]>(api.get("/orders")),
  checkoutSession: (orderId: string) => unwrap<any>(api.post("/payments/checkout-session", { orderId })),
  updateStatus: (id: string, status: string, logisticsProvider?: string, notes?: string) =>
    unwrap<any>(api.put(`/orders/${id}/status`, { status, logisticsProvider, notes })),
  confirmDelivery: (id: string) => unwrap<any>(api.post(`/orders/${id}/delivered`)),
  cancel: (id: string) => unwrap<any>(api.post(`/orders/${id}/cancel`)),
};
