import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

export async function sendResetPasswordEmail(to: string, resetLink: string) {
    if (process.env.MOCK_EMAIL === "true") {
    console.log("📨 [MOCK] Envio de e-mail desativado");
    console.log(`🔗 [CI] Link de redefinição: ${resetLink}`);
    return;
    }

    console.log("[EMAIL] Iniciando criação do transporter...");
    
    const oauth2Client = new OAuth2( 
        process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI ); oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN, 
    });

    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken.token || "",
            },
        });
        
        const info = await transporter.sendMail({
            from: `"Suporte meuSaldo" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Redefinição de senha - meuSaldo",
            html: `
                <p>Olá,</p>
                <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>
                <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
                <p>Este link é válido por 15 minutos.</p>
                <p>Se você não fez esta solicitação, ignore este e-mail.</p>
            `,
        });

        console.log("[GMAIL API] Enviado:", info.messageId);
    } catch (error) {
        console.error("[GMAIL API] Falha geral:", error);
        throw error; 
    }
}