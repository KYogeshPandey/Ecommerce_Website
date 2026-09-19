import { create } from 'zustand';
import { api } from '../services/api';

const LOCAL_STORAGE_KEY = 'shopease_cart_items';

const safeJsonParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

export const useCartStore = create((set, get) => ({
  items: safeJsonParse(LOCAL_STORAGE_KEY, []),
  isDrawerOpen: false,
  loading: false,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  saveLocal: (items) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },

  fetchCart: async () => {
    const token = localStorage.getItem('shopease_token');
    if (!token) return;
    try {
      set({ loading: true });
      const data = await api.get('/api/cart');
      if (data && data.products) {
        const mapped = data.products
          .filter(item => item.product)
          .map(item => ({
            product: item.product,
            quantity: item.quantity,
          }));
        get().saveLocal(mapped);
      }
    } catch (err) {
      console.warn('Could not sync cart with server, using local store:', err.message);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    const items = [...get().items];
    const index = items.findIndex((i) => (i.product._id || i.product.id) === (product._id || product.id));

    if (index > -1) {
      items[index] = {
        ...items[index],
        quantity: items[index].quantity + quantity,
      };
    } else {
      items.push({ product, quantity });
    }

    get().saveLocal(items);
    set({ isDrawerOpen: true });

    // Sync to backend if authenticated
    const token = localStorage.getItem('shopease_token');
    if (token) {
      try {
        await api.post('/api/cart/add', {
          productId: product._id || product.id,
          quantity,
        });
      } catch (e) {
        console.warn('Backend cart add failed, kept in local state:', e.message);
      }
    }
  },

  updateQuantity: async (productId, quantity) => {
    let items = [...get().items];
    if (quantity <= 0) {
      items = items.filter((i) => (i.product._id || i.product.id) !== productId);
    } else {
      items = items.map((i) =>
        (i.product._id || i.product.id) === productId ? { ...i, quantity } : i
      );
    }

    get().saveLocal(items);

    const token = localStorage.getItem('shopease_token');
    if (token) {
      try {
        await api.post('/api/cart/update', { productId, quantity });
      } catch (e) {
        console.warn('Backend cart update failed:', e.message);
      }
    }
  },

  removeItem: async (productId) => {
    const items = get().items.filter((i) => (i.product._id || i.product.id) !== productId);
    get().saveLocal(items);

    const token = localStorage.getItem('shopease_token');
    if (token) {
      try {
        await api.delete(`/api/cart/remove/${productId}`);
      } catch (e) {
        console.warn('Backend cart delete failed:', e.message);
      }
    }
  },

  clearCart: () => {
    get().saveLocal([]);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  },

  getTotalCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
