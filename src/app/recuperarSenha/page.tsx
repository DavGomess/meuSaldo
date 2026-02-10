"use client";

import { useState } from "react";
import styles from "./recuperarSenha.module.css";
import { useToast } from "../../contexts/ToastContext";

export default function RecuperarSenha() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const handleSubmit = async   (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim  || !email.includes("@")) {
        showToast("Digite um e-mail válido", "danger");
        return;
    }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || "Erro ao enviar e-mail de recuperação.", "danger");
            } else {
                showToast("E-mail de redefinição enviado! Verifique seu e-mail.", "success");
                setEmail("");
            }
        } catch {
            showToast("Erro inesperado. Tente novamente.", "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.card}>
                <div className={styles.infoHeader}>
                    <h4><i className="bi bi-envelope fs-1 text-primary"></i>Recuperação de Senha</h4>
                </div>
                <div className={styles.subTitulo}>
                    <h5>Digite seu e-mail para receber o link de recuperação.</h5>
                </div>
                <div className={styles.infoInput}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        placeholder="Insira seu E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    <i className="bi bi-envelope me-2"></i>
                    {loading ? "Enviando..." : "Enviar Email"}
                </button>
            </form>
        </div>
    )
}