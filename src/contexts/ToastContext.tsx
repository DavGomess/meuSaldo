"use client";

import ToastMessage from "../app/components/ToastMessage";
import { ToastProps } from "../types/index";
import { createContext, ReactNode, useContext, useState } from "react";


interface ToastContextType {
    showToast: (message: string, type?: ToastProps["type"]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const showToast = (message: string, type: ToastProps["type"] = "primary") => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.map((toast) => (
                <ToastMessage
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                />
            ))}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider");
    return context;
}