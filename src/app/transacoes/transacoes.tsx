import { useState, useEffect } from "react";
import styles from "./transacoes.module.css";
import CategoriaModal from "../components/CategoriaModal";
import PeriodoModal from "../components/PeriodoModal";
import { PeriodoSelecionado, TransacaoLocal } from "../../types";
import { useCategorias } from "../../contexts/CategoriaContext";
import { useTransacoes } from "../../contexts/TransacoesContext";
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { formatarValor } from "../../utils/formatarValor";
import { useToast } from "../../contexts/ToastContext";


export default function Transacoes() {
    const { categorias } = useCategorias();
    const { transacoes, setTransacoes } = useTransacoes();
    const { showToast } = useToast();
    const [openModal, setOpenModal] = useState<null | "categoria" | "periodo">(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoSelecionado | null>(null);
    const [pesquisa, setPesquisa] = useState("");
    const { exibirAbreviado } = useDisplayPreferences();

    const parseDate = (dateString: string): Date => {
    const datePart = dateString.split("T")[0];
    const [ano, mes, dia] = datePart.split("-").map(Number);
    return new Date(ano, mes - 1, dia); 
};

const formatarDataParaExibir = (dateString: string): string => {
    if (!dateString) return "Data inválida";
    try {
        return parseDate(dateString).toLocaleDateString("pt-BR");
    } catch {
        return "Data inválida";
    }
};

    const carregarTransacoes = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;
    

        try {
            const res = await fetch("http://localhost:4000/transacoes", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data: TransacaoLocal[] = await res.json();
                const corrigidas = data.map(t => ({
                    ...t,
                    data: t.data.split('T')[0]
                }));
                setTransacoes(corrigidas);
            }
        } catch {
            showToast("Erro ao carregar transações", "danger");
        }
    };
    useEffect(() => {
        carregarTransacoes();
    }, []);

    useEffect(() => {
        const termo = pesquisa.trim().toLowerCase();
        if (!termo) {
            carregarTransacoes();
            return;
        }

        const filtrar = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch(
                    `http://localhost:4000/transacoes/filtrar?termo=${encodeURIComponent(termo)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.ok) {
                    const data: TransacaoLocal[] = await res.json();
                    const corrigidas = data.map(t => ({
                        ...t,
                        data: t.data.split('T')[0]
                    }));
                    setTransacoes(corrigidas);
                }
            } catch {
                showToast("Erro na pesquisa", "danger");
            }
        };
        filtrar();
    }, [pesquisa]);

    function zerarHoras(data: Date) {
        const d = new Date(data);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    const transacoesFiltradas = transacoes.filter((t) => {
        const matchCategoria = selectedCategoria.length === 0 || selectedCategoria.includes(t.categoria);

        let matchPeriodo = true;

        if (selectedPeriodo) {

            if (selectedPeriodo.tipo === "predefinido" && selectedPeriodo.dias) {
                const hoje = zerarHoras(new Date());
                const limite = zerarHoras(new Date());
                limite.setDate(limite.getDate() - selectedPeriodo.dias);

                const data = zerarHoras(parseDate(t.data));

                matchPeriodo = data >= limite && data <= hoje;

            } else if (selectedPeriodo.tipo === "personalizado" && selectedPeriodo.inicio && selectedPeriodo.fim) {
                const inicio = zerarHoras(new Date(selectedPeriodo.inicio));
                const fim = zerarHoras(new Date(selectedPeriodo.fim));
                const data = zerarHoras(parseDate(t.data));

                matchPeriodo = data >= inicio && data <= fim;
            }
        }
        return matchCategoria && matchPeriodo;
    });


    const displayCategorias = () => {
        if (selectedCategoria.length === 0) return "Categoria";
        if (selectedCategoria.length === 1) return selectedCategoria[0];
        return `${selectedCategoria[0]}, +${selectedCategoria.length - 1}`;
    };

    const categoriasUsuario = {
        Receita: categorias.filter(c => c.tipo === "receita").map(c => c.nome),
        Despesa: categorias.filter(c => c.tipo === "despesa").map(c => c.nome),
    };

    const handleOpenCategoriaModal = () => setOpenModal("categoria");
    const handleOpenPeriodoModal = () => setOpenModal("periodo");
    const handleCloseModal = () => {
        setOpenModal(null);
    };

    const handleSelectCategoria = (categorias: string[]) => {
        if (categorias.length === 0) {
            setSelectedCategoria([]);
            return;
        }
        setSelectedCategoria(categorias);
    };

    const handleSelectPeriodo = (periodo: PeriodoSelecionado | null) => {
        setSelectedPeriodo(periodo);
        handleCloseModal();
    };

    return (
        <div className={styles.main}>
            <div className={styles.cardFiltro}>
                <div className={styles.containerFiltro}>
                    <h2><i className="bi bi-funnel"></i> Filtros</h2>
                    <form>
                        <div className={styles.groupInputs}>
                            <div className={styles.inputPesquisar}>
                                <label htmlFor="pesquisar"></label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    id="pesquisar"
                                    name="pesquisar"
                                    placeholder="Pesquisar"
                                    value={pesquisa}
                                    onChange={(e) => setPesquisa(e.target.value)}
                                />
                            </div>
                            <div className={styles.inputPeriodo}>
                                <label htmlFor="periodo"></label>
                                <button type="button" onClick={handleOpenPeriodoModal}>
                                    {selectedPeriodo
                                        ? selectedPeriodo.tipo === "predefinido"
                                            ? `Últimos ${selectedPeriodo.dias} dias`
                                            : `${selectedPeriodo.inicio?.toLocaleDateString("pt-BR")} - ${selectedPeriodo.fim?.toLocaleDateString("pt-BR")}`
                                        : "Periodo"}
                                    <i className="bi bi-chevron-down"></i>
                                </button>
                            </div>
                            <div className={styles.inputCategoria}>
                                <label htmlFor="categoria"></label>
                                <button type="button" onClick={handleOpenCategoriaModal}>
                                    {displayCategorias()}
                                    <i className="bi bi-chevron-down"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className={styles.cardTransacoes}>
                <h3 className="mb-3">Transações</h3>
                {transacoesFiltradas.length === 0 ? (
                    <p>Nenhuma transação encontrada...</p>
                ) : (
                    <ul className={styles.listaTransacoes}>
                        {transacoesFiltradas.map((conta) => (
                            <li key={conta.id} className={styles.itemTransacao}>
                                <div className={styles.infoTransacao}>
                                    <div className={styles.ladoEsquerdoTransacao}>
                                        <div className={styles.iconTransacao}>
                                            {categoriasUsuario.Despesa.includes(conta.categoria) ? (
                                                <i className="bi bi-arrow-down iconArrowDown"></i>
                                            ) : (
                                                <i className="bi bi-arrow-up iconArrowUp"></i>
                                            )}
                                        </div>
                                        <div className={styles.textosTransacao}>
                                            <h6>{conta.contaNome}</h6>
                                            <p>{conta.categoria}  </p>
                                        </div>
                                        <div className={styles.dataTransacao}>
                                            <span>{formatarDataParaExibir(conta.data)}</span>
                                            <span>{conta.status}</span>
                                        </div>
                                    </div>
                                    <div className={styles.ladoDireitoTransacao}>
                                        <div className={styles.valorTransacao}>
                                            {categoriasUsuario.Despesa.includes(conta.categoria) ? (
                                                <h5 className={styles.vermelhoTextoValor}>- {formatarValor(conta.valor, exibirAbreviado)}</h5>
                                            ) : (
                                                <h5 className={styles.verdeTextoValor}>+ {formatarValor(conta.valor, exibirAbreviado)}</h5>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {openModal === "periodo" && (
                <PeriodoModal onClose={handleCloseModal} onSelect={handleSelectPeriodo} />
            )}
            {openModal === "categoria" && (
                <CategoriaModal
                    onClose={handleCloseModal}
                    onSelect={handleSelectCategoria}
                    categoriasUsuario={categoriasUsuario}
                    selectedCategoria={selectedCategoria}  
                />
            )}
        </div>
    );
}
