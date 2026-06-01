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
  accountSetupCompleted?: boolean;
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
  featured?: boolean; //added featured field to FarmerProfile for better data structure, original: featured?: boolean;
  followerCount?: number; //Added follower count to FarmerProfile for better data structure, original: followerCount?: number;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Review {
  id: string;
  productId?: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
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
  reviews?: Review[];
  farmer?: ApiUser;
  createdAt?: string;
}

export interface MessageUser {
  id: string;
  fullName: string;
  avatar?: string;
  role?: Role | string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: MessageUser;
  receiver: MessageUser;
}

export interface ConversationSummary {
  otherUserId: string;
  participantName: string;
  participantPhoto?: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}
