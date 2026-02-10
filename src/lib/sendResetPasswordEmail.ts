import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(to: string, resetLink: string) {
    if (process.env.MOCK_EMAIL === "true") {
    console.log("📨 [MOCK] Envio de e-mail desativado");
    console.log(`🔗 [CI] Link de redefinição: ${resetLink}`);
    return;
    }
    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
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
    };

    await transporter.sendMail(mailOptions);
}