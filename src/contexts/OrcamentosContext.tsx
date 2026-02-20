"use client";

import { OrcamentoFromAPI, OrcamentoLocal } from "../types";
import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useTransacoes } from "./TransacoesContext";


interface OrcamentosContextType {
  orcamentos: OrcamentoLocal[];
  upsert: (categoriaId: number, valor: number) => Promise<void>;
  update: (categoriaId: number, valor: number) => Promise<void>;
  remover: (categoriaId: number) => Promise<void>;
  sync: () => Promise<void>;
  calcularProgresso: (categoriaId: number) => { gastoReal: number; gastoConsiderado: number; porcentagem: number; restante: number; concluido: boolean;};
}

const OrcamentosContext = createContext<OrcamentosContextType | undefined>(undefined);

export const OrcamentosProvider = ({ children }: { children: ReactNode }) => {
  const [orcamentos, setOrcamentos] = useState<OrcamentoLocal[]>([]);
  const { transacoes } = useTransacoes();
  const { user } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const sync = useCallback(async () => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      setOrcamentos([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orcamentos`, { headers: { Authorization: `Bearer ${token}` } });

        if (!res.ok) {
          console.error("[Orcamentos] resposta não OK:", res.status, await res.text());
          setOrcamentos([]);
          return;
        }

        const json = await res.json();

        if (!Array.isArray(json)) {
          console.error("[Orcamentos] Resposta não é array:", json);
          setOrcamentos([]);
          return;
        }

        const orcamentosFormatados: OrcamentoLocal[] = json.map((orcamento: OrcamentoFromAPI) => ({
          id: orcamento.id,
          categoriaId: orcamento.categoriaId,
          valor: Number(orcamento.valor),
        }));
        setOrcamentos(orcamentosFormatados);
      } catch {
        setOrcamentos([]);
      }
  },  [API_URL]);

  useEffect(() => {
    if (user) {
      sync();
    }
  }, [sync, user]);

  const upsert = async (categoriaId: number, valor: number) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) throw new Error("Não autenticado");

    const res = await fetch(`${API_URL}/orcamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ categoriaId, valor }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao salvar orçamento");
    }
    await sync();
  };

  const update = async (categoriaId: number, valor: number) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) throw new Error("Não autenticado");

    const res = await fetch(`${API_URL}/orcamentos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ categoriaId, valor }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao atualizar orçamento");
    }

    await sync();
  };

  const remover = async (categoriaId: number) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) throw new Error("Não autenticado");

    setOrcamentos(prev => prev.filter(o => o.categoriaId !== categoriaId));

    try {
    const res = await fetch(`${API_URL}/orcamentos/${categoriaId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao remover orçamento");
    }
    await sync();
  } catch (err) {
    await sync();
    throw err;
  }
};
  const calcularProgresso = (categoriaId: number) => {
    const orcamento = orcamentos.find(o => o.categoriaId === categoriaId);
    if (!orcamento) {
      return {
        gastoReal: 0,
        gastoConsiderado: 0,
        porcentagem: 0,
        restante: 0,
        concluido: false,
      }
    }
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const gastoReal = transacoes.filter(t => {
        const dataT = new Date(t.data);
        return t.categoriaId === categoriaId && dataT.getMonth() === mesAtual && dataT.getFullYear() === anoAtual;
      })
      .reduce((acc, t) => acc + t.valor, 0);

    const gastoConsiderado = Math.min(gastoReal, orcamento.valor);
    const porcentagem = orcamento.valor > 0 ? (gastoConsiderado / orcamento.valor) * 100 : 0;
    const restante = Math.max(orcamento.valor - gastoConsiderado, 0);
    const concluido = gastoReal >= orcamento.valor

    return {
      gastoReal,
      gastoConsiderado,
      porcentagem,
      restante,
      concluido
    };
  }


  return (
    <OrcamentosContext.Provider value={{ orcamentos, sync, upsert, update, remover, calcularProgresso }}>
      {children}
    </OrcamentosContext.Provider>
  );
}

export function useOrcamentos() {
  const context = useContext(OrcamentosContext);
  if (!context) {
    throw new Error("useOrcamentos deve ser usado dentro de OrcamentosProvider");
  }
  return context;
}