import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SelectedProvider } from "src/contexts/SelectedContext";
import { CategoriaProvider } from "src/contexts/CategoriaContext";
import { TransacoesProvider } from "src/contexts/TransacoesContext";
import { OrcamentosProvider } from "src/contexts/OrcamentosContext";
import { MetasProvider } from "src/contexts/MetasContext";
import { ToastProvider } from "src/contexts/ToastContext";
import { ThemeProvider } from "src/contexts/ThemeContext";
import { DisplayPreferencesProvider } from "src/contexts/DisplayPreferencesContext";
import { AuthProvider } from "src/contexts/AuthContext";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "meuSaldo | Controle suas finanças de forma simples",
  description: "Controle suas finanças pessoais de forma prática com o MeuSaldo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable}`}>
        <SelectedProvider>
          <ToastProvider>
            <ThemeProvider>
            <AuthProvider>
              <DisplayPreferencesProvider>
                <CategoriaProvider>
                  <TransacoesProvider>
                    <OrcamentosProvider>
                      <MetasProvider>
                        {children}
                      </MetasProvider>
                    </OrcamentosProvider>
                  </TransacoesProvider>
                </CategoriaProvider>
              </DisplayPreferencesProvider>
              </AuthProvider>
            </ThemeProvider>
          </ToastProvider>
        </SelectedProvider>
      </body>
    </html>
  );
}
