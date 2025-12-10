import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    sellerId: number;
    image?: string | null;
}

interface CartState {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;

    // Computed helper function (not state, but accessible)
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addToCart: (item) => {
                const currentItems = get().items;
                const existingSellerId = currentItems.length > 0 ? currentItems[0].sellerId : null;

                // Single Seller Constraint
                if (existingSellerId && existingSellerId !== item.sellerId) {
                    const confirmSwitch = window.confirm(
                        "You can only order from one seller at a time. Clear cart and add this item?"
                    );
                    if (!confirmSwitch) return;

                    // Clear and add new item
                    set({ items: [item] });
                    return;
                }

                const existingItem = currentItems.find((i) => i.productId === item.productId);

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.productId === item.productId
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...currentItems, item] });
                }
            },

            removeFromCart: (productId) => {
                set({
                    items: get().items.filter((i) => i.productId !== productId),
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity < 1) return; // Prevent quantity less than 1
                set({
                    items: get().items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            }
        }),
        {
            name: 'cart-storage', // key in localStorage
        }
    )
);
