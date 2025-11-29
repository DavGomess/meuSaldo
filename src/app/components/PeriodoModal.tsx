import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from '../transacoes/transacoes.module.css';
import { PeriodoSelecionado } from '../../types';
import { useToast } from "../../contexts/ToastContext";

type PeriodoModalProps = {
    onClose: () => void;
    onSelect: (periodo: PeriodoSelecionado | null) => void;
};

export default function PeriodoModal({ onClose, onSelect }: PeriodoModalProps) {
    const [selectedTemp, setSelectedTemp] = useState<string | null>(null);
    const [dataInicial, setDataInicial] = useState<Date | null>(null);
    const [dataFinal, setDataFinal] = useState<Date | null>(null);
    const { showToast } = useToast();
    
    const periodos = ["7 Dias", "15 Dias", "30 Dias", "90 Dias"];

    const diffDias = dataInicial && dataFinal ? Math.floor((new Date(dataFinal).getTime() - new Date(dataInicial).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const handleConfirm = () => {
        if (selectedTemp) {
            const dias = parseInt(selectedTemp.split(" ")[0], 10);
            onSelect({ tipo: "predefinido", dias });
            onClose();
            return;
        }
        
        if (dataInicial && dataFinal) {
            if ( diffDias > 365) {
                showToast("O período personalizado não pode exceder 1 ano.", "danger");
                return;
            }
            onSelect({ tipo: "personalizado", inicio: dataInicial, fim: dataFinal });
            onClose();
        }
    };

    const handleClear = () => {
        setSelectedTemp(null);
        setDataInicial(null);
        setDataFinal(null);
        onSelect(null);
        onClose();
    }

    const isBotaoConfirmarAtivo = selectedTemp !== null || (dataInicial !== null && dataFinal !== null && diffDias >= 0 && diffDias <= 365);

    return (
        <>
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered " role="document">
                <div className="modal-content ">
                    <div className="modal-header">
                        <h4 className="modal-title">Período</h4>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <ul className="modalList">
                            {periodos.map((periodo) => (
                                <li
                                    key={periodo}
                                    className={`modalItem ${selectedTemp === periodo ? "active" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setSelectedTemp(periodo)
                                        setDataInicial(null);
                                        setDataFinal(null);
                                    }}
                                >
                                    {periodo}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4">
                            <h5>Personalizar</h5>
                            <p className="fw-light">Você só pode consultar períodos de até 1 ano</p>
                            <div className="d-flex flex-column gap-2 w-100">
                                <div className={styles.containerDate}>
                                <DatePicker
                                    selected={dataInicial}
                                    onChange={(date) => {
                                        setDataInicial(date);
                                        setSelectedTemp(null); 
                                    }}
                                    placeholderText="Data Inicial"
                                    className={styles.inputDate}
                                    dateFormat="dd/MM/yyyy"
                                    maxDate={new Date()}
                                />
                                <i className="bi bi-calendar-week fs-4"></i>
                                </div>
                                
                                <div className={styles.containerDate}>
                                <DatePicker
                                    selected={dataFinal}
                                    onChange={(date) => {
                                        setDataFinal(date);
                                        setSelectedTemp(null); 

                                        if (dataInicial && date) {
                                            const diff = Math.floor(
                                                (new Date(date).getTime() - new Date(dataInicial).getTime()) / (1000 * 60 * 60 * 24)
                                            );
                                        if (diff > 365) {
                                            showToast("O período personalizado não pode exceder 1 ano.", "danger");
                                        }
                                        }
                                    }}
                                    placeholderText="Data Final"
                                    className={styles.inputDate}
                                    dateFormat="dd/MM/yyyy"
                                    maxDate={new Date()}
                                />
                                <i className="bi bi-calendar-week fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={handleClear}>
                            Limpar
                        </button>
                        <button className="btn btn-primary" onClick={handleConfirm}
                        disabled={!isBotaoConfirmarAtivo}>
                            Confirmar
                        </button>
                        <button className="btn btn-danger" onClick={onClose}>
                            Fechar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </>
    )
}