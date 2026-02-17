export default function validarSenhaBackend(newPassword: string) {
    if (newPassword.length < 6 || newPassword.length > 20) {
        throw new Error("A nova senha deve ter entre 6 e 20 caracteres.");
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,20}$/;

    if (!regex.test(newPassword)) {
        throw new Error ("A senha deve ter 1 maiúscula, 1 minúscula e 1 caractere especial.");
    }
}
