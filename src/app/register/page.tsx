"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./register.module.css";
import Link from "next/link";
import { useToast } from "../../contexts/ToastContext"
import { useRouter } from "next/navigation";
import validarSenha from "../../lib/validarSenha";

export default function Register() {
    const { register, user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
            if (!loading && user) {
                router.push("/");
            }
        }, [user, loading, router]);
    
        if (loading) return null
        if (user) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const resultado = validarSenha({ senha, confirmarSenha});

        if(!resultado.valido) {
            showToast(resultado.mensagem!, "danger");
            return;
        }

        setLoading(true);
        const success = await register(email, senha);

        if (success) {
            showToast("Conta criada com sucesso!", "success");
            router.push("/login");
        } else {
            showToast("Erro ao criar conta. Tente outro e-mail.", "danger");
        }

        setLoading(false);
    };

    const isDisabled = loading || email.trim() === "" || senha.trim() === "" || confirmarSenha.trim() === "";

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.card}>
                <div className={styles.infoHeader}>
                    <h4><i className="bi bi-person-plus-fill"></i>Criar Conta</h4>
                </div>
                <div className={styles.subTitulo}>
                    <h5>Cadastre-se para começar.</h5>
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
                <div className={styles.infoInput}>
                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        placeholder="Insira sua Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.infoInput}>
                    <label htmlFor="confirmarSenha">Confirmar Senha</label>
                    <input
                        type="password"
                        placeholder="Confirme sua Senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isDisabled}>
                    <i className="bi bi-person-plus me-2"></i>
                    {loading ? "Criando..." : "Criar Conta"}
                </button>

                <div className={styles.infoFooter}>
                    <Link href={"/login"} className={styles.link}><p className={styles.linkLogin}>Já tem uma conta? Entrar</p></Link>
                </div>
            </form>
        </div>
    )
}