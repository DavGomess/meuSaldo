"use client";

import styles from "./configuracoes.module.css"
import { useTheme } from "@/contexts/ThemeContext";
import { useDisplayPreferences } from "@/contexts/DisplayPreferencesContext";

export default function Configuracoes() {
    const { theme, toggleTheme } = useTheme();
    const { exibirAbreviado, setExibirAbreviado } = useDisplayPreferences();

    return (
        <div className={styles.main}>
            <div className={styles.cardConfiguracoes}>
                <h2><i className="bi bi-gear"></i> Configurações</h2>
                <div className={styles.containerInfoVisual}>
                    <div className={styles.containerTrocaTema}>
                        <div className={styles.infoTrocaTema}>
                            <h5><i className="bi bi-circle-half"></i> Preferência Visual</h5>
                            <p className={styles.descricao}>Escolha entre o modo claro ou escuro para a interface.</p>
                        </div>
                        <div className={styles.switchTema}>
                            <div className="form-check form-switch m-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="themeSwitch"
                                    checked={theme === "dark"}
                                    onChange={toggleTheme}
                                />
                                <label className="form-check-label" htmlFor="themeSwitch">
                                    {theme === "light" ? "Modo Claro" : "Modo Escuro"}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className={styles.containerModoExibicao}>
                        <div className={styles.infoExibicao}>
                            <h5><i className="bi bi-circle-half"></i> Preferência de Exibição</h5>
                            <p className={styles.descricao}>Defina se os valores numéricos serão exibidos de forma abreviada ou completa.</p>
                        </div>
                        <div className={styles.switchTema}>
                            <div className="form-check form-switch m-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="abreviadoSwitch"
                                    checked={exibirAbreviado}
                                    onChange={(e) => setExibirAbreviado(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="abreviadoSwitch">
                                    {exibirAbreviado ? "Formato Abreviado" : "Formato Normal"}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
