"use client";

import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getToken } from "../utils/authToken";

interface User {
    id: number;
    email: string;
    nome?: string}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, senha: string) => Promise<boolean>;
    register: (email: string, senha: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    useEffect(() => {
        const verificarToken = async () => {
            const token = getToken();
            if (!token) {
                    setUser(null);
                    setLoading(false);
                    return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    sessionStorage.removeItem("token");
                    localStorage.removeItem("token");
                    setUser(null);
                }
            } catch (err) {
                console.error("Token inválido ou expirado", err);
                sessionStorage.removeItem("token");
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verificarToken();
    }, [API_URL]);


    const login = async (email: string, senha: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            const data = await res.json();

            if (data.token && data.user) {
                sessionStorage.setItem("token", data.token);
                localStorage.setItem("token", data.token);
                setUser(data.user);
                return true;
            }
            return false;
        } catch (err) {
            console.log("Erro no login:", err);
            return false;
        }
    };

    const register = async (email: string, senha: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            return res.ok;
        } catch {
            return false;
        }
    }

    const logout = () => {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentor do AuthProvider");
    return context;
}