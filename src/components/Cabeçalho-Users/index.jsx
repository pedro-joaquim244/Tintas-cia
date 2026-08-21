import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
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

        // Se já for uma URL completa
        if (
            foto.startsWith("http://") ||
            foto.startsWith("https://")
        ) {
            return foto;
        }

        /*
         * Exemplo salvo no banco:
         *
         * usuarios/usuario-1786621382335-571926189.webp
         *
         * URL final:
         *
         * http://localhost:3333/uploads/usuarios/...
         */

        return `http://localhost:3333/uploads/${foto}`;
    }


    // =====================================================
    // FOTO ATUAL
    // =====================================================

    const fotoUsuario =
        obterUrlFoto(usuario?.foto);


    // =====================================================
    // INICIAL DO USUÁRIO
    // =====================================================

    const inicialUsuario =
        usuario?.nome
            ?.charAt(0)
            ?.toUpperCase() || "U";


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <header className={styles.header}>


            {/* =================================================
                LOGO
            ================================================= */}

            <Link to="/cliente/inicio">

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

                            console.error(
                                "Não foi possível carregar:",
                                event.currentTarget.src
                            );

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
                aria-label="Abrir menu"
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
                    onClick={() =>
                        setMenuAberto(false)
                    }
                >
                    Início
                </Link>


                <Link
                    to="/cliente/simulador"
                    onClick={() =>
                        setMenuAberto(false)
                    }
                >
                    Simulador
                </Link>


                <Link
                    to="/cliente/cores"
                    onClick={() =>
                        setMenuAberto(false)
                    }
                >
                    Produtos
                </Link>


                <Link
                    to="/cliente/sobre-nos"
                    onClick={() =>
                        setMenuAberto(false)
                    }
                >
                    Sobre nós
                </Link>


                <Link
                    to="/cliente/carrinho"
                    onClick={() =>
                        setMenuAberto(false)
                    }
                >
                    Carrinho
                </Link>


                {/* =================================================
                    USUÁRIO MOBILE
                ================================================= */}

                <Link
                    to="/perfil"
                    className={
                        styles.usuarioMobile
                    }
                    onClick={() =>
                        setMenuAberto(false)
                    }
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


                    <span>
                        {usuario?.nome ||
                            "Usuário"}
                    </span>

                </Link>

            </div>

        </header>

    );

}