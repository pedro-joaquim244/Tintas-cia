import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/authContext.jsx";

import styles from "../styles/Login.module.css";

import logo from "../assets/imagens/logo.jfif";

const FRASES = [
    "Transforme seu lar",
    "Cores que inspiram",
    "Sua casa, seu estilo",
    "Pinte novas histórias",
    "Pixel Color",
];

export default function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [email, setEmail] = useState("");

    const [senha, setSenha] = useState("");

    const [erro, setErro] = useState("");

    const [fraseAtual, setFraseAtual] = useState(0);

    const [fade, setFade] = useState(false);


    // =====================================================
    // FRASES DO LADO ESQUERDO
    // =====================================================

    useEffect(() => {

        let troca;

        const intervalo = setInterval(() => {

            setFade(true);

            troca = setTimeout(() => {

                setFraseAtual((prev) =>
                    prev === FRASES.length - 1
                        ? 0
                        : prev + 1
                );

                setFade(false);

            }, 500);

        }, 3000);


        return () => {

            clearInterval(intervalo);

            clearTimeout(troca);

        };

    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    async function entrar(event) {

        event.preventDefault();

        setErro("");


        const resultado = await login(
            email,
            senha
        );


        if (!resultado.sucesso) {

            setErro(
                resultado.mensagem
            );

            return;

        }


        const usuario =
            resultado.usuario;


        if (!usuario) {

            setErro(
                "Usuário não encontrado"
            );

            return;

        }


        // =================================================
        // ADMIN
        // =================================================

        if (usuario.tipo === "admin") {

            navigate(
                "/admin/dashboard",
                {
                    replace: true
                }
            );

        }

        // =================================================
        // CLIENTE
        // =================================================

        else if (usuario.tipo === "cliente") {

            navigate(
                "/cliente/inicio",
                {
                    replace: true
                }
            );

        }

        else {

            setErro(
                "Tipo de usuário inválido"
            );

        }

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className={styles.container}>

            {/* =================================================
                LADO ESQUERDO
            ================================================= */}

            <section className={styles.left}>

                <div className={styles.paint1} />
                <div className={styles.paint2} />
                <div className={styles.paint3} />
                <div className={styles.paint4} />


                <div className={styles.overlay}>

                    <div className={styles.brand}>

                        <img
                            src={logo}
                            alt="Pixel Color"
                            className={styles.logo}
                        />

                    </div>


                    <div className={styles.editorialLine} />


                    <h2
                        className={`
                            ${styles.changingText}
                            ${fade ? styles.fadeOut : ""}
                        `}
                    >
                        {FRASES[fraseAtual]}
                    </h2>


                    <p>
                        Entre na sua conta e continue
                        explorando cores, produtos e
                        possibilidades para transformar
                        cada ambiente.
                    </p>

                </div>

            </section>


            {/* =================================================
                LADO DIREITO
            ================================================= */}

            <section className={styles.right}>

                <div className={styles.card}>

                    <div className={styles.top}>

                        <span className={styles.eyebrow}>
                            Bem-vindo de volta
                        </span>

                        <h1>
                            Entrar
                        </h1>

                        <p>
                            Acesse sua conta para continuar
                            sua experiência na Pixel Color.
                        </p>

                    </div>


                    {/* =================================================
                        ERRO
                    ================================================= */}

                    {erro && (

                        <div className={styles.erro}>
                            {erro}
                        </div>

                    )}


                    {/* =================================================
                        FORMULÁRIO
                    ================================================= */}

                    <form
                        onSubmit={entrar}
                        className={styles.form}
                    >

                        <div className={styles.inputGroup}>

                            <label>
                                E-mail
                            </label>

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Digite seu e-mail"
                            />

                        </div>


                        <div className={styles.inputGroup}>

                            <label>
                                Senha
                            </label>

                            <input
                                type="password"
                                required
                                value={senha}
                                onChange={(event) =>
                                    setSenha(
                                        event.target.value
                                    )
                                }
                                placeholder="Digite sua senha"
                            />

                        </div>


                        <button
                            type="submit"
                            className={styles.button}
                        >
                            Entrar
                        </button>

                    </form>


                    {/* =================================================
                        CADASTRO
                    ================================================= */}

                    <div className={styles.cadastro}>

                        <span>
                            Ainda não tem uma conta?
                        </span>

                        <a
                            className={styles.link}
                            href="/cadastro"
                        >
                            Criar conta
                        </a>

                    </div>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className={styles.footer}>
                        Pixel Color © 2026
                    </div>

                </div>

            </section>

        </div>

    );

}
