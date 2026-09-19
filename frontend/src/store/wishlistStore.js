import { create } from 'zustand';

const LOCAL_STORAGE_KEY = 'shopease_wishlist_items';

const safeJsonParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

export const useWishlistStore = create((set, get) => ({
  items: safeJsonParse(LOCAL_STORAGE_KEY, []),

  saveLocal: (items) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },

  toggleWishlist: (product) => {
    const id = product._id || product.id;
    const items = [...get().items];
    const index = items.findIndex((i) => (i._id || i.id) === id);

    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push(product);
    }
    get().saveLocal(items);
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => (i._id || i.id) === productId);
  },

  removeItem: (productId) => {
    const items = get().items.filter((i) => (i._id || i.id) !== productId);
    get().saveLocal(items);
  },

  clearWishlist: () => {
    get().saveLocal([]);
  },
}));
