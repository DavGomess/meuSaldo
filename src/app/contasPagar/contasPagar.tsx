import { useEffect, useState } from "react";
import styles from "./contasPagar.module.css"
import { ContaLocal, PayloadEdicao } from "../../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { definirStatus, StatusConta } from "../../utils/status";
import { useCategorias } from "../../contexts/CategoriaContext";
import CategoriaModal from "../components/CategoriaModal";
import { useTransacoes } from "../../contexts/TransacoesContext";
import { useToast } from "../../contexts/ToastContext";
import { ContaFromAPI } from "../../types";

export default function ContasPagar() {
    const { categorias } = useCategorias();
    const { setTransacoes } = useTransacoes();
    const { showToast } = useToast();
    const [contas, setContas] = useState<ContaLocal[]>([])
    const [selectedConta, setSelectedConta] = useState<ContaLocal | null>(null)
    const [isEditing, setIsEditing] = useState(false);
    const [novaData, setNovaData] = useState<Date | null>(null);
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);
    const [categoriaDisplay, setCategoriaDisplay] = useState<string>("Categoria");

    const handleOpenCategoriaModal = () => setOpenModal('categoria');
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (selecionadas: string[]) => {
        const nome = selecionadas[0];
        if (!nome || nome === "Todos") return;

        const categoria = categorias.find(c => c.nome === nome);
        if (!categoria) return;

        setEditCategoriaId(categoria.id);
        setCategoriaDisplay(categoria.nome);

        if (selectedConta) {
            setSelectedConta({
                ...selectedConta,
                categoria: categoria.nome,
                categoriaId: categoria.id,
            });
        }
        handleCloseModal();
    };

    useEffect(() => {
        const carregarContas = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:4000/contasPagar", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const contasBanco: ContaFromAPI[] = await res.json();

                    const contasFormatadas: ContaLocal[] = contasBanco.map(c => {
                        const categoriaNome = c.categoria?.nome || categorias.find(cat => cat.id === c.categoriaId)?.nome || "Sem categoria";

                        const statusCalculado = definirStatus(c.data);
                        return {
                            id: c.id,
                            nome: c.nome,
                            valor: c.valor,
                            data: c.data,
                            status: c.status === "paga" ? "paga" : statusCalculado,
                            statusAnterior: c.statusAnterior,
                            categoria: categoriaNome,
                            categoriaId: c.categoriaId,
                        };
                    });

                    setContas(contasFormatadas);
                    localStorage.setItem("contas", JSON.stringify(contasFormatadas));
                }
            } catch (err) {
                console.error("Erro ao carregar contas:", err);
            }
        };
        carregarContas();
    }, [categorias]);


    const categoriasParaModal = {
        Receita: (Array.isArray(categorias) ? categorias : []).filter(c => c.tipo === "receita").map(c => c.nome),
        Despesa: (Array.isArray(categorias) ? categorias : []).filter(c => c.tipo === "despesa").map(c => c.nome),
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        if (!editCategoriaId) {
            showToast("Selecione uma categoria", "danger");
            return;
        }

        if (!novaData) {
            showToast("Selecione uma data", "danger");
            return;
        }

        const conta = {
            nome: formData.get("nome") as string,
            valor: Number(formData.get("valor")),
            categoriaId: editCategoriaId,
            data: formatarDataParaBackend(novaData)
        };

        const token = sessionStorage.getItem("token");
        if (!token) {
            showToast("Token não encontrado", "danger");
            return;
        }

        const res = await fetch("http://localhost:4000/contasPagar", {
            method: "POST",
            body: JSON.stringify(conta),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
        });

        if (res.ok) {
            const contaSalva = await res.json();
            const categoriaNome = categorias.find(c => c.id === contaSalva.categoriaId)?.nome || "Sem categoria";
            const categoriaTipo = categorias.find(c => c.id === editCategoriaId)?.tipo || "despesa";

            const novaConta: ContaLocal = {
                ...contaSalva,
                categoria: categoriaNome,
                categoriaId: contaSalva.categoriaId
            };

            setContas(prev => {
                const atualizadas = [...prev, novaConta];
                localStorage.setItem("contas", JSON.stringify(atualizadas));
                return atualizadas;
            });

            const novaTransacao = {
                valor: contaSalva.valor,
                tipo: categoriaTipo,
                data: contaSalva.data,
                status: contaSalva.status,
                categoriaId: contaSalva.categoriaId,
                userId: contaSalva.userId,
                contaId: contaSalva.id,           
            };
            console.log(novaTransacao)

            const transacaoRes = await fetch("http://localhost:4000/transacoes", {
                method: "POST",
                body: JSON.stringify(novaTransacao),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (transacaoRes.ok) {
                const transacaoSalva = await transacaoRes.json();
                setTransacoes((prev) => {
                    const atualizadas = [...prev, transacaoSalva];
                    localStorage.setItem("transacoes", JSON.stringify(atualizadas));
                    return atualizadas;
                });
            }

            showToast("Conta criada com sucesso!", "success");
            form.reset();
            setNovaData(null);
            setEditCategoriaId(null);
            setCategoriaDisplay("Categoria");
        } else {
            const erro = await res.json();
            showToast(erro.error || "Erro ao criar conta", "danger");
        }
    };

    const toggleStatus = async (conta: ContaLocal) => {
        const statusAnterior = conta.status;
        let novoStatus: StatusConta;

        if (statusAnterior === "pendente" || statusAnterior === "vencida") {
            novoStatus = "paga";
        } else if (statusAnterior === "paga") {
            const anterior = conta.statusAnterior;

        if (anterior === "paga" || anterior === "pago") {
            novoStatus = "paga";
        } else if (anterior === "vencida" || anterior === "vencido") {
            novoStatus = "vencida";
        } else {
            novoStatus = "pendente"; 
        }
    } else {
        novoStatus = "pendente"; 
    }

        const contasAtualizadas = contas.map(c => c.id === conta.id ? { ...c, status: novoStatus, statusAnterior } : c);

        setContas(contasAtualizadas);
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas))

        const token = sessionStorage.getItem("token");
        if (!token) {
            showToast("Erro: token não encontrado", "danger");
            return;
        }

        const res = await fetch(`http://localhost:4000/contasPagar/${conta.id}`, {
            method: "PUT",
            body: JSON.stringify({ status: novoStatus }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            showToast(`Conta marcada como ${novoStatus}!`, "success");
        } else {
            setContas(contas.map(c => (c.id === conta.id ? { ...c, status: statusAnterior } : c)));
            localStorage.setItem("contas", JSON.stringify(contas));
            const erro = await res.json();
            showToast(erro.error || "Erro ao atualizar status", "danger");
        }
    };

    const abrirConta = (conta: ContaLocal) => {
        setSelectedConta(conta);
        setIsEditing(false);
        setEditCategoriaId(conta.categoriaId ?? null);
        setCategoriaDisplay(conta.categoria || "Categoria");
    };

    const abrirEdicao = (e: React.MouseEvent, conta: ContaLocal) => {
        e.stopPropagation();
        setSelectedConta(conta);
        setIsEditing(true);
        setEditCategoriaId(conta.categoriaId ?? null);
        setCategoriaDisplay(conta.categoria || "Categoria");
    };

    const deletarConta = async (conta: ContaLocal) => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const resConta = await fetch(`http://localhost:4000/contasPagar/${conta.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`}
            });

            if (!resConta.ok) throw new Error("Erro ao deletar conta");

            const resTransacao = await fetch(`http://localhost:4000/transacoes/conta/${conta.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!resTransacao) {
                console.warn("Transação não encontrada ou já deletada");
            }

            setContas(prev => prev.filter(c => c.id !== conta.id));
            setTransacoes(prev => prev.filter(t => t.contaId !== conta.id));

            showToast("Conta deletada com sucesso!", "success");
        } catch {
            showToast("Erro ao deletar conta", "danger");
        }
    }

    const renderLista = (status: StatusConta, titulo: string) => (
        <div className={styles.card}>
            <div className={styles.titulosStatus}>
                <h4>{titulo}</h4>
            </div>
            <ul className={styles.listaContas}>
                {contas.filter(c => c.status === status).map(conta => (
                    <li
                        key={conta.id}
                        className={styles.itemLista}
                        onClick={() => abrirConta(conta)}>
                        <span>{conta.nome}</span>
                        <div className={styles.listaContasButtons}>
                            <button className="btn">
                                <i
                                    className="bi bi-pencil iconPencil"
                                    onClick={(e) => abrirEdicao(e, conta)}
                                ></i>
                            </button>
                            <button className="btn">
                                <i
                                    className="bi bi-trash iconTrash"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletarConta(conta);
                                    }}
                                ></i>
                            </button>
                            <input
                                type="checkbox"
                                checked={conta.status === "paga"}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleStatus(conta)}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div >
    )

    const formatarDataParaBackend = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

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

    return (
        <div className={styles.main}>
            <div className={styles.formularioContasPagar}>
                <h2>Criar conta</h2>
                <form className={styles.formulario} onSubmit={handleSubmit}>
                    <div className={styles.grupoInputs}>
                        <div className={styles.inputFormulario}>
                            <label htmlFor="nome">Nome</label>
                            <input type="text" id="nome" name="nome" placeholder="Insira o nome da conta" required />
                        </div>
                        <div className={styles.inputFormulario}>
                            <label htmlFor="valor">Valor</label>
                            <input type="number" id="valor" name="valor" placeholder="Insira o valor" required />
                        </div>
                        <div className={styles.inputFormularioCategoria}>
                            <label htmlFor="categoria">Categoria</label>
                            <button type="button" onClick={handleOpenCategoriaModal}>
                                {categoriaDisplay}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>
                        <div className={styles.inputFormulario}>
                            <label htmlFor="data">Data</label>
                            <DatePicker
                                selected={novaData}
                                onChange={(date: Date | null) => setNovaData(date)}
                                dateFormat="dd/MM/yyyy"
                                className={styles.inputEditar}
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.buttonAdd} >+ Adicionar</button>
                </form>
            </div>
            <div className={styles.renderizacaoContasPagar}>
                {renderLista("vencida", "Vencidas")}
                {renderLista("pendente", "Pendentes")}
                {renderLista("paga", "Pagas")}
            </div>

            {selectedConta && (
                <div className={styles.modalOverlay} onClick={() => setSelectedConta(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            {isEditing ? (
                                <div
                                    className={styles.infoCard}
                                    style={{
                                        borderLeftColor:
                                            selectedConta.status === "vencida"
                                                ? "#dc3545"
                                                : selectedConta.status === "pendente"
                                                    ? "#ffc107"
                                                    : "#28a745",
                                        padding: "8px 12px",
                                        borderRadius: "8px",
                                        backgroundColor: "var(--input-bg)",
                                        marginBottom: "12px",
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={selectedConta.nome}
                                        className={styles.inputTitleEditar}
                                        onChange={(e) =>
                                            setSelectedConta({ ...selectedConta, nome: e.target.value })
                                        }
                                    />
                                </div>
                            ) : (
                                <h3>{selectedConta.nome}</h3>
                            )}
                            <span className={`${styles.statusBadge} ${styles[selectedConta.status]}`}>
                                {selectedConta.status}
                            </span>
                        </div>
                        <div className={styles.modalBody}>
                            {["data", "categoria", "valor"].map((campo) => (
                                <div
                                    key={campo}
                                    className={styles.infoCard}
                                    style={{
                                        borderLeftColor:
                                            selectedConta.status === "vencida"
                                                ? "#dc3545"
                                                : selectedConta.status === "pendente"
                                                    ? "#ffc107"
                                                    : "#28a745",
                                    }}
                                >
                                    {campo === "data" &&
                                        (isEditing ? (
                                            <DatePicker
                                                selected={selectedConta.data ? parseDate(selectedConta.data) : null}
                                                onChange={(date: Date | null) =>
                                                    setSelectedConta({
                                                        ...selectedConta,
                                                        data: date ? formatarDataParaBackend(date) : "",
                                                    })
                                                }
                                                dateFormat="dd/MM/yyyy"
                                                className={styles.inputEditarDate}
                                            />
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-calendar-days"></i>
                                                <p>{formatarDataParaExibir(selectedConta.data)}</p>
                                            </>
                                        ))}
                                    {campo === "categoria" &&
                                        (isEditing ? (
                                            <div className={styles.categoriaEdit}>
                                                <button
                                                    type="button"
                                                    className={styles.categoriaButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenModal('categoria');
                                                    }}
                                                >
                                                    {selectedConta.categoria || "Selecionar categoria"}
                                                    <i className="bi bi-chevron-down"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-tag"></i>
                                                <p>{selectedConta.categoria}</p>
                                            </>
                                        ))}
                                    {campo === "valor" &&
                                        (isEditing ? (
                                            <input
                                                type="number"
                                                value={selectedConta.valor}
                                                className={styles.inputEditar}
                                                onChange={(e) =>
                                                    setSelectedConta({
                                                        ...selectedConta,
                                                        valor: Number(e.target.value),
                                                    })
                                                }
                                            />
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-dollar-sign"></i>
                                                <p>R$ {selectedConta.valor.toFixed(2)}</p>
                                            </>
                                        ))}
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalFooter}>
                            {isEditing ? (
                                <>
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={async () => {
                                            if (!selectedConta) return;

                                            const payload: PayloadEdicao = {
                                                nome: selectedConta.nome.trim(),
                                                valor: selectedConta.valor,
                                                data: selectedConta.data
                                            };

                                            if (editCategoriaId !== null) {
                                                payload.categoriaId = editCategoriaId;
                                            }

                                            const token = sessionStorage.getItem("token");
                                            if (!token) {
                                                showToast("Token não encontrado", "danger");
                                                return;
                                            }

                                            try {
                                                const res = await fetch(`http://localhost:4000/contasPagar/${selectedConta.id}`, {
                                                    method: "PUT",
                                                    body: JSON.stringify(payload),
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${token}`
                                                    },
                                                })

                                                if (!res.ok) {
                                                    const erro = await res.json().catch(() => ({ error: "Erro desconhecido" }));
                                                    throw new Error(erro.error || "Falha ao editar");
                                                }

                                                const contaAtualizada = await res.json();
                                                const categoriaObj =
                                                    contaAtualizada.categoria?.nome
                                                        ? contaAtualizada.categoria
                                                        : categorias.find(cat => cat.id === (editCategoriaId ?? selectedConta.categoriaId));

                                                const novasContas = contas.map(c =>
                                                    c.id === contaAtualizada.id
                                                        ? {
                                                            ...c,
                                                            ...contaAtualizada,
                                                            categoria: categoriaObj?.nome || c.categoria,
                                                            categoriaId: categoriaObj?.id || c.categoriaId,
                                                        }
                                                        : c
                                                );

                                                setContas(novasContas)
                                                localStorage.setItem("contas", JSON.stringify(novasContas));

                                                showToast("Conta editada com sucesso!", "success");
                                            } catch (err: unknown) {
                                                const errorMessage = err instanceof Error ? err.message : "Erro ao editar conta";
                                                showToast(errorMessage, "danger");
                                            } finally {
                                                setIsEditing(false);
                                                setSelectedConta(null);
                                                setEditCategoriaId(null);
                                            }
                                        }
                                        }>
                                        Salvar
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setIsEditing(false);
                                            const original = contas.find(c => c.id === selectedConta?.id);
                                            setSelectedConta(original || null);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setSelectedConta(null)}
                                >
                                    Fechar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
            {
                openModal === 'categoria' && (
                    <CategoriaModal
                        multiple={false}
                        onClose={handleCloseModal}
                        onSelect={handleSelectCategoria}
                        categoriasUsuario={categoriasParaModal}
                    />
                )
            }
        </div >
    )
}