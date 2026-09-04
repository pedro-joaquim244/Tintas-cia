import { useState } from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    FiArrowLeft,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiLock,
    FiMail
} from "react-icons/fi";

import { useAuth } from "../contexts/authContext.jsx";

import logo from "../assets/imagens/logo.jfif";

import styles from "../styles/Login.module.css";


export default function Login() {

    const navigate = useNavigate();

    const location = useLocation();

    const { login } = useAuth();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [
        email,
        setEmail
    ] = useState("");


    const [
        senha,
        setSenha
    ] = useState("");


    const [
        mostrarSenha,
        setMostrarSenha
    ] = useState(false);


    const [
        carregando,
        setCarregando
    ] = useState(false);


    const [
        erro,
        setErro
    ] = useState("");


    // =====================================================
    // LOGIN
    // =====================================================

    async function entrar(event) {

        event.preventDefault();

        setErro("");

        setCarregando(true);


        try {

            const resultado =
                await login(
                    email.trim(),
                    senha
                );


            if (!resultado?.sucesso) {

                setErro(
                    resultado?.mensagem ||
                    "Não foi possível entrar. Confira seus dados."
                );

                return;

            }


            const usuario =
                resultado.usuario;


            if (!usuario) {

                setErro(
                    "Usuário não encontrado."
                );

                return;

            }


            // =================================================
            // ADMIN
            // =================================================

            if (
                usuario.tipo ===
                "admin"
            ) {

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true
                    }
                );

                return;

            }


            // =================================================
            // CLIENTE
            // =================================================

            if (
                usuario.tipo ===
                "cliente"
            ) {

                const rotaPretendida =
                    location.state?.from;


                const destino =

                    typeof rotaPretendida === "string" &&
                    rotaPretendida.startsWith("/cliente/")

                        ? rotaPretendida

                        : "/cliente/inicio";


                navigate(
                    destino,
                    {
                        replace: true
                    }
                );

                return;

            }


            setErro(
                "Tipo de usuário inválido."
            );


        } catch (error) {

            console.error(
                "Erro ao realizar login:",
                error
            );


            setErro(
                error?.response?.data?.erro ||
                "Ocorreu um erro ao entrar. Tente novamente."
            );


        } finally {

            setCarregando(
                false
            );

        }

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <main className={styles.page}>

            {/* =================================================
                LADO ESQUERDO
            ================================================= */}

            <aside className={styles.presentation}>

                {/* DECORAÇÃO */}

                <span
                    className={styles.circleLarge}
                    aria-hidden="true"
                />

                <span
                    className={styles.circleSmall}
                    aria-hidden="true"
                />

                <span
                    className={styles.decorativeDot}
                    aria-hidden="true"
                />


                {/* VOLTAR */}

                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() =>
                        navigate(
                            "/cliente/inicio"
                        )
                    }
                >

                    <FiArrowLeft />

                    <span>
                        Voltar para o início
                    </span>

                </button>


                {/* CONTEÚDO */}

                <div className={styles.presentationContent}>

                    <img
                        className={styles.logo}
                        src={logo}
                        alt="Pixel Color"
                    />


                    <span className={styles.brandLabel}>
                        PIXEL COLOR
                    </span>


                    <span
                        className={styles.blueLine}
                        aria-hidden="true"
                    />


                    <h1>

                        Entre novamente e

                        <br />

                        <em>
                            continue sua história.
                        </em>

                    </h1>


                    <p className={styles.introduction}>

                        Acesse sua conta para retomar suas
                        escolhas, acompanhar pedidos e continuar
                        transformando seus ambientes.

                    </p>


                    {/* BENEFÍCIOS */}

                    <div className={styles.benefits}>

                        <div className={styles.benefit}>

                            <FiCheckCircle />

                            <div>

                                <strong>
                                    Continue de onde parou
                                </strong>

                                <span>
                                    Suas informações ficam reunidas
                                    e organizadas.
                                </span>

                            </div>

                        </div>


                        <div className={styles.benefit}>

                            <FiCheckCircle />

                            <div>

                                <strong>
                                    Acompanhe seus pedidos
                                </strong>

                                <span>
                                    Consulte compras e atualizações
                                    em um só lugar.
                                </span>

                            </div>

                        </div>


                        <div className={styles.benefit}>

                            <FiCheckCircle />

                            <div>

                                <strong>
                                    Encontre novas possibilidades
                                </strong>

                                <span>
                                    Volte às cores e produtos para
                                    o seu projeto.
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </aside>


            {/* =================================================
                ÁREA DE LOGIN
            ================================================= */}

            <section className={styles.accessArea}>

                <div className={styles.accessContent}>

                    {/* =================================================
                        TÍTULO
                    ================================================= */}

                    <header className={styles.heading}>

                        <span className={styles.eyebrow}>
                            ÁREA DO CLIENTE
                        </span>


                        <h2>

                            Acesse sua{" "}

                            <em>
                                conta.
                            </em>

                        </h2>


                        <p>

                            Informe seu e-mail e sua senha
                            para entrar na experiência
                            Pixel Color.

                        </p>

                    </header>


                    {/* =================================================
                        ERRO
                    ================================================= */}

                    {erro && (

                        <div
                            className={styles.errorMessage}
                            role="alert"
                        >

                            {erro}

                        </div>

                    )}


                    {/* =================================================
                        FORMULÁRIO
                    ================================================= */}

                    <form
                        className={styles.form}
                        onSubmit={entrar}
                    >

                        <div className={styles.formCard}>

                            <div className={styles.cardHeading}>

                                <div className={styles.cardIcon}>

                                    <FiLock />

                                </div>


                                <div>

                                    <span>
                                        ACESSO SEGURO
                                    </span>

                                    <h3>
                                        Dados de acesso
                                    </h3>

                                </div>

                            </div>


                            <div className={styles.fields}>

                                {/* E-MAIL */}

                                <div className={styles.field}>

                                    <label htmlFor="login-email">
                                        E-mail
                                    </label>


                                    <div className={styles.inputWrapper}>

                                        <FiMail />


                                        <input
                                            id="login-email"
                                            type="email"
                                            value={email}
                                            onChange={
                                                (event) =>
                                                    setEmail(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Digite seu e-mail"
                                            autoComplete="email"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* SENHA */}

                                <div className={styles.field}>

                                    <label htmlFor="login-senha">
                                        Senha
                                    </label>


                                    <div className={styles.inputWrapper}>

                                        <FiLock />


                                        <input
                                            id="login-senha"
                                            type={
                                                mostrarSenha
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={senha}
                                            onChange={
                                                (event) =>
                                                    setSenha(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Digite sua senha"
                                            autoComplete="current-password"
                                            required
                                        />


                                        <button
                                            type="button"
                                            className={
                                                styles.passwordButton
                                            }
                                            onClick={() =>
                                                setMostrarSenha(
                                                    (valor) =>
                                                        !valor
                                                )
                                            }
                                            aria-label={
                                                mostrarSenha
                                                    ? "Ocultar senha"
                                                    : "Mostrar senha"
                                            }
                                        >

                                            {mostrarSenha ? (

                                                <FiEyeOff />

                                            ) : (

                                                <FiEye />

                                            )}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* BOTÃO */}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={carregando}
                        >

                            {
                                carregando
                                    ? "Entrando..."
                                    : "Entrar na minha conta"
                            }

                        </button>

                    </form>


                    {/* =================================================
                        CADASTRO
                    ================================================= */}

                    <p className={styles.registerText}>

                        Ainda não tem uma conta?

                        <Link to="/cadastro">
                            Criar conta
                        </Link>

                    </p>


                    {/* =================================================
                        ÁREA DE CONTEÚDO
                    ================================================= */}

                    <section className={styles.accountInfo}>

                        <div className={styles.accountInfoHeader}>

                            <span>
                                SUA EXPERIÊNCIA PIXEL COLOR
                            </span>


                            <h3>

                                Mais praticidade para

                                <br />

                                <em>
                                    transformar seus espaços.
                                </em>

                            </h3>

                        </div>


                        {/* =============================================
                            LINHA 01
                        ============================================= */}

                        <div className={styles.accountInfoItem}>

                            <span className={styles.infoNumber}>
                                01
                            </span>


                            <div>

                                <strong>
                                    Acompanhe cada pedido
                                </strong>


                                <p>

                                    Consulte suas compras,
                                    produtos escolhidos e o andamento
                                    dos seus pedidos quando quiser.

                                </p>

                            </div>

                        </div>


                        {/* =============================================
                            LINHA 02
                        ============================================= */}

                        <div className={styles.accountInfoItem}>

                            <span className={styles.infoNumber}>
                                02
                            </span>


                            <div>

                                <strong>
                                    Aproveite seus benefícios
                                </strong>


                                <p>

                                    Tenha seus pontos de fidelidade,
                                    cupons e vantagens reunidos
                                    em um único lugar.

                                </p>

                            </div>

                        </div>


                        {/* =============================================
                            LINHA 03
                        ============================================= */}

                        <div className={styles.accountInfoItem}>

                            <span className={styles.infoNumber}>
                                03
                            </span>


                            <div>

                                <strong>
                                    Uma experiência mais simples
                                </strong>


                                <p>

                                    Mantenha seus dados organizados
                                    e torne suas próximas compras
                                    mais rápidas e práticas.

                                </p>

                            </div>

                        </div>


                        {/* =============================================
                            TEXTO FINAL
                        ============================================= */}

                        <div className={styles.accountClosing}>

                            <div>

                                <span>
                                    PIXEL COLOR
                                </span>


                                <h4>
                                    Sua conta acompanha
                                    <em> suas escolhas.</em>
                                </h4>

                            </div>


                            <p>

                                Do primeiro produto ao acompanhamento
                                do pedido, tudo foi pensado para
                                facilitar sua experiência.

                            </p>

                        </div>


                        {/* =============================================
                            CONTINUAR SEM LOGIN
                        ============================================= */}

                        <div className={styles.continueArea}>

                            <span>
                                PREFERE CONTINUAR EXPLORANDO?
                            </span>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/cliente/inicio"
                                    )
                                }
                            >
                                Continuar sem entrar
                            </button>

                        </div>


                        {/* =============================================
                            ASSINATURA
                        ============================================= */}

                        <div className={styles.signature}>

                            <span>
                                PIXEL COLOR
                            </span>


                            <span>
                                CORES QUE TRANSFORMAM
                            </span>

                        </div>

                    </section>

                </div>

            </section>

        </main>

    );

}