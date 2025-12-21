"use client";

import { Suspense, useState } from "react";
import styles from "./redefinirSenha.module.css";
import Link from "next/link";
import { useToast } from "../../contexts/ToastContext"
import { useSearchParams, useRouter } from "next/navigation";

export default function RedefinirSenha() {
    const { showToast } = useToast();
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (senha !== confirmarSenha) {
            showToast("As senhas não coincidem!", "danger");
            return;
        }

        if (!token) {
            showToast("Token de redefinição inválido ou ausente.", "danger");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:4000/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: senha }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || "Erro ao redefinir a senha.", "danger");
                return;
            }

            showToast("Senha redefinida com sucesso!", "success");
            router.push("/login");
        } catch {
            showToast("Erro de rede. Tente novamente", "danger");
        } finally {
            setLoading(false);
        }
    }

    const isDisabled = loading || senha.trim() === "" || confirmarSenha.trim() === "";

    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.card}>
                <div className={styles.infoHeader}>
                    <h4><i className="bi bi-key-fill"></i>Redefinir Senha</h4>
                </div>
                <div className={styles.subTitulo}>
                    <h5>Defina sua nova senha.</h5>
                </div>
                <div className={styles.infoInput}>
                    <label htmlFor="senha">Nova Senha</label>
                    <input
                        type="password"
                        placeholder="Insira sua nova Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.infoInput}>
                    <label htmlFor="confirmarSenha">Confirmar Senha</label>
                    <input
                        type="password"
                        placeholder="Confirme sua nova senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isDisabled}>
                    <i className="bi bi-key-fill me-2"></i>
                    {loading ? "Redefinindo..." : "Redefinir Senha"}
                </button>

                <div className={styles.infoFooter}>
                    <Link href={"/login"} className={styles.link}><p className={styles.linkLogin}>Voltar ao login</p></Link>
                </div>
            </form>
            </div>
        </Suspense>
    )
}
