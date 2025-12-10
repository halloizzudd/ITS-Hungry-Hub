import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
    sub: string;
    email: string;
    name?: string; // Add name property
    role: string;
    iat: number;
    exp: number;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    login: (token: string) => void;
    logout: () => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    isInitialized: false,

    login: (token: string) => {
        try {
            const decoded = jwtDecode<User>(token);
            localStorage.setItem('auth_token', token);
            set({ token, user: decoded, isAuthenticated: true });
        } catch (error) {
            console.error('Invalid token', error);
            localStorage.removeItem('auth_token');
            set({ token: null, user: null, isAuthenticated: false });
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, isAuthenticated: false });
    },

    initialize: () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const decoded = jwtDecode<User>(token);
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('auth_token');
                    set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
                } else {
                    set({ token, user: decoded, isAuthenticated: true, isInitialized: true });
                }
            } catch (error) {
                localStorage.removeItem('auth_token');
                set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
            }
        } else {
            set({ isInitialized: true });
        }
    },
}));
