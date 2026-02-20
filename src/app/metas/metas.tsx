import styles from "./metas.module.css"
import { useCategorias } from "../../contexts/CategoriaContext";
import { useMetas } from "../../contexts/MetasContext";
import { useToast } from "../../contexts/ToastContext"
import { useState } from "react";
import CategoriaModal from "../components/CategoriaModal";
import DatePicker from "react-datepicker";
import { MetaLocal } from "../../types";


export default function Metas() {
    const { categorias } = useCategorias();
    const { metas, adicionarMeta, removerMeta, editarMeta, adicionarValorMeta } = useMetas();
    const { showToast } = useToast();
    const [titulo, setTitulo] = useState("");
    const [valorDesejado, setValorDesejado] = useState<string>("");
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [novaData, setNovaData] = useState<Date | null>(null);
    const [valorAdicionar, setValorAdicionar] = useState<Record<number, string>>({});
    const [editandoMetaId, setEditandoMetaId] = useState<number | null>(null);
    const [modoEdicao, setModoEdicao] = useState(false);

    const parseDate = (dateString: string): Date => {
        const datePart = dateString.split("T")[0];
        const [ano, mes, dia] = datePart.split("-").map(Number);
        return new Date(ano, mes - 1, dia);
    };

    const categoriaMap = new Map<string, number>();
    categorias.forEach(c => categoriaMap.set(c.nome, c.id));

    const resetForm = () => {
        setTitulo("");
        setValorDesejado("");
        setSelectedCategoria("");
        setNovaData(null);
    };

    const displayCategoriaNome = (categoriaId: number | null) => {
        if (categoriaId === null) return "Sem categoria";
        const cat = categorias.find(c => c.id === categoriaId);
        return cat?.nome ?? "Desconhecida";
    };

    const formatarDataParaBackend = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!novaData) return;
        const categoriaId = categoriaMap.get(selectedCategoria) ?? null;
        const prazo = formatarDataParaBackend(novaData);
        
        try {
            await adicionarMeta({
                titulo,
                categoriaId,
                valorAlvo: Number(valorDesejado),
                prazo,
            });

            showToast("Meta criada!", "success");
            resetForm();
        } catch {
            showToast("Erro ao criar", "danger");
        }
    }

    const handleAdicionarValor = async (metaId: number) => {
        const valorDigitado = valorAdicionar[metaId] ?? "";
        const valor = valorDigitado === "" ? 0 : Number(valorDigitado.replace(",", "."));

        if (isNaN(valor) || valor <= 0) return;

        try {
            await adicionarValorMeta(metaId, valor);
            setValorAdicionar(prev => ({ ...prev, [metaId]: "" }));
            showToast("Valor adicionado!", "success");
        } catch {
            showToast("Erro ao adicionar valor", "danger");
        }
    };

    const handleOpenCategoriaModal = () => setOpenModal("categoria");
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (categorias: string[]) => {
        setSelectedCategoria(categorias[0] || "");
        handleCloseModal();
    };

    const categoriasUsuario = {
        Receita: categorias.filter(c => c.tipo === "receita").map(c => c.nome),
        Despesa: categorias.filter(c => c.tipo === "despesa").map(c => c.nome),
    };

    const displayCategorias = () => {
        if (!selectedCategoria) return "Categoria";
        return selectedCategoria;
    };

    const calcularProgresso = (valorAtual: number, limite: number) => {
        const porcentagem = limite > 0 ? (valorAtual / limite) * 100 : 0;
        const restante = limite - valorAtual;
        return { restante, porcentagem }
    }

    function calcularDiasRestantes(prazo?: string | Date | null): number {
        if (!prazo) return Infinity;

        const data = typeof prazo === "string" ? parseDate(prazo) : prazo;
        const hoje = new Date();

        const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const inicioPrazo = new Date(data.getFullYear(), data.getMonth(), data.getDate());

        const diff = inicioPrazo.getTime() - inicioHoje.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const handleEditClick = (meta: MetaLocal) => {
        setModoEdicao(true);
        setEditandoMetaId(meta.id);
        setTitulo(meta.titulo);
        setSelectedCategoria(displayCategoriaNome(meta.categoriaId));
        setValorDesejado(meta.valorAlvo.toString());
        setNovaData(meta.prazo ? parseDate(meta.prazo) : null);
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editandoMetaId || !novaData) return;

        const categoriaId = categoriaMap.get(selectedCategoria) ?? null;
        const prazo = formatarDataParaBackend(novaData);

        const metaAtualizada: MetaLocal = {
            id: editandoMetaId,
            titulo,
            categoriaId,
            valorAlvo: Number(valorDesejado),
            valorAtual: metas.find(m => m.id === editandoMetaId)?.valorAtual ?? 0,
            prazo,
        };
        try {
            await editarMeta(metaAtualizada);
            showToast("Meta editada!", "success");
            resetForm();
            setModoEdicao(false);
            setEditandoMetaId(null);
        } catch {
            showToast("Erro ao editar", "danger");
        }
    }

    return (
        <div className={styles.main}>
            <div className={styles.cardNovaMeta}>
                <h2><i className="bi bi-bullseye"></i>Criar Nova Meta</h2>
                <form className={styles.formularioNovaMeta} onSubmit={(e) => {
                    e.preventDefault();
                    if (modoEdicao) {
                        handleEdit(e);
                    } else {
                        handleSubmit(e);
                    }
                }}>
                    <div className={styles.infoNovaMeta}>
                        <div className={styles.grupoInput}>
                            <label htmlFor="titulo">Título</label>
                            <input type="text" required value={titulo} onChange={(e) => setTitulo((e.target.value))} />
                        </div>
                        <div className={styles.inputCategoria}>
                            <label htmlFor="categoria">Categoria</label>
                            <button type="button" onClick={handleOpenCategoriaModal}>
                                {displayCategorias()}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    <div className={styles.infoNovaMeta}>
                        <div className={styles.grupoInput}>
                            <label htmlFor="valorDesejado">Valor Desejado</label>
                            <input type="number" required value={valorDesejado} onChange={(e) => setValorDesejado(e.target.value)} />
                        </div>
                        <div className={styles.grupoInput}>
                            <label htmlFor="prazo">Prazo</label>
                            <DatePicker
                                selected={novaData}
                                onChange={(date: Date | null) => setNovaData(date)}
                                dateFormat="dd/MM/yyyy"
                                className={styles.inputEditar}
                                required
                            />
                        </div>
                    </div>
                    <button className={`btn ${modoEdicao ? "btn-success" : "btn-primary"}`} type="submit">
                        {modoEdicao ? "+ Salvar" : "+ Criar"}
                    </button>
                </form>
            </div>
            <div className={styles.containerCardsMetas}>
                {metas.map((meta) => {
                    const { porcentagem } = calcularProgresso(meta.valorAtual, meta.valorAlvo);
                    return (
                        <div key={meta.id} className={styles.cardMetas}>
                            <div className={styles.headerMetas}>
                                <h5 className="m-0">{meta.titulo}</h5>
                                <div className={styles.categoriaMetas}>
                                    <h6 className="m-0">{displayCategoriaNome(meta.categoriaId)}</h6>
                                </div>
                                <div className={styles.iconsMetas}>
                                    <i className="bi bi-pencil iconPencil" onClick={() => handleEditClick(meta)}></i>
                                    <i className="bi bi-trash iconTrash" onClick={() => {removerMeta(meta.id)
                                        .then(() => showToast("Meta removida com sucesso!", "success"))
                                        .catch(() => showToast("Erro ao remover meta", "danger"));
                                    }}></i>
                                </div>
                            </div>
                            <div className={styles.bodyMetas}>
                                <div className={styles.infoProgresso}>
                                    <h6>Progresso</h6>
                                    <p>{porcentagem.toFixed(0)}%</p>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min(porcentagem, 100)}%` }}
                                    />
                                </div>
                                <div className={styles.containerValoresMetas}>
                                    <div>
                                        <label htmlFor="valor">Valor adicionar</label>
                                        <input type="number" value={valorAdicionar[meta.id] ?? ""} onChange={(e) => setValorAdicionar((prev) => ({
                                            ...prev,
                                            [meta.id]: (e.target.value)
                                        }))}
                                            disabled={meta.valorAtual >= meta.valorAlvo || calcularDiasRestantes(meta.prazo) <= 0}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary h-50"
                                        onClick={() => handleAdicionarValor(meta.id)}
                                        type="button"
                                        disabled={meta.valorAtual >= meta.valorAlvo || calcularDiasRestantes(meta.prazo) <= 0}
                                    >+ adicionar</button>
                                    <div>
                                        <label htmlFor="meta">Meta</label>
                                        <input type="number" value={meta.valorAlvo} disabled />
                                    </div>
                                </div>
                                <div className={styles.linhaDivisoria}><hr /></div>
                                <div className={styles.containerPrazoMetas}>
                                    {meta.valorAtual >= meta.valorAlvo ? (
                                        <h6 className={styles.metaConcluida}>
                                            🎉 Parabéns, meta concluída!
                                        </h6>
                                    ) : calcularDiasRestantes(meta.prazo) <= 0 ? (
                                        <h6 className={styles.prazoEncerrado}>
                                            ⚠️ Prazo Encerrado!
                                        </h6>
                                    ) : (
                                        <h6 className={calcularDiasRestantes(meta.prazo) <= 3 ? styles.diasRestantesAlerta : styles.diasRestantesNormal}>
                                            <span>Prazo:</span>
                                            {calcularDiasRestantes(meta.prazo)} dias restantes
                                        </h6>
                                    )
                                    }
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {
                openModal === 'categoria' && (
                    <CategoriaModal
                        multiple={false}
                        onClose={handleCloseModal}
                        onSelect={handleSelectCategoria}
                        categoriasUsuario={categoriasUsuario}
                        selectedCategoria={selectedCategoria !== "" ? [selectedCategoria] : []}
                    />
                )
            }
        </div>
    )
}