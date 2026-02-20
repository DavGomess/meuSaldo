import { useCategorias } from "../../contexts/CategoriaContext";
import styles from "./categorias.module.css";
import { useToast } from "../../contexts/ToastContext";
import React from "react";

export default function Categorias() {
    const { categorias, addCategoria, deletarCategoria } = useCategorias();
    const { showToast } = useToast();

    const categoriasReceita = (Array.isArray(categorias) ? categorias : [])
        .filter(c => c.tipo === "receita")
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const categoriasDespesa = (Array.isArray(categorias) ? categorias : [])
        .filter(c => c.tipo === "despesa")
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const nome = form.nome.value.trim();
        const tipo = form.tipo.value as "receita" | "despesa";
        if (!nome || !tipo) return;

        const jaExiste = (Array.isArray(categorias) ? categorias : []).some(c => c.nome.toLowerCase() === nome.toLowerCase() && c.tipo === tipo);

        if (jaExiste) {
            showToast("Você já tem uma categoria com esse nome e nesse tipo!", "danger");
            return;
        }

        try {
            await addCategoria(nome, tipo);
            showToast("Categoria criada com sucesso!", "success");
            form.reset();
        } catch {
            showToast("Erro ao criar categoria", "danger");
        }
    };

    const handleDeletar = async (id: number) => {
        if (confirm("Tem certeza que quer deletar essa categoria?")) {
            try {
                await deletarCategoria(id);
                showToast("Categoria deletada com sucesso!", "success");
            } catch {
                showToast("Erro ao deletar categoria", "danger");
            }
        }
    };

    return (
        <div className={styles.main}>
            <div className={styles.cardAddCategorias}>
                <h2 className="fs-3"><i className="bi bi-tags"></i>Adicionar Nova Categoria</h2>
                <form onSubmit={handleAdd}>
                    <div className={styles.infoAddCategorias}>
                        <input type="text" placeholder="Insira o nome" name="nome" required />
                        <div className={styles.infoTipoCategorias}>
                            <select className="form-select" defaultValue="" name="tipo" required>
                                <option value="" disabled>Selecione a Categoria</option>
                                <option value="receita">Receita</option>
                                <option value="despesa">Despesa</option>
                            </select>
                            <i
                                className="bi bi-chevron-down"
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                    color: "var(--icon-color",
                                }}
                            ></i>
                        </div>
                        <button className={styles.buttonAdd} type="submit">+ Adicionar</button>
                    </div>
                </form>
            </div>

            <div className={styles.containerCategorias}>
                <div className={styles.categoriasReceitas}>
                    <div className='d-flex gap-2'>
                        <i className="bi bi-arrow-up iconArrowUp"></i>
                        <h2>Categorias de Receitas</h2>
                    </div>
                    <ul className={styles.renderizacaoTodasCategorias}>
                        {categoriasReceita.map(categoria => (
                            <li key={categoria.id} className={styles.renderizacaoItemReceita}>
                                {categoria.nome}
                                {categoria.userId !== null && (
                                    <button
                                        className="btn p-0"
                                        onClick={() => handleDeletar(categoria.id)}>
                                        <i className="bi bi-trash iconTrash"></i>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.categoriasDespesas}>
                    <div className='d-flex gap-2'>
                        <i className="bi bi-arrow-down iconArrowDown"></i>
                        <h2>Categorias de Despesas</h2>
                    </div>
                    <ul className={styles.renderizacaoTodasCategorias}>
                        {categoriasDespesa.map(categoria => (
                            <li key={categoria.id} className={styles.renderizacaoItemDespesa}>
                                {categoria.nome}
                                {categoria.userId !== null && (
                                    <button
                                        className="btn p-0"
                                        onClick={() => handleDeletar(categoria.id)}>
                                        <i className="bi bi-trash iconTrash"></i>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
