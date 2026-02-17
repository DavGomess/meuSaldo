interface ValidarSenhaParams {
        senha: string;
        confirmarSenha: string;
}

interface ValidarSenhaResult {
        valido: boolean;
        mensagem?: string;
}

export default function validarSenha({ senha, confirmarSenha }: ValidarSenhaParams): ValidarSenhaResult {

        if (senha.length < 6 || senha.length > 20) {
                return { valido: false, mensagem: "A senha deve ter entre 6 e 20 caracteres!" };
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,20}$/;

        if (!regex.test(senha)) {
                return { valido: false, mensagem: "A senha deve ter 1 maiúscula, 1 minúscula e 1 caractere especial, sem espaços ou caracteres inválidos!"};
        }

        if (senha !== confirmarSenha) {
                return { valido: false, mensagem: "As senhas não coincidem!" };
        }

        return { valido: true }; 
}