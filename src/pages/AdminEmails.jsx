import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FiAlertCircle,
    FiCheckCircle,
    FiChevronDown,
    FiMail,
    FiRefreshCw,
    FiSend,
    FiUser,
    FiUsers
} from "react-icons/fi";

import {
    FaNewspaper
} from "react-icons/fa";


import Cabecalho from
    "../components/Cabeçalho-ADM/Cabecalho.jsx";

import {
    api
} from "../services/api.js";

import styles from
    "../styles/EmailsAdmin.module.css";


// =====================================================
// OPÇÕES
// =====================================================

const destinos = [

    {
        valor:
            "USUARIO",

        titulo:
            "Um cliente",

        descricao:
            "Escolha apenas um cliente cadastrado.",

        icone:
            <FiUser />
    },

    {
        valor:
            "NEWSLETTER",

        titulo:
            "Newsletter",

        descricao:
            "Pessoas inscritas pelo rodapé do site.",

        icone:
            <FaNewspaper />
    },

    {
        valor:
            "TODOS",

        titulo:
            "Todos os clientes",

        descricao:
            "Todos os clientes cadastrados no sistema.",

        icone:
            <FiUsers />
    }

];


// =====================================================
// COMPONENTE
// =====================================================

export default function EmailsAdmin() {

    // =================================================
    // FORM
    // =================================================

    const [
        form,
        setForm
    ] = useState({

        destino:
            "USUARIO",

        usuario_id:
            "",

        assunto:
            "",

        mensagem:
            ""

    });


    // =================================================
    // CLIENTES
    // =================================================

    const [
        usuarios,
        setUsuarios
    ] = useState([]);


    // =================================================
    // RESUMO
    // =================================================

    const [
        resumo,
        setResumo
    ] = useState({

        clientes:
            0,

        newsletter:
            0

    });


    // =================================================
    // SMTP
    // =================================================

    const [
        smtp,
        setSmtp
    ] = useState({

        carregando:
            true,

        configurado:
            false,

        conectado:
            false,

        erro:
            ""

    });


    // =================================================
    // OUTROS
    // =================================================

    const [
        carregando,
        setCarregando
    ] = useState(
        true
    );


    const [
        enviando,
        setEnviando
    ] = useState(
        false
    );


    const [
        feedback,
        setFeedback
    ] = useState(
        null
    );


    // =================================================
    // DESTINO ATUAL
    // =================================================

    const destinoAtual =
        useMemo(
            () => {

                return destinos.find(
                    (item) =>
                        item.valor ===
                        form.destino
                );

            },
            [
                form.destino
            ]
        );


    // =================================================
    // USUÁRIO SELECIONADO
    // =================================================

    const usuarioSelecionado =
        useMemo(
            () => {

                return usuarios.find(
                    (usuario) =>
                        Number(
                            usuario.id
                        ) ===
                        Number(
                            form.usuario_id
                        )
                );

            },
            [
                usuarios,
                form.usuario_id
            ]
        );


    // =================================================
    // QUANTIDADE
    // =================================================

    const quantidadeDestino =
        useMemo(
            () => {

                if (
                    form.destino ===
                    "USUARIO"
                ) {

                    return usuarioSelecionado
                        ? 1
                        : 0;

                }


                if (
                    form.destino ===
                    "NEWSLETTER"
                ) {

                    return resumo.newsletter;

                }


                return resumo.clientes;

            },
            [
                form.destino,
                resumo,
                usuarioSelecionado
            ]
        );


    // =================================================
    // ALTERAR
    // =================================================

    function alterar(
        campo,
        valor
    ) {

        setForm(
            (atual) => ({

                ...atual,

                [campo]:
                    valor

            })
        );


        setFeedback(
            null
        );

    }


    // =================================================
    // DESTINO
    // =================================================

    function selecionarDestino(
        destino
    ) {

        setForm(
            (atual) => ({

                ...atual,

                destino,

                usuario_id:
                    destino === "USUARIO"
                        ? atual.usuario_id
                        : ""

            })
        );


        setFeedback(
            null
        );

    }


    // =================================================
    // SMTP
    // =================================================

    async function verificarSmtp() {

        try {

            setSmtp(
                (atual) => ({

                    ...atual,

                    carregando:
                        true

                })
            );


            const {
                data
            } =
                await api.get(
                    "/admin/emails/status"
                );


            setSmtp({

                carregando:
                    false,

                configurado:
                    Boolean(
                        data.configurado
                    ),

                conectado:
                    Boolean(
                        data.conectado
                    ),

                erro:
                    data.erro ||
                    ""

            });


        } catch (error) {

            console.error(
                "Erro SMTP:",
                error
            );


            setSmtp({

                carregando:
                    false,

                configurado:
                    false,

                conectado:
                    false,

                erro:
                    error.response?.data?.erro ||
                    "Não foi possível verificar o SMTP."

            });

        }

    }


    // =================================================
    // CARREGAR DADOS
    // =================================================

    async function carregarDados() {

        try {

            setCarregando(
                true
            );


            const [
                respostaUsuarios,
                respostaResumo
            ] =
                await Promise.all([

                    api.get(
                        "/admin/emails/destinatarios"
                    ),

                    api.get(
                        "/admin/emails/resumo"
                    )

                ]);


            setUsuarios(
                Array.isArray(
                    respostaUsuarios.data
                )
                    ? respostaUsuarios.data
                    : []
            );


            setResumo({

                clientes:
                    Number(
                        respostaResumo.data?.clientes ||
                        0
                    ),

                newsletter:
                    Number(
                        respostaResumo.data?.newsletter ||
                        0
                    )

            });


        } catch (error) {

            console.error(
                "Erro ao carregar tela de e-mails:",
                error
            );


            setFeedback({

                tipo:
                    "erro",

                titulo:
                    "Erro ao carregar os dados.",

                texto:
                    error.response?.data?.erro ||
                    "Não foi possível carregar os destinatários."

            });


        } finally {

            setCarregando(
                false
            );

        }

    }


    // =================================================
    // INICIAL
    // =================================================

    useEffect(
        () => {

            verificarSmtp();

            carregarDados();

        },
        []
    );


    // =================================================
    // ENVIAR
    // =================================================

    async function enviarEmail(
        event
    ) {

        event.preventDefault();


        setFeedback(
            null
        );


        // =================================================
        // SMTP
        // =================================================

        if (
            !smtp.conectado
        ) {

            setFeedback({

                tipo:
                    "erro",

                titulo:
                    "SMTP desconectado.",

                texto:
                    "O servidor de e-mail precisa estar conectado para realizar o envio."

            });


            return;

        }


        // =================================================
        // USUÁRIO
        // =================================================

        if (
            form.destino ===
                "USUARIO" &&
            !form.usuario_id
        ) {

            setFeedback({

                tipo:
                    "erro",

                titulo:
                    "Selecione um cliente.",

                texto:
                    "Escolha quem receberá o e-mail."

            });


            return;

        }


        // =================================================
        // ASSUNTO
        // =================================================

        if (
            !form.assunto.trim()
        ) {

            setFeedback({

                tipo:
                    "erro",

                titulo:
                    "Informe o assunto.",

                texto:
                    "Digite um assunto para o e-mail."

            });


            return;

        }


        // =================================================
        // MENSAGEM
        // =================================================

        if (
            !form.mensagem.trim()
        ) {

            setFeedback({

                tipo:
                    "erro",

                titulo:
                    "Informe a mensagem.",

                texto:
                    "Digite a mensagem que será enviada."

            });


            return;

        }


        // =================================================
        // ENVIAR
        // =================================================

        try {

            setEnviando(
                true
            );


            const {
                data
            } =
                await api.post(
                    "/admin/emails/enviar",
                    {

                        destino:
                            form.destino,

                        usuario_id:
                            form.destino ===
                            "USUARIO"
                                ? Number(
                                    form.usuario_id
                                )
                                : null,

                        assunto:
                            form.assunto.trim(),

                        mensagem:
                            form.mensagem.trim()

                    }
                );


            setFeedback({

                tipo:
                    Number(
                        data.erros ||
                        0
                    ) > 0

                        ? "aviso"

                        : "sucesso",

                titulo:
                    data.mensagem ||
                    "Envio concluído.",

                texto:
                    `${data.enviados || 0} enviado${Number(data.enviados) === 1 ? "" : "s"} • ${data.erros || 0} falha${Number(data.erros) === 1 ? "" : "s"}`

            });


            setForm(
                (atual) => ({

                    ...atual,

                    assunto:
                        "",

                    mensagem:
                        ""

                })
            );


        } catch (error) {

            console.error(
                "Erro ao enviar:",
                error
            );


            setFeedback({

                tipo:
                    "erro",

                titulo:
                    error.response?.data?.erro ||
                    "Não foi possível enviar.",

                texto:
                    error.response?.data?.detalhe ||
                    "Verifique a API e tente novamente."

            });


        } finally {

            setEnviando(
                false
            );

        }

    }


    // =================================================
    // JSX
    // =================================================

    return (

        <div
            className={styles.container}
        >

            <Cabecalho />


            <main
                className={styles.main}
            >

                {/* ========================================= */}
                {/* CABEÇALHO */}
                {/* ========================================= */}

                <header
                    className={styles.hero}
                >

                    <div>

                        <span
                            className={styles.eyebrow}
                        >
                            COMUNICAÇÃO
                        </span>


                        <h1>

                            Central de

                            <em>
                                {" "}e-mails.
                            </em>

                        </h1>


                        <p>
                            Envie comunicados, novidades e
                            promoções diretamente para seus
                            clientes e assinantes.
                        </p>

                    </div>


                    <div
                        className={styles.heroIcon}
                    >

                        <FiMail />

                    </div>

                </header>


                {/* ========================================= */}
                {/* RESUMO */}
                {/* ========================================= */}

                <section
                    className={styles.summary}
                >

                    <article>

                        <div
                            className={styles.summaryIcon}
                        >
                            <FiUsers />
                        </div>


                        <div>

                            <span>
                                Clientes com e-mail
                            </span>

                            <strong>
                                {
                                    carregando
                                        ? "..."
                                        : resumo.clientes
                                }
                            </strong>

                        </div>

                    </article>


                    <article>

                        <div
                            className={styles.summaryIcon}
                        >
                            <FaNewspaper />
                        </div>


                        <div>

                            <span>
                                Newsletter
                            </span>

                            <strong>
                                {
                                    carregando
                                        ? "..."
                                        : resumo.newsletter
                                }
                            </strong>

                        </div>

                    </article>


                    <article>

                        <div
                            className={styles.summaryIcon}
                        >
                            <FiSend />
                        </div>


                        <div>

                            <span>
                                Destinatários deste envio
                            </span>

                            <strong>
                                {quantidadeDestino}
                            </strong>

                        </div>

                    </article>

                </section>


                {/* ========================================= */}
                {/* SMTP */}
                {/* ========================================= */}

                <section
                    className={
                        `${styles.smtp} ${
                            smtp.conectado
                                ? styles.smtpOnline
                                : styles.smtpOffline
                        }`
                    }
                >

                    <div
                        className={styles.smtpStatusIcon}
                    >

                        {
                            smtp.carregando

                                ? (
                                    <FiRefreshCw
                                        className={styles.spin}
                                    />
                                )

                                : smtp.conectado

                                    ? (
                                        <FiCheckCircle />
                                    )

                                    : (
                                        <FiAlertCircle />
                                    )
                        }

                    </div>


                    <div
                        className={styles.smtpInfo}
                    >

                        <strong>

                            {
                                smtp.carregando

                                    ? "Verificando SMTP..."

                                    : smtp.conectado

                                        ? "Servidor de e-mail conectado"

                                        : "Servidor de e-mail desconectado"
                            }

                        </strong>


                        <span>

                            {
                                smtp.erro ||
                                (
                                    smtp.conectado
                                        ? "Tudo pronto para enviar e-mails reais."
                                        : "Confira as configurações SMTP da API."
                                )
                            }

                        </span>

                    </div>


                    {
                        !smtp.carregando &&
                        !smtp.conectado && (

                            <button
                                type="button"
                                onClick={
                                    verificarSmtp
                                }
                            >

                                <FiRefreshCw />

                                Verificar

                            </button>

                        )
                    }

                </section>


                {/* ========================================= */}
                {/* FORM */}
                {/* ========================================= */}

                <form
                    className={styles.workspace}
                    onSubmit={enviarEmail}
                >

                    <section
                        className={styles.composer}
                    >

                        {/* ================================= */}
                        {/* DESTINATÁRIO */}
                        {/* ================================= */}

                        <div
                            className={styles.sectionHeading}
                        >

                            <span>
                                01
                            </span>


                            <div>

                                <small>
                                    DESTINATÁRIOS
                                </small>

                                <h2>
                                    Quem receberá?
                                </h2>

                                <p>
                                    Escolha o público deste envio.
                                </p>

                            </div>

                        </div>


                        <div
                            className={styles.destinationGrid}
                        >

                            {
                                destinos.map(
                                    (item) => (

                                        <button
                                            key={item.valor}
                                            type="button"
                                            className={
                                                form.destino ===
                                                item.valor
                                                    ? styles.destinationActive
                                                    : ""
                                            }
                                            onClick={
                                                () =>
                                                    selecionarDestino(
                                                        item.valor
                                                    )
                                            }
                                        >

                                            <i>
                                                {item.icone}
                                            </i>


                                            <div>

                                                <strong>
                                                    {item.titulo}
                                                </strong>

                                                <span>
                                                    {item.descricao}
                                                </span>

                                            </div>


                                            <b />

                                        </button>

                                    )
                                )
                            }

                        </div>


                        {/* ================================= */}
                        {/* SELECIONAR USUÁRIO */}
                        {/* ================================= */}

                        {
                            form.destino ===
                            "USUARIO" && (

                                <div
                                    className={styles.field}
                                >

                                    <label
                                        htmlFor="usuario-email"
                                    >
                                        Selecione o cliente
                                    </label>


                                    <div
                                        className={styles.selectWrapper}
                                    >

                                        <select
                                            id="usuario-email"
                                            value={
                                                form.usuario_id
                                            }
                                            onChange={
                                                (event) =>
                                                    alterar(
                                                        "usuario_id",
                                                        event.target.value
                                                    )
                                            }
                                            required
                                        >

                                            <option value="">
                                                Selecione um cliente
                                            </option>


                                            {
                                                usuarios.map(
                                                    (usuario) => (

                                                        <option
                                                            key={
                                                                usuario.id
                                                            }
                                                            value={
                                                                usuario.id
                                                            }
                                                        >

                                                            {
                                                                usuario.nome
                                                            }

                                                            {" — "}

                                                            {
                                                                usuario.email
                                                            }

                                                        </option>

                                                    )
                                                )
                                            }

                                        </select>


                                        <FiChevronDown />

                                    </div>


                                    {
                                        usuarioSelecionado && (

                                            <div
                                                className={styles.selectedUser}
                                            >

                                                <FiUser />

                                                <div>

                                                    <strong>
                                                        {
                                                            usuarioSelecionado.nome
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            usuarioSelecionado.email
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    }

                                </div>

                            )
                        }


                        {/* ================================= */}
                        {/* MENSAGEM */}
                        {/* ================================= */}

                        <div
                            className={styles.sectionHeading}
                        >

                            <span>
                                02
                            </span>


                            <div>

                                <small>
                                    CONTEÚDO
                                </small>

                                <h2>
                                    Escreva sua mensagem
                                </h2>

                                <p>
                                    O conteúdo será enviado no
                                    modelo visual da Pixel Color.
                                </p>

                            </div>

                        </div>


                        <div
                            className={styles.field}
                        >

                            <div
                                className={styles.labelRow}
                            >

                                <label
                                    htmlFor="assunto"
                                >
                                    Assunto
                                </label>

                                <span>
                                    {form.assunto.length}/150
                                </span>

                            </div>


                            <input
                                id="assunto"
                                type="text"
                                maxLength={150}
                                value={
                                    form.assunto
                                }
                                onChange={
                                    (event) =>
                                        alterar(
                                            "assunto",
                                            event.target.value
                                        )
                                }
                                placeholder="Ex.: Novidades chegaram à Pixel Color"
                                required
                            />

                        </div>


                        <div
                            className={styles.field}
                        >

                            <div
                                className={styles.labelRow}
                            >

                                <label
                                    htmlFor="mensagem"
                                >
                                    Mensagem
                                </label>

                                <span>
                                    {form.mensagem.length}/5000
                                </span>

                            </div>


                            <textarea
                                id="mensagem"
                                maxLength={5000}
                                value={
                                    form.mensagem
                                }
                                onChange={
                                    (event) =>
                                        alterar(
                                            "mensagem",
                                            event.target.value
                                        )
                                }
                                placeholder="Escreva aqui a mensagem que será enviada..."
                                required
                            />

                        </div>

                    </section>


                    {/* ===================================== */}
                    {/* PREVIEW */}
                    {/* ===================================== */}

                    <aside
                        className={styles.previewColumn}
                    >

                        <div
                            className={styles.previewTop}
                        >

                            <span>
                                PRÉ-VISUALIZAÇÃO
                            </span>


                            <small>
                                {destinoAtual?.titulo}
                            </small>

                        </div>


                        <div
                            className={styles.emailPreview}
                        >

                            <header>

                                <span>
                                    PIXEL COLOR
                                </span>


                                <h2>

                                    {
                                        form.assunto ||
                                        "Assunto do seu e-mail"
                                    }

                                </h2>

                            </header>


                            <div
                                className={styles.previewBody}
                            >

                                <p>

                                    {
                                        form.mensagem ||
                                        "A mensagem aparecerá aqui conforme você digita no formulário."
                                    }

                                </p>


                                <footer>

                                    <strong>
                                        Pixel Color
                                    </strong>

                                    <span>
                                        Transformando ambientes através da cor.
                                    </span>

                                </footer>

                            </div>

                        </div>


                        <div
                            className={styles.sendSummary}
                        >

                            <span>
                                Este e-mail será enviado para
                            </span>

                            <strong>
                                {quantidadeDestino}

                                {" "}

                                destinatário{
                                    quantidadeDestino === 1
                                        ? ""
                                        : "s"
                                }
                            </strong>

                        </div>


                        {
                            feedback && (

                                <div
                                    className={
                                        `${styles.feedback} ${
                                            feedback.tipo ===
                                            "sucesso"

                                                ? styles.success

                                                : feedback.tipo ===
                                                "aviso"

                                                    ? styles.warning

                                                    : styles.error
                                        }`
                                    }
                                >

                                    {
                                        feedback.tipo ===
                                        "sucesso"

                                            ? (
                                                <FiCheckCircle />
                                            )

                                            : (
                                                <FiAlertCircle />
                                            )
                                    }


                                    <div>

                                        <strong>
                                            {feedback.titulo}
                                        </strong>

                                        <span>
                                            {feedback.texto}
                                        </span>

                                    </div>

                                </div>

                            )
                        }


                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={
                                enviando ||
                                carregando ||
                                smtp.carregando ||
                                !smtp.conectado
                            }
                        >

                            <FiSend />

                            {
                                enviando
                                    ? "Enviando..."
                                    : "Enviar e-mail"
                            }

                        </button>

                    </aside>

                </form>

            </main>

        </div>

    );

}