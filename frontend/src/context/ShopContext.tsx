import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useCatalog } from '@/context/CatalogContext';

export interface CartItem {
  productId: number;
  size: string;
  color: string;
  quantity: number;
}

interface ShopState {
  wishlist: { id: number; design: number }[];
  cart: CartItem[];
  notifications: number;
  loading: boolean;
  toggleWishlist: (id: number) => void;
  isWished: (id: number) => boolean;
  removeFromWishlist: (id: number) => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: number, size: string, color: string, qty: number) => void;
  removeFromCart: (productId: number, size: string, color: string) => void;
  moveCartToWishlist: (productId: number, size: string, color: string) => void;
  clearCart: () => void;
  cartCount: number;
  clearNotification: () => void;
}

const ShopContext = createContext<ShopState | undefined>(undefined);

function sameLine(a: CartItem, productId: number, size: string, color: string) {
  return a.productId === productId && a.size === size && a.color === color;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { getProductById } = useCatalog();
  const [wishlist, setWishlist] = useState<{ id: number; design: number }[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load cart & wishlist from backend when authenticated
  const loadFromApi = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setCart([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [cartRes, wishRes] = await Promise.all([
        apiClient.get('/shopping/cart/').catch(() => ({ data: [] })),
        apiClient.get('/shopping/wishlist/').catch(() => ({ data: [] })),
      ]);
      setCart((cartRes.data as CartItem[]) ?? []);
      setWishlist(wishRes.data ?? []);
    } catch {
      // graceful — keep empty
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFromApi();
  }, [loadFromApi]);

  const toggleWishlist = useCallback(
    async (id: number) => {
      const item = wishlist.find((w) => w.design === id);

      if (item) {
        try {
          await apiClient.delete(`/shopping/wishlist/${item.id}/`);
          await loadFromApi();
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await apiClient.post("/shopping/wishlist/", {
            design: id,
          });
          await loadFromApi();
        } catch (error) {
          console.error(error);
        }
      }
    },
    [wishlist, loadFromApi]
  );
  const isWished = useCallback((id: number) => {return wishlist.some((item) => item.design === id);},[wishlist]);

  const removeFromWishlist = useCallback(
    async(productId: number) => {
      const item = wishlist.find((w) => w.design === productId);

      if (!item) return;

      try {
        await apiClient.delete(`/shopping/wishlist/${item.id}/`);
        await loadFromApi();
      } catch (error) {
        console.error(error);
      }
    },
    [wishlist, loadFromApi]
  );

  const addToCart = useCallback(
    async (item: CartItem) => {
      setCart((c) => {
        const existing = c.find((x) => sameLine(x, item.productId, item.size, item.color));
        if (existing) {
          return c.map((x) =>
            sameLine(x, item.productId, item.size, item.color)
              ? { ...x, quantity: x.quantity + item.quantity }
              : x
          );
        }
        return [...c, item];
      });
      try {
       //wait apiClient.post('/shopping/cart-items/', item);
      } catch {
        // graceful
      }
    },
    []
  );

  const updateQuantity = useCallback(
    async (productId: number, size: string, color: string, qty: number) => {
      if (qty < 1) return;
      setCart((c) =>
        c.map((x) => (sameLine(x, productId, size, color) ? { ...x, quantity: qty } : x))
      );
      try {
        await apiClient.patch('/shopping/cart/', { productId, size, color, quantity: qty });
      } catch {
        // graceful
      }
    },
    []
  );

  const removeFromCart = useCallback(
    async (productId: number, size: string, color: string) => {
      setCart((c) => c.filter((x) => !sameLine(x, productId, size, color)));
    },
    []
  );

  const moveCartToWishlist = useCallback(
    async (productId: number, size: string, color: string) => {
      setCart((c) => c.filter((x) => !sameLine(x, productId, size, color)));
      try {
        await apiClient.delete('/shopping/cart/', { data: { productId, size, color } });
        await apiClient.post("/shopping/wishlist/", {design: productId,});

await loadFromApi();
      } catch {
        // graceful
      }
    },
    []
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    try {
      await apiClient.delete('/shopping/cart/clear/');
    } catch {
      // graceful
    }
  }, []);

  const clearNotification = useCallback(() => setNotifications(0), []);


  console.log("Cart =", cart);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  console.log("Cart Count =", cartCount);

  const value: ShopState = {
    wishlist,
    cart,
    notifications,
    loading,
    toggleWishlist,
    isWished,
    removeFromWishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    moveCartToWishlist,
    clearCart,
    cartCount,
    clearNotification,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}

/** Helper for cart line totals */
export function cartLineSubtotal(item: CartItem): number {
  // This helper is kept for backward compat but product lookup now requires
  // the catalog context. Prefer useCartProduct hook in components.
  return 0;
}

/** Hook to resolve a product for a cart line */
export function useCartProduct(productId: number) {
  const { getProductById } = useCatalog();
  return getProductById(productId);
}
