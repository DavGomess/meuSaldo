import { useEffect, useState } from "react";

type CategoriaModalProps = {
    onClose: () => void;
    onSelect: (categoria: string[]) => void;
    multiple?: boolean;
    categoriasUsuario: {
        Receita: string[];
        Despesa: string[];
    };
    selectedCategoria?: string[];
};

export default function CategoriaModal({ onClose, onSelect, multiple = true, categoriasUsuario, selectedCategoria = [] }: CategoriaModalProps) {
    const [selectedTemp, setSelectedTemp] = useState<string[]>(selectedCategoria);
    const [initialSelection, setInitialSelection] = useState<string[]>(selectedCategoria);

    useEffect(() => {
        setSelectedTemp(selectedCategoria);
        setInitialSelection(selectedCategoria);
    }, [selectedCategoria]);

    const toggleCategoria = (categoria: string) => {
        if (!multiple) {
            setSelectedTemp([categoria]);
            return;
        }

        setSelectedTemp(prev => 
            prev.includes(categoria)
                ? prev.filter(c => c !== categoria)
                : [...prev, categoria]
        );
    };

    const handleConfirm = () => {
        onSelect(selectedTemp);
        onClose();
    };

    const isSelected = (cat: string) => selectedTemp.includes(cat);

    const hasChanged = JSON.stringify(selectedTemp) !== JSON.stringify(initialSelection);

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Categoria</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {Object.entries(categoriasUsuario).map(([tipo, lista]) => (
                            lista.length > 0 && (
                            <div key={tipo}>
                                <h6>{tipo === "Receita" ? "Receitas" : "Despesas"}</h6>
                                <ul className=" mb-3 modalList">
                                    {lista.map(categoria => (
                                        <li
                                            key={categoria}
                                            className={`modalItem ${isSelected(categoria) ? "active" : ""}`}
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                            onClick={() => toggleCategoria(categoria)}
                                        >
                                            {categoria}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            )
                        ))}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={handleConfirm} disabled={!hasChanged}>
                            Confirmar
                        </button>
                        <button className="btn btn-danger" onClick={onClose}>
                            Fechar
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}