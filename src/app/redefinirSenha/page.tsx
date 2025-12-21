import { Suspense } from "react";
import RedefinirSenha from "./RedefinirSenha";

export default function RedefinirSenhaPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <RedefinirSenha />
        </Suspense>
    );
}
