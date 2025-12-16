"use client"

import Header from "./components/Header";
import MenuLateral from "./components/MenuLateral";
import Dashboard from "./dashboard/dashboard";
import Transacoes from "./transacoes/transacoes";
import Relatorios from "./relatorios/relatorios";
import Metas from "./metas/metas";
import Categorias from "./categorias/categorias";
import Orcamento from "./orcamento/orcamentos";
import ContasPagar from "./contasPagar/contasPagar";
import Configuracoes from "./configuracoes/configuracoes";
import { useSelected } from "../contexts/SelectedContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
const router = useRouter();
const { user, loading } = useAuth();
const { selected } = useSelected();  

useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="mainPage border-1 p-0 me-0">
          <MenuLateral />
        <div className="mainContainer p-0 me-0 ">
          <Header/>       
          {selected === "dashboard" && <Dashboard />}
          {selected === "transacoes" && <Transacoes />}
          {selected === "relatorios" && <Relatorios />}
          {selected === "metas" && <Metas />}
          {selected === "categorias" && <Categorias />}
          {selected === "orcamento" && <Orcamento />}
          {selected === "contasPagar" && <ContasPagar />}
          {selected === "configuracoes" && <Configuracoes />}
        </div>
    </div>
  );
}

