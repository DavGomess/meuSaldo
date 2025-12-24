"use client";

import { CategoriaLocal } from "../types"
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";


interface CategoriaContextType {
    categorias: CategoriaLocal[];
    addCategoria: (nome: string, tipo: "receita" | "despesa") => Promise<void>;
    deletarCategoria: (id: number) => Promise<void>;
};

const CategoriaContext = createContext<CategoriaContextType | undefined>(undefined);

export const CategoriaProvider = ({ children }: { children: ReactNode }) => {
    const [categorias, setCategorias] = useState<CategoriaLocal[]>([]);
    const { user } = useAuth();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const carregar = async () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token || !user) return;
        try {
            const res = await fetch(`${API_URL}/categorias`, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                const lista = Array.isArray(data)
                    ? data
                    : (data?.receita && data?.despesa)
                        ? [...data.receita, ...data.despesa]
                        : [];
                setCategorias(lista);
            }
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
        }
    }

    useEffect(() => {
        if (user) {
            carregar();
        } else {
            setCategorias([]);
        }
    }, [user]);


    const addCategoria = async (nome: string, tipo: "receita" | "despesa") => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const res = await fetch(`${API_URL}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ nome: nome.trim(), tipo }),
        });

        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.error || "Erro ao criar categoria");
        }
        const novaCategoria: CategoriaLocal = await res.json();
        setCategorias(prev => [...prev, novaCategoria]);
    };

    const deletarCategoria = async (id: number) => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const categoria = categorias.find(c => c.id === id);
        if (categoria?.userId === null) {
            throw new Error("Você não pode deletar categorias fixas do sistema.");
        }

        const res = await fetch(`${API_URL}/categorias/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.error || "Erro ao deletar");
        }
        setCategorias(prev => prev.filter(c => c.id !== id));
    };

    return (
        <CategoriaContext.Provider value={{ categorias, addCategoria, deletarCategoria }}>
            {children}
        </CategoriaContext.Provider>
    );
};

export const useCategorias = () => {
    const ctx = useContext(CategoriaContext);
    if (!ctx) {
        return { categorias: [], addCategoria: async () => { }, deletarCategoria: async () => { } };
    }
    return ctx;
};
