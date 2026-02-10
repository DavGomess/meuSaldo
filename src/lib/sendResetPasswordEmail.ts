import { Resend } from "resend";

export async function sendResetPasswordEmail(to: string, resetLink: string) {
    if (process.env.MOCK_EMAIL === "true") {
    console.log("📨 [MOCK] Envio de e-mail desativado");
    console.log(`🔗 [CI] Link de redefinição: ${resetLink}`);
    return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    console.log("[EMAIL] Iniciando criação do transporter...");
    
    try {
        const { data, error } = await resend.emails.send({
            from: `"Suporte meuSaldo" <${process.env.EMAIL_USER}>`,
            to: [to],
            subject: "Redefinição de senha - meuSaldo",
            html: `
                <p>Olá,</p>
                <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>
                <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
                <p>Este link é válido por 15 minutos.</p>
                <p>Se você não fez esta solicitação, ignore este e-mail.</p>
            `,
        });

        if (error) {
            console.error("[RESEND] Erro:", error);
            throw error;
        }
        console.log("[RESEND] Enviado:", data);
    } catch (error) {
        console.error("[RESEND] Falha geral:", error);
        throw error; 
    }
}