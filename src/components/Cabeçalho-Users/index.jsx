import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
    FiHeart,
    FiShoppingCart
} from "react-icons/fi";

import { useAuth } from "../../contexts/authContext.jsx";
import { urlFotoUsuario } from "../../services/api.js";

import styles from "./style.module.css";

import Logo from "../../assets/imagens/logo.jfif";


export default function Header() {

    const [menuAberto, setMenuAberto] = useState(false);

    const { usuario, ehCliente } = useAuth();


    // =====================================================
    // URL DA FOTO DO USUÁRIO
    // =====================================================

    // =====================================================
    // FOTO DO USUÁRIO
    // =====================================================

    const fotoUsuario =
        urlFotoUsuario(usuario?.foto);


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

    <NavLink
        to="/cliente/inicio"
        className={({ isActive }) =>
            isActive ? styles.linkAtivo : ""
        }
    >
        Início
    </NavLink>

    <NavLink
        to="/cliente/simulador"
        className={({ isActive }) =>
            isActive ? styles.linkAtivo : ""
        }
    >
        Simulador
    </NavLink>

    <NavLink
        to="/cliente/livro"
        className={({ isActive }) =>
            isActive ? styles.linkAtivo : ""
        }
    >
        Livro de Cores
    </NavLink>

    {ehCliente && (
        <NavLink
            to="/cliente/produtos"
            className={({ isActive }) =>
                isActive ? styles.linkAtivo : ""
            }
        >
            Produtos
        </NavLink>
    )}

    <NavLink
        to="/cliente/sobre-nos"
        className={({ isActive }) =>
            isActive ? styles.linkAtivo : ""
        }
    >
        Sobre nós
    </NavLink>

</nav>

            {/* =================================================
                USUÁRIO DESKTOP
            ================================================= */}

            {ehCliente ? (
                <div className={styles.acoesUsuario}>
                    <Link
                        to="/cliente/favoritos"
                        className={styles.favoritosIcone}
                        title="Meus favoritos"
                        aria-label="Abrir meus favoritos"
                    >
                        <FiHeart size={21} />
                    </Link>

                    <Link
                        to="/cliente/carrinho"
                        className={styles.carrinhoIcone}
                        title="Meu carrinho"
                        aria-label="Abrir meu carrinho"
                    >
                        <FiShoppingCart size={21} />
                    </Link>

                    <Link
                        to="/cliente/perfil"
                        className={styles.usuario}
                        title={usuario.nome || "Meu perfil"}
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
                </div>
            ) : (
                <Link
                    to="/login"
                    className={styles.loginButton}
                    title="Fazer login"
                    onClick={fecharMenu}
                >
                    Login
                </Link>
            )}


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
                    to="/cliente/livro"
                    onClick={fecharMenu}
                >
                    Livro de Cores
                </Link>


                {ehCliente && (
                    <Link
                        to="/cliente/produtos"
                        onClick={fecharMenu}
                    >
                        Produtos
                    </Link>
                )}


                <Link
                    to="/cliente/sobre-nos"
                    onClick={fecharMenu}
                >
                    Sobre nós
                </Link>


                {ehCliente && (
                    <Link
                        to="/cliente/carrinho"
                        onClick={fecharMenu}
                    >
                        Carrinho
                    </Link>
                )}


                {ehCliente && (
                    <Link
                        to="/cliente/favoritos"
                        onClick={fecharMenu}
                    >
                        Favoritos
                    </Link>
                )}


                {/* =================================================
                    USUÁRIO MOBILE
                ================================================= */}

                {ehCliente ? (
                    <Link
                        to="/cliente/perfil"
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
                ) : (
                    <Link
                        to="/login"
                        className={styles.loginMobile}
                        onClick={fecharMenu}
                    >
                        Fazer login
                    </Link>
                )}

            </div>

        </header>

    );

}
