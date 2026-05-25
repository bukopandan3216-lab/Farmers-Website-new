import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { cartApi } from "../services/api";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  photo: string;
  farmer_id: string;
  store_name: string;
  stock_qty: number;
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("fd_cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isAuthenticated && cart.length > 0) {
      localStorage.setItem("fd_cart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    cartApi.list()
      .then((items) => {
        setCart(
          items.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            unit: "kg",
            photo: item.product.images?.[0],
            farmer_id: item.product.farmerId,
            store_name: item.product.farmer?.fullName || "FarmDirect Farmer",
            stock_qty: item.product.stock,
            qty: item.quantity,
          })),
        );
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem("fd_cart");
      setCart([]);
    }
  }, [isAuthenticated]);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock_qty) {
          alert(`Only ${item.stock_qty} available in stock`);
          return prevCart;
        }
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
    if (isAuthenticated) cartApi.add(item.id, 1).catch(() => toast.error("Could not sync cart"));
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    if (isAuthenticated) cartApi.remove(id).catch(() => toast.error("Could not remove item"));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          if (qty > item.stock_qty) {
            alert(`Only ${item.stock_qty} available in stock`);
            return { ...item, qty: item.stock_qty };
          }
          return { ...item, qty };
        }
        return item;
      })
    );
    if (isAuthenticated) cartApi.update(id, qty).catch(() => toast.error("Could not update cart"));
  };

  const clearCart = () => {
    setCart([]);
    if (isAuthenticated) cartApi.clear().catch(() => undefined);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
