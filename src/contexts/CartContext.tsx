import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { Sweet } from '@/lib/api';

export interface CartItem {
    sweet: Sweet;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    deliveryAddress?: string;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: { sweet: Sweet; quantity?: number } }
    | { type: 'REMOVE_ITEM'; payload: { sweetId: string } }
    | { type: 'UPDATE_QTY'; payload: { sweetId: string; quantity: number } }
    | { type: 'CLEAR' }
    | { type: 'SET_ADDRESS'; payload: { address: string } };

const STORAGE_KEY = 'cart_state_v1';

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { sweet, quantity = 1 } = action.payload;
            const existing = state.items.find(i => i.sweet.id === sweet.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.sweet.id === sweet.id
                            ? { ...i, quantity: Math.min(i.quantity + quantity, sweet.quantity) }
                            : i
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, { sweet, quantity: Math.min(quantity, sweet.quantity) }],
            };
        }
        case 'REMOVE_ITEM': {
            return { ...state, items: state.items.filter(i => i.sweet.id !== action.payload.sweetId) };
        }
        case 'UPDATE_QTY': {
            const { sweetId, quantity } = action.payload;
            return {
                ...state,
                items: state.items.map(i =>
                    i.sweet.id === sweetId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.sweet.quantity)) } : i
                ),
            };
        }
        case 'CLEAR':
            return { items: [], deliveryAddress: '' };
        case 'SET_ADDRESS':
            return { ...state, deliveryAddress: action.payload.address };
        default:
            return state;
    }
}

interface CartContextType extends CartState {
    addItem: (sweet: Sweet, quantity?: number) => void;
    removeItem: (sweetId: string) => void;
    updateQuantity: (sweetId: string, quantity: number) => void;
    clearCart: () => void;
    setAddress: (address: string) => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, undefined, () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw) as CartState;
        } catch { }
        return { items: [], deliveryAddress: '' } as CartState;
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch { }
    }, [state]);

    const addItem = (sweet: Sweet, quantity: number = 1) => dispatch({ type: 'ADD_ITEM', payload: { sweet, quantity } });
    const removeItem = (sweetId: string) => dispatch({ type: 'REMOVE_ITEM', payload: { sweetId } });
    const updateQuantity = (sweetId: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', payload: { sweetId, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR' });
    const setAddress = (address: string) => dispatch({ type: 'SET_ADDRESS', payload: { address } });

    const { totalItems, totalPrice } = useMemo(() => {
        const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = state.items.reduce((sum, i) => sum + i.quantity * i.sweet.price, 0);
        return { totalItems, totalPrice };
    }, [state.items]);

    return (
        <CartContext.Provider
            value={{
                ...state,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                setAddress,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};


