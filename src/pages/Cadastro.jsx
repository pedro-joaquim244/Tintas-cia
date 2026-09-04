import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiMapPin,
    FiShield,
    FiUser
} from "react-icons/fi";

import { useAuth } from "../contexts/authContext";
import styles from "../styles/Cadastro.module.css";
import logo from "../assets/imagens/logo.jfif";

export default function Cadastro() {
    const { cadastrar } = useAuth();
    const navigate = useNavigate();

    // =====================================================
    // FORMULÁRIO
    // =====================================================

    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        data_nascimento: "",
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
    const [carregando, setCarregando] = useState(false);

    // =====================================================
    // ALTERAR CAMPO
    // =====================================================

    function alterarCampo(event) {
        const { name, value } = event.target;

        setForm((atual) => ({
            ...atual,
            [name]: value
        }));
    }

    // =====================================================
    // TELEFONE
    // =====================================================

    function alterarTelefone(event) {
        let valor = event.target.value.replace(/\D/g, "");

        valor = valor.slice(0, 11);

        if (valor.length <= 10) {
            valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
            valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
        } else {
            valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
            valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        }

        setForm((atual) => ({
            ...atual,
            telefone: valor
        }));
    }

    // =====================================================
    // CEP
    // =====================================================

    function alterarCEP(event) {
        let valor = event.target.value.replace(/\D/g, "");

        valor = valor.slice(0, 8);
        valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");

        setForm((atual) => ({
            ...atual,
            cep: valor
        }));
    }

    // =====================================================
    // ESTADO
    // =====================================================

    function alterarEstado(event) {
        const valor = event.target.value.toUpperCase().slice(0, 2);

        setForm((atual) => ({
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
            const resultado = await cadastrar({
                nome: form.nome.trim(),
                email: form.email.trim(),
                senha: form.senha,
                telefone: form.telefone,
                data_nascimento: form.data_nascimento,
                cep: form.cep,
                endereco: form.endereco.trim(),
                numero: form.numero.trim(),
                complemento: form.complemento.trim(),
                bairro: form.bairro.trim(),
                cidade: form.cidade.trim(),
                estado: form.estado
            });

            if (!resultado?.sucesso) {
                setErro(
                    resultado?.mensagem ||
                        "Não foi possível criar sua conta."
                );
                return;
            }

            setSucesso("Conta de cliente criada com sucesso!");

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1200);
        } catch (error) {
            console.error("Erro ao cadastrar:", error);

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

            <aside className={styles.left}>
                <div className={styles.decorCircleOne}></div>
                <div className={styles.decorCircleTwo}></div>
                <div className={styles.decorDotOne}></div>
                <div className={styles.decorDotTwo}></div>

                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate("/cliente/inicio")}
                >
                    <FiArrowLeft />
                    Voltar para o início
                </button>

                <div className={styles.leftContent}>
                    <img
                        src={logo}
                        alt="Pixel Color"
                        className={styles.logo}
                    />

                    <span className={styles.leftMiniTitle}>
                        PIXEL COLOR
                    </span>

                    <div className={styles.leftLine}></div>

                    <h1>
                        Crie sua conta e
                        <br />
                        transforme seu espaço.
                    </h1>

                    <p className={styles.leftText}>
                        Faça parte da Pixel Color para acessar
                        produtos, acompanhar pedidos e aproveitar
                        uma experiência completa com estilo
                        profissional e visual alinhado ao seu site.
                    </p>

                    <div className={styles.leftBenefits}>
                        <div className={styles.benefitItem}>
                            <FiCheckCircle />
                            <div>
                                <strong>Cadastro rápido</strong>
                                <span>
                                    Crie sua conta e comece em
                                    poucos minutos.
                                </span>
                            </div>
                        </div>

                        <div className={styles.benefitItem}>
                            <FiCheckCircle />
                            <div>
                                <strong>Seus pedidos organizados</strong>
                                <span>
                                    Acompanhe compras e dados em um
                                    só lugar.
                                </span>
                            </div>
                        </div>

                        <div className={styles.benefitItem}>
                            <FiCheckCircle />
                            <div>
                                <strong>Experiência Pixel Color</strong>
                                <span>
                                    Visual elegante mantendo a cara
                                    do seu projeto.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* =================================================
                LADO DIREITO
            ================================================= */}

            <section className={styles.right}>
                <div className={styles.formWrapper}>
                    <div className={styles.topo}>
                        <span className={styles.eyebrow}>
                            NOVA CONTA
                        </span>

                        <h2>
                            Criar
                            <em> conta.</em>
                        </h2>

                        <p>
                            Preencha seus dados abaixo para entrar
                            na experiência Pixel Color.
                        </p>
                    </div>

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

                    <form
                        onSubmit={enviar}
                        className={styles.form}
                    >
                        {/* =================================================
                            DADOS DA CONTA
                        ================================================= */}

                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>
                                    <FiUser />
                                </div>

                                <div>
                                    <span>ETAPA 01</span>
                                    <h3>Dados da conta</h3>
                                </div>
                            </div>

                            <div className={styles.fields}>
                                <div
                                    className={`${styles.field} ${styles.full}`}
                                >
                                    <label>Nome completo</label>
                                    <input
                                        name="nome"
                                        type="text"
                                        placeholder="Digite seu nome completo"
                                        value={form.nome}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Digite seu e-mail"
                                        value={form.email}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Senha</label>
                                    <input
                                        name="senha"
                                        type="password"
                                        placeholder="Digite sua senha"
                                        value={form.senha}
                                        onChange={alterarCampo}
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            DADOS PESSOAIS
                        ================================================= */}

                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>
                                    <FiShield />
                                </div>

                                <div>
                                    <span>ETAPA 02</span>
                                    <h3>Dados pessoais</h3>
                                </div>
                            </div>

                            <div className={styles.fields}>
                                <div className={styles.field}>
                                    <label>Telefone</label>
                                    <input
                                        name="telefone"
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={form.telefone}
                                        onChange={alterarTelefone}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Data de nascimento</label>
                                    <input
                                        name="data_nascimento"
                                        type="date"
                                        value={form.data_nascimento}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            ENDEREÇO
                        ================================================= */}

                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>
                                    <FiMapPin />
                                </div>

                                <div>
                                    <span>ETAPA 03</span>
                                    <h3>Endereço</h3>
                                </div>
                            </div>

                            <div className={styles.fields}>
                                <div className={styles.field}>
                                    <label>CEP</label>
                                    <input
                                        name="cep"
                                        type="text"
                                        placeholder="00000-000"
                                        value={form.cep}
                                        onChange={alterarCEP}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>UF</label>
                                    <input
                                        name="estado"
                                        type="text"
                                        placeholder="SP"
                                        value={form.estado}
                                        onChange={alterarEstado}
                                        maxLength={2}
                                        required
                                    />
                                </div>

                                <div
                                    className={`${styles.field} ${styles.full}`}
                                >
                                    <label>Rua / Avenida</label>
                                    <input
                                        name="endereco"
                                        type="text"
                                        placeholder="Digite sua rua ou avenida"
                                        value={form.endereco}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Número</label>
                                    <input
                                        name="numero"
                                        type="text"
                                        placeholder="Número"
                                        value={form.numero}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Complemento</label>
                                    <input
                                        name="complemento"
                                        type="text"
                                        placeholder="Complemento"
                                        value={form.complemento}
                                        onChange={alterarCampo}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Bairro</label>
                                    <input
                                        name="bairro"
                                        type="text"
                                        placeholder="Bairro"
                                        value={form.bairro}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Cidade</label>
                                    <input
                                        name="cidade"
                                        type="text"
                                        placeholder="Cidade"
                                        value={form.cidade}
                                        onChange={alterarCampo}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            BOTÃO
                        ================================================= */}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={carregando}
                        >
                            {carregando
                                ? "Cadastrando..."
                                : "Criar conta"}
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
            </section>
        </div>
    );
}