"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_superuser: boolean;
    is_staff: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem("access_token");
        if (token) {
            // Validate token and get user info
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await api.login(username, password);
            localStorage.setItem("access_token", response.access);
            localStorage.setItem("refresh_token", response.refresh);
            await fetchUser();
            router.push("/dashboard");
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
