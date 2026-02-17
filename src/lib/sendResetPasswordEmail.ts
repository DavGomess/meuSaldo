import { google } from "googleapis";

export async function sendResetPasswordEmail(toEmail: string, resetLink: string) {
        const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
        const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
        const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
        const USER_EMAIL = process.env.GMAIL_USER;

        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            
        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
        oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    
        const gmail = google.gmail({
            version: 'v1',
            auth: oauth2Client
        });

        const subject = "Redefinição de senha - meuSaldo";
        const encodedSubject = `=?utf-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;

        const htmlMessage = `
        <p>Olá,</p>
        <p>Você solicitou a redefinição de senha. Clique no link abaixo para prosseguir:</p>
        <p>
            <a href="${APP_URL}/redefinirSenha?token=${resetLink}">
                Redefinir minha senha
            </a>
        </p>
        <p>Este link é válido por 15 minutos.</p>
        <p>Se você não fez esta solicitação, ignore este e-mail.</p>
        <br>
        <p>Atenciosamente,<br>Equipe meuSaldo</p>
        <p><small>meusaldosuporte@gmail.com</small></p>
    `;

        const rawMessage = Buffer.from(
            `From: ${USER_EMAIL}\r\n` +
            `To: ${toEmail}\r\n` +
            `Subject: ${encodedSubject}\r\n` +
            `MIME-Version: 1.0\r\n` +
            `Content-Type: text/html; charset=UTF-8\r\n` +
            `\r\n` +
            `${htmlMessage}`
        ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        try {
            await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                raw: rawMessage,
                },
            });
            console.log('E-mail enviado com sucesso para:', toEmail);
        } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = error && typeof error === 'object' && 'code' in error ? (error as Record<string, unknown>).code : undefined;
        const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as Record<string, unknown>).response : undefined;
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        console.error('Erro Gmail API completo:', {
            message: errorMessage,
            code: errorCode,
            response: errorResponse,
            stack: errorStack
        });
        throw error;
    }
}