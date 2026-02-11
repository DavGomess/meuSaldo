import { google } from "googleapis";

export async function sendResetPasswordEmail(toEmail: string, resetLink: string) {
        const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
        const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
        const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
        const USER_EMAIL = process.env.GMAIL_USER;

        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
        oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    
        const gmail = google.gmail({
            version: 'v1',
            auth: oauth2Client
        });

        const subject = "Redefinição de senha - meuSaldo";
        const encodedSubject = `=?utf-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;

        const message = `
            Olá,
    
            Você solicitou a redefinição de senha. Clique no link abaixo para prosseguir:
            https://meusaldo-finance.vercel.app/redefinirSenha?token=${resetLink}

            Este link é válido por 15 minutos.
            Se você não fez esta solicitação, ignore este e-mail.
    
            Atenciosamente,
            meusaldosuporte@gmail.com  
        `;

        const rawMessage = Buffer.from(
            `From: ${USER_EMAIL}\r\n` +
            `To: ${toEmail}\r\n` +
            `Subject: ${encodedSubject}\r\n` +
            `\r\n` +
            `${message}`
        ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const accessToken = await oauth2Client.getAccessToken();
        console.log('Access Token obtido:', !!accessToken);

        try {
            await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                raw: rawMessage,
                },
            });
            console.log('E-mail enviado com sucesso para:', toEmail);
        } catch (error) {
            console.error('Erro ao enviar e-mail via Gmail API:', error);
            throw error;
        }
}