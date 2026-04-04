import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

// Types
export type UserRole = "student" | "chef" | "admin";
export type OrderStatus = "pending" | "accepted" | "preparing" | "delivered";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  avatar?: string;
  phone?: string;
  college?: string;
  isProfileComplete: boolean;
}

export interface Chef {
  _id: string;
  userId: string | { _id: string; name: string };
  bio: string;
  college: string;
  rating: number;
  isApproved: boolean;
  isAvailable: boolean;
  profileImage?: string;
  isProfileComplete?: boolean;
}

export interface MenuItem {
  id: string;
  chefId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  chefId: string;
  chefName: string;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  chefId: string;
  chefName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
}

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (userData: Partial<User>) => void;
  logout: () => void;
  // Chef Profile
  chefProfile: Chef | null;
  setChefProfile: (profile: Chef) => void;
  // Data
  users: User[];
  chefs: Chef[];
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  // Actions
  addToCart: (item: MenuItem, chefName: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (addressId: string, paymentMethod?: "cod" | "online") => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleChefOnline: (chefId: string) => void;
  toggleChefVerified: (chefId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

// Mock data removed for production transition
const INITIAL_USERS: User[] = [];

const INITIAL_CHEFS: Chef[] = [];

const INITIAL_MENU: MenuItem[] = [];

const INITIAL_ORDERS: Order[] = [];

const genId = () => Math.random().toString(36).slice(2, 10);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("campusthali_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [chefProfile, setChefProfile] = useState<Chef | null>(() => {
    const stored = localStorage.getItem("campusthali_chef");
    return stored ? JSON.parse(stored) : null;
  });
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [chefs, setChefs] = useState<Chef[]>(INITIAL_CHEFS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("campusthali_cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Keep localStorage in sync with state
  useEffect(() => {
    localStorage.setItem("campusthali_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (chefProfile) localStorage.setItem("campusthali_chef", JSON.stringify(chefProfile));
    else localStorage.removeItem("campusthali_chef");
  }, [chefProfile]);

  // Fetch DB cart on user change
  useEffect(() => {
    const fetchDBCart = async () => {
      if (currentUser?.token) {
        try {
          const res = await api.get("/cart", currentUser.token);
          if (res.data && res.data.items) {
            // Transform back to CartItem format
            const dbItems: CartItem[] = res.data.items.map((i: any) => ({
              menuItem: {
                id: i.menuId._id,
                ...i.menuId
              },
              quantity: i.quantity,
              chefId: res.data.chefId,
              chefName: "Chef" // Placeholder, in real app populate this
            }));
            
            if (dbItems.length > 0) setCart(dbItems);
          }
        } catch (error) {
          console.error("Failed to fetch cart from DB:", error);
        }
      }
    };
    fetchDBCart();
  }, [currentUser?.id]);

  const syncCartToBackend = async (items: CartItem[], token: string) => {
    try {
      await api.post("/cart/sync", {
        items: items.map(i => ({ menuId: i.menuItem.id, quantity: i.quantity }))
      }, token);
    } catch (error) {
      console.error("Cart sync failed:", error);
    }
  };

  useEffect(() => {
    if (currentUser) localStorage.setItem("campusthali_user", JSON.stringify(currentUser));
    else localStorage.removeItem("campusthali_user");
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { _id, name, role, token, phone, college, isProfileComplete } = response.data;
      const user: User = { id: _id, name, email, role, token, phone, college, isProfileComplete };
      
      // SYNC LOCAL CART TO BACKEND ON LOGIN
      if (cart.length > 0) {
        await syncCartToBackend(cart, token);
      }
      
      setCurrentUser(user);

      // If chef, fetch their profile
      if (role === "chef") {
        try {
          const chefRes = await api.get("/chefs/me", token);
          if (chefRes) setChefProfile(chefRes.data);
        } catch (e) {
          console.log("Chef profile not found yet");
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { success: false, message: error.message || "Invalid credentials" };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post("/auth/register", { name, email, password, role });
      const { _id, token } = response.data;
      const user: User = { id: _id, name, email, role, token, isProfileComplete: false };
      
      // SYNC LOCAL CART TO BACKEND ON REGISTER
      if (cart.length > 0) {
        await syncCartToBackend(cart, token);
      }

      setCurrentUser(user);
      return { success: true };
    } catch (error: any) {
      console.error("Registration failed:", error);
      return { success: false, message: error.message || "Registration failed" };
    }
  };

  const updateProfile = (userData: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const logout = () => { 
    setCurrentUser(null); 
    setChefProfile(null);
    setCart([]); 
    localStorage.removeItem("campusthali_cart");
    localStorage.removeItem("campusthali_chef");
  };

  const addToCart = (item: MenuItem, chefName: string) => {
    setCart((prev) => {
      let newCart;
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        newCart = prev.map((c) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        newCart = [...prev, { menuItem: item, quantity: 1, chefId: item.chefId, chefName }];
      }
      
      if (currentUser) syncCartToBackend(newCart, currentUser.token);
      return newCart;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((p) => {
      const newCart = p.filter((c) => c.menuItem.id !== itemId);
      if (currentUser) syncCartToBackend(newCart, currentUser.token);
      return newCart;
    });
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(itemId);
    setCart((p) => {
      const newCart = p.map((c) => c.menuItem.id === itemId ? { ...c, quantity: qty } : c);
      if (currentUser) syncCartToBackend(newCart, currentUser.token);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (currentUser) api.delete("/cart", currentUser.token);
  };

  const placeOrder = async (addressId: string, paymentMethod: "cod" | "online" = "cod") => {
    if (!currentUser || cart.length === 0) return;
    
    const grouped = cart.reduce<Record<string, CartItem[]>>((acc, item) => {
      (acc[item.chefId] = acc[item.chefId] || []).push(item);
      return acc;
    }, {});

    try {
      if (paymentMethod === "online") {
        const total = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);
        const billTotal = total + 12; // Flat platform fee

        // 1. Create Razorpay Order
        const rzpRes = await api.post("/payment/create-order", { amount: billTotal }, currentUser.token);
        const rzpOrder = rzpRes.data;

        await new Promise<void>((resolve, reject) => {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "CampusThali",
            description: "Food Delivery Payment",
            order_id: rzpOrder.id,
            handler: async (response: any) => {
              try {
                // 2. Payment Success -> Create CampusThali Order(s)
                for (const [chefId, items] of Object.entries(grouped)) {
                  const orderData = {
                    chefId,
                    addressId,
                    paymentMethod: "online",
                    razorpayOrderId: rzpOrder.id,
                    items: items.map((i) => ({
                      menuId: i.menuItem.id,
                      quantity: i.quantity,
                    })),
                  };
                  const ctOrderRes = await api.post("/orders", orderData, currentUser.token);
                  const ctOrder = ctOrderRes.data;

                  // 3. Verify Payment on Backend
                  await api.post("/payment/verify", {
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    orderId: ctOrder._id
                  }, currentUser.token);
                }

                setCart([]);
                resolve();
              } catch (err) {
                console.error("Order creation/verification failed:", err);
                reject(err);
              }
            },
            prefill: {
              name: currentUser.name,
              email: currentUser.email,
            },
            theme: {
              color: "#ff3d00",
            },
            modal: {
              ondismiss: () => {
                reject(new Error("Payment cancelled by user"));
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      } else {
        // COD FLOW
        for (const [chefId, items] of Object.entries(grouped)) {
          const orderData = {
            chefId,
            addressId,
            paymentMethod: "cod",
            items: items.map((i) => ({
              menuId: i.menuItem.id,
              quantity: i.quantity,
            })),
          };
          await api.post("/orders", orderData, currentUser.token);
        }
        setCart([]);
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      throw error;
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((p) => p.map((o) => o.id === orderId ? { ...o, status } : o));
    if (status === "delivered") {
      const order = orders.find((o) => o.id === orderId);
      // Removed earning display logic as it was mock-only
    }
  };

  const addMenuItem = (item: Omit<MenuItem, "id">) => setMenuItems((p) => [...p, { ...item, id: genId() }]);
  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => setMenuItems((p) => p.map((m) => m.id === id ? { ...m, ...updates } : m));
  const deleteMenuItem = (id: string) => setMenuItems((p) => p.filter((m) => m.id !== id));
  const toggleChefOnline = (chefId: string) => setChefs((p) => p.map((c) => c._id === chefId ? { ...c, isAvailable: !c.isAvailable } : c));
  const toggleChefVerified = (chefId: string) => setChefs((p) => p.map((c) => c._id === chefId ? { ...c, isApproved: !c.isApproved } : c));

  return (
    <AppContext.Provider value={{ 
      currentUser, login, register, updateProfile, logout,
      chefProfile, setChefProfile,
      users, chefs, menuItems, orders, cart, 
      addToCart, removeFromCart, updateCartQuantity, clearCart, 
      placeOrder, updateOrderStatus, 
      addMenuItem, updateMenuItem, deleteMenuItem, 
      toggleChefOnline, toggleChefVerified 
    }}>
      {children}
    </AppContext.Provider>
  );
};
