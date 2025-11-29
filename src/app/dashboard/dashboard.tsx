import { useTransacoes } from '../../contexts/TransacoesContext'
import styles from './dashboard.module.css'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCategorias } from '../../contexts/CategoriaContext';
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { formatarValor } from "../../utils/formatarValor";

type PayloadItem = {
    payload: {
        name?: string;
        value?: number | string;
        color?: string;
        [k: string]: unknown;
    };
    value?: number | string;
    color?: string;
};

type CustomTooltipProps = {
    active?: boolean;
    payload?: PayloadItem[];
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const item = payload[0];
    const name = String(item.payload?.name ?? "");
    const raw = item.value ?? item.payload?.value ?? 0;

    const value = typeof raw === "number" ? raw : Number(String(raw).replace(",", ".")) || 0;

    const color = String(item.color ?? item.payload?.color ?? "#000");

    return (
        <div
            style={{
                backgroundColor: "#fff",
                color: color,
                padding: "8px 10px",
                borderRadius: 6,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                fontSize: 16,
            }}
        >
            <div style={{ fontWeight: 700 }}>{name}</div>
            <div>{`R$ ${value.toLocaleString("pt-BR")}`}</div>
        </div>
    );
};

export default function Dashboard() {
    const { transacoes } = useTransacoes();
    const { categorias } = useCategorias();
    const {exibirAbreviado } = useDisplayPreferences();
    const COLORS = [
        "#e0d041ff", "#f19797ff", "#75d88eff", "#d97706", "#6b21a8", "#065f46", "#cf16b0ff", "#1e3a8a", "#a00606ff", "#4338ca", "#0ec5c5ff", "#b45309", "#45b619ff", "#cf135eff", "#0c4a6e", "#4b5563", "#8c68cfff", "#5900ffd7", "#a33d78ff", "#3d86a3ff"
    ];


    const totalReceitas = transacoes.filter(t => categorias.find(c => c.id === t.categoriaId)?.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);

    const totalDespesas = transacoes.filter(t => categorias.find(c => c.id === t.categoriaId)?.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);

    const saldoFinal = totalReceitas - totalDespesas;


    const transacoesPorCategorias = (Array.isArray(categorias) ? categorias : []).map((cat, i) => {
        const total = transacoes.filter(t => t.categoriaId === cat.id).reduce((acc, t) => acc + t.valor, 0);
        return { name: cat.nome, value: total, color: COLORS[i % COLORS.length] };
    }).filter(d => d.value > 0);

    const receitasVsDespesasMensal = Array.from({ length: 12 }, (_, i) => {
        const receitas = transacoes.filter(t => categorias.find(c => c.id === t.categoriaId)?.tipo === "receita" && new Date(t.data).getMonth() === i).reduce((acc, t) => acc + t.valor, 0);

        const despesas = transacoes.filter(t => categorias.find(c => c.id === t.categoriaId)?.tipo === "despesa" && new Date(t.data).getMonth() === i).reduce((acc, t) => acc + t.valor, 0);

        return { mes: i + 1, receitas, despesas };
    });


    return (
        <div className={styles.main}>
            <div className={styles.containerInfoValores}>
                <div className={styles.infoValoresReceitas}>
                    <h5 className="m-0">Receitas</h5>
                    <p className='m-0'>{formatarValor(totalReceitas, exibirAbreviado)}</p>
                </div>
                <div className={styles.infoValoresSaldo}>
                    <h5 className="m-0">Saldo</h5>
                    <p className='m-0'>{formatarValor(saldoFinal, exibirAbreviado)}</p>
                </div>
                <div className={styles.infoValoresDespesas}>
                    <h5 className="m-0">Despesas</h5>
                    <p className='m-0'>R$ {formatarValor(totalDespesas, exibirAbreviado)}</p>
                </div>
            </div>
            <div className={styles.containerGraficos}>
                <div className={styles.graficoBarra}>
                    <h4><i className="bi bi-bar-chart"></i>Receitas vs Despesas por Mês</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={receitasVsDespesasMensal}>
                            <CartesianGrid strokeDasharray={"3 3"} />
                            <XAxis dataKey="mes" tickFormatter={(mes) => ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][mes - 1]} />
                            <YAxis />
                            <Tooltip formatter={(value: number | string) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                            <Legend />
                            <Bar dataKey="receitas" fill="#22C55E" name="Receitas" barSize={40} />
                            <Bar dataKey="despesas" fill="#EF4444" name="despesas" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className={styles.graficoPizza}>
                    <h4><i className="bi bi-pie-chart"></i>Gasto por Categorias</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={transacoesPorCategorias}
                                cx="50%"
                                cy="50%"
                                fontSize={10}
                                labelLine={false}
                                outerRadius={90}
                                dataKey="value"
                                nameKey='name'
                                innerRadius={50}
                            >
                                {transacoesPorCategorias.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

