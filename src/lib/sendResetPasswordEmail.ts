import { google } from "googleapis";

export async function sendResetPasswordEmail(toEmail: string, resetLink: string) {
        const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
        const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
        const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
        const USER_EMAIL = process.env.GMAIL_USER;

         console.log('Iniciando envio de email para:', toEmail);
         console.log('CLIENT_ID existe?', !!CLIENT_ID);
         console.log('CLIENT_SECRET existe?', !!CLIENT_SECRET);
         console.log('USER_EMAIL:', USER_EMAIL || 'não definido');
         console.log('GMAIL_REFRESH_TOKEN existe?', !!REFRESH_TOKEN);

         if (!REFRESH_TOKEN) {
             console.error('ERRO CRÍTICO: GMAIL_REFRESH_TOKEN está vazio ou undefined!');
             throw new Error('Configuração de autenticação Gmail incompleta');
            }
            console.log('Usando REFRESH_TOKEN:', REFRESH_TOKEN.substring(0, 10) + '...');
            
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
        console.log('Access Token obtido com sucesso?', !!accessToken?.token);
        
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