export type StatusConta = "paga" | "pendente" | "vencida";

export function definirStatus(data: string | Date): StatusConta {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let vencimento: Date;
    if (typeof data === "string") {
        const [ano, mes, dia] = data.split("T")[0].split("-").map(Number);
        vencimento = new Date(ano, mes - 1, dia); 
    } else {
        vencimento = new Date(data);
        vencimento.setHours(0, 0, 0, 0);
    }
    if (vencimento < hoje) {
        return "vencida";
    }
    return "pendente";
}
