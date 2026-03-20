import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';

const TOKEN_KEY = 'auth_token';

type AppContextType = {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem(TOKEN_KEY),
    );
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = useCallback(async (t: string) => {
        try {
            const res = await fetch('/api/user', {
                headers: { Authorization: `Bearer ${t}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                // Token is invalid — clear it
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
            }
        } catch {
            // ignore network errors
        }
    }, []);

    useEffect(() => {
        if (token && !user) {
            fetchUser(token);
        }
    }, []);

    const login = useCallback(async (newToken: string) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        await fetchUser(newToken);
    }, [fetchUser]);

    const logout = useCallback(async () => {
        if (token) {
            try {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch {
                // ignore network errors on logout
            }
        }
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }, [token]);

    return (
        <AppContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout, setToken, setUser }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext(): AppContextType {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
}
