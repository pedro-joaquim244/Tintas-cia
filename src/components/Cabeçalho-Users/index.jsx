import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/authContext.jsx";

import styles from "./style.module.css";

import Logo from "../../assets/imagens/Logo.png";

export default function Header() {

    const [menuAberto, setMenuAberto] = useState(false);

    const { usuario } = useAuth();


    // =====================================================
    // URL DA FOTO DO USUÁRIO
    // =====================================================

    function obterUrlFoto(foto) {

        if (!foto) {
            return null;
        }

        let caminho = String(foto)
            .trim()
            .replace(/\\/g, "/");

        if (!caminho) {
            return null;
        }


        // Se já for uma URL completa
        if (
            caminho.startsWith("http://") ||
            caminho.startsWith("https://")
        ) {
            return caminho;
        }


        /*
         * O banco pode ter:
         *
         * usuarios/usuario-123.webp
         *
         * ou:
         *
         * uploads/usuarios/usuario-123.webp
         */


        // Remove "./" do início
        caminho = caminho.replace(/^\.?\//, "");


        // Caso já esteja salvo com uploads/
        if (caminho.startsWith("uploads/")) {

            return `http://localhost:3333/${caminho}`;

        }


        // Caso esteja salvo como:
        // usuarios/foto.webp

        return `http://localhost:3333/uploads/${caminho}`;
    }


    // =====================================================
    // FOTO DO USUÁRIO
    // =====================================================

    const fotoUsuario =
        obterUrlFoto(usuario?.foto);


    // =====================================================
    // INICIAL DO USUÁRIO
    // =====================================================

    const inicialUsuario =
        usuario?.nome
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase() || "U";


    // =====================================================
    // FECHAR MENU
    // =====================================================

    function fecharMenu() {

        setMenuAberto(false);

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <header className={styles.header}>


            {/* =================================================
                LOGO
            ================================================= */}

            <Link
                to="/cliente/inicio"
                onClick={fecharMenu}
            >

                <img
                    src={Logo}
                    alt="Logo"
                    className={styles.logo}
                />

            </Link>


            {/* =================================================
                MENU DESKTOP
            ================================================= */}

            <nav className={styles.nav}>

                <Link to="/cliente/inicio">
                    Início
                </Link>

                <Link to="/cliente/simulador">
                    Simulador
                </Link>

                <Link to="/cliente/Livro">
                    Livro de Cores
                </Link>

                <Link to="/cliente/produtos">
                    Produtos
                </Link>

                <Link to="/cliente/sobre-nos">
                    Sobre nós
                </Link>

                <Link to="/cliente/carrinho">
                    Carrinho
                </Link>

            </nav>


            {/* =================================================
                USUÁRIO DESKTOP
            ================================================= */}

            <Link
                to="/perfil"
                className={styles.usuario}
                title={usuario?.nome || "Meu perfil"}
            >

                {fotoUsuario ? (

                    <img
                        src={fotoUsuario}
                        alt={
                            usuario?.nome ||
                            "Usuário"
                        }
                        className={styles.avatar}
                        onError={(event) => {

                            /*
                             * Se a imagem não carregar,
                             * esconde a imagem e mostra
                             * a inicial automaticamente.
                             */

                            event.currentTarget.style.display =
                                "none";

                            const inicial =
                                event.currentTarget
                                    .parentElement
                                    ?.querySelector(
                                        `.${styles.avatarInicial}`
                                    );

                            if (inicial) {

                                inicial.style.display =
                                    "flex";

                            }

                        }}
                    />

                ) : null}


                {/* =================================================
                    INICIAL
                ================================================= */}

                <div
                    className={styles.avatarInicial}
                    style={{
                        display: fotoUsuario
                            ? "none"
                            : "flex"
                    }}
                >

                    {inicialUsuario}

                </div>

            </Link>


            {/* =================================================
                HAMBURGUER
            ================================================= */}

            <button
                type="button"
                className={`
                    ${styles.hamburguer}
                    ${menuAberto ? styles.ativo : ""}
                `}
                onClick={() =>
                    setMenuAberto(
                        !menuAberto
                    )
                }
                aria-label={
                    menuAberto
                        ? "Fechar menu"
                        : "Abrir menu"
                }
            >

                <span></span>
                <span></span>
                <span></span>

            </button>


            {/* =================================================
                MENU MOBILE
            ================================================= */}

            <div
                className={`
                    ${styles.menuMobile}
                    ${menuAberto ? styles.show : ""}
                `}
            >


                <Link
                    to="/cliente/inicio"
                    onClick={fecharMenu}
                >
                    Início
                </Link>


                <Link
                    to="/cliente/simulador"
                    onClick={fecharMenu}
                >
                    Simulador
                </Link>


                <Link
                    to="/cliente/Livro"
                    onClick={fecharMenu}
                >
                    Livro de Cores
                </Link>


                <Link
                    to="/cliente/produtos"
                    onClick={fecharMenu}
                >
                    Produtos
                </Link>


                <Link
                    to="/cliente/sobre-nos"
                    onClick={fecharMenu}
                >
                    Sobre nós
                </Link>


                <Link
                    to="/cliente/carrinho"
                    onClick={fecharMenu}
                >
                    Carrinho
                </Link>


                {/* =================================================
                    USUÁRIO MOBILE
                ================================================= */}

                <Link
                    to="/perfil"
                    className={styles.usuarioMobile}
                    onClick={fecharMenu}
                >

                    <div className={styles.avatarMobile}>


                        {fotoUsuario ? (

                            <img
                                src={fotoUsuario}
                                alt={
                                    usuario?.nome ||
                                    "Usuário"
                                }
                                className={styles.avatar}
                                onError={(event) => {

                                    event.currentTarget.style.display =
                                        "none";

                                    const inicial =
                                        event.currentTarget
                                            .parentElement
                                            ?.querySelector(
                                                `.${styles.avatarInicial}`
                                            );

                                    if (inicial) {

                                        inicial.style.display =
                                            "flex";

                                    }

                                }}
                            />

                        ) : null}


                        <div
                            className={
                                styles.avatarInicial
                            }
                            style={{
                                display: fotoUsuario
                                    ? "none"
                                    : "flex"
                            }}
                        >

                            {inicialUsuario}

                        </div>

                    </div>


                    <span>
                        {usuario?.nome ||
                            "Usuário"}
                    </span>

                </Link>

            </div>

        </header>

    );

}