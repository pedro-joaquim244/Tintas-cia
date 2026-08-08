
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/authContext";

import styles from "../styles/Cadastro.module.css";

export default function Cadastro() {

    const { cadastrar } = useAuth();

    const navigate = useNavigate();


    // =====================================================
    // FORMULÁRIO
    // =====================================================

    const [form, setForm] = useState({

        // Conta
        nome: "",
        email: "",
        senha: "",

        // Dados pessoais
        telefone: "",
        data_nascimento: "",

        // Endereço
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: ""

    });


    const [erro, setErro] = useState("");

    const [sucesso, setSucesso] = useState("");

    const [carregando, setCarregando] =
        useState(false);


    // =====================================================
    // ALTERAR CAMPO
    // =====================================================

    function alterarCampo(event) {

        const {
            name,
            value
        } = event.target;

        setForm(atual => ({
            ...atual,
            [name]: value
        }));

    }


    // =====================================================
    // TELEFONE
    // =====================================================

    function alterarTelefone(event) {

        let valor =
            event.target.value
                .replace(/\D/g, "");

        valor = valor.slice(0, 11);

        if (valor.length <= 10) {

            valor = valor.replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            );

            valor = valor.replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );

        } else {

            valor = valor.replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            );

            valor = valor.replace(
                /(\d{5})(\d)/,
                "$1-$2"
            );

        }

        setForm(atual => ({
            ...atual,
            telefone: valor
        }));

    }


    // =====================================================
    // CEP
    // =====================================================

    function alterarCEP(event) {

        let valor =
            event.target.value
                .replace(/\D/g, "");

        valor = valor.slice(0, 8);

        valor = valor.replace(
            /^(\d{5})(\d)/,
            "$1-$2"
        );

        setForm(atual => ({
            ...atual,
            cep: valor
        }));

    }


    // =====================================================
    // ESTADO
    // =====================================================

    function alterarEstado(event) {

        const valor =
            event.target.value
                .toUpperCase()
                .slice(0, 2);

        setForm(atual => ({
            ...atual,
            estado: valor
        }));

    }


    // =====================================================
    // ENVIAR CADASTRO
    // =====================================================

    async function enviar(event) {

        event.preventDefault();

        setErro("");

        setSucesso("");

        setCarregando(true);


        try {

            // =================================================
            // ENVIA TODOS OS DADOS
            // =================================================

            const resultado =
                await cadastrar({

                    nome:
                        form.nome.trim(),

                    email:
                        form.email.trim(),

                    senha:
                        form.senha,

                    telefone:
                        form.telefone,

                    data_nascimento:
                        form.data_nascimento,

                    cep:
                        form.cep,

                    endereco:
                        form.endereco.trim(),

                    numero:
                        form.numero.trim(),

                    complemento:
                        form.complemento.trim(),

                    bairro:
                        form.bairro.trim(),

                    cidade:
                        form.cidade.trim(),

                    estado:
                        form.estado

                });


            // =================================================
            // ERRO
            // =================================================

            if (!resultado?.sucesso) {

                setErro(
                    resultado?.mensagem ||
                    "Não foi possível criar sua conta."
                );

                return;

            }


            // =================================================
            // SUCESSO
            // =================================================

            setSucesso(
                "Conta de cliente criada com sucesso!"
            );


            setTimeout(() => {

                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

            }, 1200);

        } catch (error) {

            console.error(
                "Erro ao cadastrar:",
                error
            );

            setErro(
                error.response?.data?.erro ||
                "Erro ao criar sua conta."
            );

        } finally {

            setCarregando(false);

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

            <div className={styles.left}>

                <div className={styles.leftContent}>

                    <h1>
                        TRANSFORME
                        <br />
                        SEU LAR
                    </h1>

                    <p>
                        Crie sua conta para acessar
                        <br />
                        a experiência Pixel Colors.
                    </p>

                </div>

            </div>


            {/* =================================================
                LADO DIREITO
            ================================================= */}

            <div className={styles.right}>

                <form
                    onSubmit={enviar}
                    className={styles.form}
                >

                    <h1>
                        Criar conta
                    </h1>


                    <p className={styles.subtitulo}>
                        Preencha seus dados para continuar.
                    </p>


                    {/* =================================================
                        MENSAGENS
                    ================================================= */}

                    {erro && (

                        <div className={styles.erro}>
                            {erro}
                        </div>

                    )}


                    {sucesso && (

                        <div className={styles.sucesso}>
                            {sucesso}
                        </div>

                    )}


                    {/* =================================================
                        DADOS DA CONTA
                    ================================================= */}

                    <div className={styles.tituloSecao}>
                        Dados da conta
                    </div>


                    <input
                        name="nome"
                        type="text"
                        placeholder="Nome completo"
                        value={form.nome}
                        onChange={alterarCampo}
                        required
                    />


                    <input
                        name="email"
                        type="email"
                        placeholder="E-mail"
                        value={form.email}
                        onChange={alterarCampo}
                        required
                    />


                    <input
                        name="senha"
                        type="password"
                        placeholder="Senha"
                        value={form.senha}
                        onChange={alterarCampo}
                        minLength={6}
                        required
                    />


                    {/* =================================================
                        DADOS PESSOAIS
                    ================================================= */}

                    <div className={styles.tituloSecao}>
                        Dados pessoais
                    </div>


                    <div className={styles.grid}>

                        <input
                            name="telefone"
                            type="tel"
                            placeholder="Telefone"
                            value={form.telefone}
                            onChange={alterarTelefone}
                            required
                        />


                        <input
                            name="data_nascimento"
                            type="date"
                            value={
                                form.data_nascimento
                            }
                            onChange={alterarCampo}
                            required
                        />

                    </div>


                    {/* =================================================
                        ENDEREÇO
                    ================================================= */}

                    <div className={styles.tituloSecao}>
                        Endereço
                    </div>


                    <div className={styles.grid}>

                        <input
                            name="cep"
                            type="text"
                            placeholder="CEP"
                            value={form.cep}
                            onChange={alterarCEP}
                            required
                        />


                        <input
                            name="estado"
                            type="text"
                            placeholder="UF"
                            value={form.estado}
                            onChange={alterarEstado}
                            maxLength={2}
                            required
                        />

                    </div>


                    <input
                        name="endereco"
                        type="text"
                        placeholder="Rua / Avenida"
                        value={form.endereco}
                        onChange={alterarCampo}
                        required
                    />


                    <div className={styles.grid}>

                        <input
                            name="numero"
                            type="text"
                            placeholder="Número"
                            value={form.numero}
                            onChange={alterarCampo}
                            required
                        />


                        <input
                            name="complemento"
                            type="text"
                            placeholder="Complemento"
                            value={
                                form.complemento
                            }
                            onChange={alterarCampo}
                        />

                    </div>


                    <div className={styles.grid}>

                        <input
                            name="bairro"
                            type="text"
                            placeholder="Bairro"
                            value={form.bairro}
                            onChange={alterarCampo}
                            required
                        />


                        <input
                            name="cidade"
                            type="text"
                            placeholder="Cidade"
                            value={form.cidade}
                            onChange={alterarCampo}
                            required
                        />

                    </div>


                    {/* =================================================
                        BOTÃO
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={carregando}
                    >

                        {carregando
                            ? "Cadastrando..."
                            : "Criar conta"
                        }

                    </button>


                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    <p className={styles.loginText}>

                        Já tem uma conta?

                        <Link
                            to="/login"
                            className={styles.link}
                        >
                            Entrar
                        </Link>

                    </p>

                </form>

            </div>

        </div>

    );

}

