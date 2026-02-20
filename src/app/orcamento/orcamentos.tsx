import CategoriaModal from "../components/CategoriaModal";
import styles from "./orcamentos.module.css"
import { useCategorias } from "../../contexts/CategoriaContext";
import { useOrcamentos } from "../../contexts/OrcamentosContext";
import { useToast } from "../../contexts/ToastContext";
import { useState } from "react";
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { formatarValor } from "../../utils/formatarValor";


export default function Orcamento() {
    const { categorias } = useCategorias();
    const { orcamentos, sync, upsert, remover, update, calcularProgresso } = useOrcamentos();
    const { showToast } = useToast();
    const { exibirAbreviado } = useDisplayPreferences();

    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [editandoOrcamentoId, setEditandoOrcamentoId] = useState<number | null>(null);
    const [valorInput, setValorInput] = useState<number | "">("");

    const temOrcamentoAtivo = orcamentos.length > 0;
    const estaEditando = editandoOrcamentoId !== null;

    const categoriaMap = new Map<string, number>();
    categorias.forEach(c => categoriaMap.set(c.nome, c.id));

    const categoriasUsuario = {
        Receita: categorias.filter(c => c.tipo === "receita").map(c => c.nome),
        Despesa: categorias.filter(c => c.tipo === "despesa").map(c => c.nome),
    };

    const handleOpenCategoriaModal = () => setOpenModal("categoria");
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (categorias: string[]) => {
        setSelectedCategoria(categorias[0] || "");
        handleCloseModal();
    };

    const displayCategorias = () => {
        if (!selectedCategoria) return "Categoria";
        return selectedCategoria;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const categoriaId = categoriaMap.get(selectedCategoria);
        if (!categoriaId || !form.valor.value) {
            showToast("Preencha todos os campos", "danger");
            return;
        }

        const valor = Number(form.valor.value);
        if (valor <= 0) {
            showToast("Valor deve ser maior que zero", "danger");
            return;
        }

        const mensagemSucesso = editandoOrcamentoId ? "Orçamento editado com sucesso!" : "Orçamento criado com sucesso!";
        showToast(mensagemSucesso, "success");

        try {
            if (editandoOrcamentoId) {
                await update(categoriaId, valor);
            } else {
                await upsert(categoriaId, valor);
            }

            await sync();
            form.reset();
            setSelectedCategoria("");
            setValorInput("");
            setEditandoOrcamentoId(null);
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : "Erro ao salvar orçamento";
            showToast(mensagem, "danger");
        }
    };

    const handleEditClick = (orcamento: typeof orcamentos[0]) => {
        const cat = categorias.find(c => c.id === orcamento.categoriaId);
        if (!cat) return;
        setSelectedCategoria(cat.nome);
        setValorInput(orcamento.valor);
        setEditandoOrcamentoId(orcamento.categoriaId);
    };

    const handleRemover = async (categoriaId: number) => {
        if (!confirm("Tem certeza que deseja remover este orçamento?")) return;
        showToast("Orçamento removido com sucesso!", "success");
        
        try {
            await remover(categoriaId);
        } catch {
            showToast("Erro ao remover", "danger");
        }
    };

    const totalOrcado = orcamentos.reduce((acc, o) => acc + o.valor, 0);
    const totalGasto = orcamentos.reduce((acc, o) => {
        const { gastoReal } = calcularProgresso(o.categoriaId);
        return acc + gastoReal;
    }, 0);
    const saldoRestante = totalOrcado - totalGasto

    return (
        <div className={styles.main}>
            <div className={styles.cardBalancoMes}>
                <h5 className="fs-3"><i className="bi bi-pencil"></i>Balanço do mês</h5>
                <div className={styles.containerInfoValores}>
                    <div className={styles.cardInfoValor}>
                        <h5>Total Orçado</h5>
                        <p className="fs-5">{formatarValor(totalOrcado, exibirAbreviado)}</p>
                    </div>
                    <div className={styles.cardInfoValor}>
                        <h5>Total Gasto</h5>
                        <p className="fs-5 text-danger">{formatarValor(totalGasto, exibirAbreviado)}</p>
                    </div>
                    <div className={styles.cardInfoValor}>
                        <h5>Saldo Restante</h5>
                        <p className="fs-5 text-success">R$ {formatarValor(saldoRestante, exibirAbreviado)}</p>
                    </div>
                </div>
            </div>
            <div className={styles.cardAddOrcamento}>
                <h4>Novo Orçamento</h4>
                <form className="d-flex justify-content-between" onSubmit={handleSubmit}>
                    <div className={styles.grupoInputs}>
                        <div className={styles.inputCategoria}>
                            <label htmlFor="categoria">Categoria</label>
                            <button type="button" onClick={handleOpenCategoriaModal} disabled={temOrcamentoAtivo && !estaEditando} style={{ color: "#757474ff" }}>
                                {displayCategorias()}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>
                        <div className={styles.inputValor}>
                            <label htmlFor="valor">Valor do Orçamento</label>
                            <input
                                type="number"
                                name="valor"
                                placeholder="Insira um valor"
                                disabled={temOrcamentoAtivo && !estaEditando}
                                value={valorInput} onChange={(e) => setValorInput(e.target.value === "" ? "" : Number(e.target.value))} />
                        </div>
                        <div className={styles.inputButton}>
                            <button type="submit" className={`btn ${editandoOrcamentoId ? "btn-success" : "btn-primary"}`} disabled={temOrcamentoAtivo && !estaEditando}>
                                {editandoOrcamentoId ? "+ Salvar" : "+ Criar"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className={styles.containerOrcamento}>
                {orcamentos.map((orcamento) => {
                    const { gastoReal, restante, porcentagem, concluido, } = calcularProgresso(orcamento.categoriaId);
                    const cat = categorias.find(c => c.id === orcamento.categoriaId);
                    const nome = cat?.nome ?? "Desconhecida";
                    
                    return (
                        <div
                            key={orcamento.id}
                            className={`${styles.cardOrcamento} ${concluido ? styles.cardOrcamentoExcedente : ""}`}
                        >
                            <div className={styles.headerOrcamento}>
                                <h5>{nome}</h5>
                                <div className={styles.iconsOrcamento}>
                                    <i
                                        className="bi bi-pencil iconPencil"
                                        onClick={() => handleEditClick(orcamento)}
                                    ></i>
                                    <i
                                        className="bi bi-trash iconTrash"
                                        onClick={() => handleRemover(orcamento.categoriaId)}
                                    ></i>
                                </div>
                            </div>
                            <div className={styles.bodyOrcamento}>
                                <div className={styles.infoProgresso}>
                                    <h6>Progresso</h6>
                                    <p>{porcentagem.toFixed(0)}%</p>
                                </div>

                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${porcentagem}%` }}
                                    />
                                </div>

                                <div className={styles.infoGasto}>
                                    <h6>Gasto:</h6>
                                    <p className="text-danger">{formatarValor(gastoReal, exibirAbreviado)}</p>
                                </div>

                                <div className={styles.infoOrcamento}>
                                    <h6>Orçamento:</h6>
                                    <p>{formatarValor(orcamento.valor, exibirAbreviado)}</p>
                                </div>

                                <div className={styles.infoRestante}>
                                    <h6>Restante:</h6>
                                    <p className="text-success">{formatarValor(restante, exibirAbreviado)}</p>
                                </div>

                                {concluido && (
                                    <div className={styles.orcamentoConcluido}>
                                        <h6>Orçamento concluído!</h6>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
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
        </div >
    )
}