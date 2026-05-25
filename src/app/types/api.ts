export type Role = "buyer" | "farmer" | "admin";

export interface ApiUser {
  id: string;
  fullName: string;
  full_name?: string;
  email: string;
  role: Role | "BUYER" | "FARMER" | "ADMIN";
  avatar?: string;
  phone?: string;
  address?: string;
  farmerProfile?: FarmerProfile;
  createdAt?: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  farmDescription?: string;
  farmLocation: string;
  verified: boolean;
  coverImage?: string;
  user?: ApiUser;
  productsCount?: number;
  avgRating?: number;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Product {
  id: string;
  farmerId: string;
  name: string;
  description?: string;
  category?: Category;
  categoryId?: string;
  price: number;
  stock: number;
  images: string[];
  organic: boolean;
  featured: boolean;
  avgRating?: number;
  reviewCount?: number;
  farmer?: ApiUser;
  createdAt?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}
