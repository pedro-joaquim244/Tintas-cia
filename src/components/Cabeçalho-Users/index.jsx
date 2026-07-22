import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // ajuste o caminho conforme seu projeto
import styles from "./style.module.css";
import Logo from "../../assets/imagens/Logo.png";

export default function Header() {

    const [menuAberto, setMenuAberto] = useState(false);

    const { usuario } = useAuth();

    return (
        <header className={styles.header}>

            <img src={Logo} alt="Logo" className={styles.logo} />

            <nav className={styles.nav}>
                <a href="#">Início</a>
                <a href="#">Categorias</a>
                <a href="#">Produtos</a>
                <a href="#">Contato</a>
            </nav>

            <Link to="/perfil" className={styles.usuario}>

                {usuario?.foto ? (

                    <img
                        src={usuario.foto}
                        alt={usuario.nome}
                        className={styles.avatar}
                    />

                ) : (

                    <div className={styles.avatarInicial}>
                        {usuario?.nome?.charAt(0).toUpperCase()}
                    </div>

                )}

            </Link>

            <div
                className={`${styles.hamburguer} ${
                    menuAberto ? styles.ativo : ""
                }`}
                onClick={() => setMenuAberto(!menuAberto)}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div
                className={`${styles.menuMobile} ${
                    menuAberto ? styles.show : ""
                }`}
            >
                <a href="#">Início</a>
                <a href="#">Categorias</a>
                <a href="#">Produtos</a>
                <a href="#">Contato</a>

                <Link
                    to="/perfil"
                    className={styles.usuarioMobile}
                    onClick={() => setMenuAberto(false)}
                >
                    {usuario?.foto ? (
                        <img
                            src={usuario.foto}
                            alt={usuario.nome}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarInicial}>
                            {usuario?.nome?.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <span>{usuario?.nome}</span>
                </Link>
            </div>

        </header>
    );
}