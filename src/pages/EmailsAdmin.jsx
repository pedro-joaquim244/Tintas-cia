import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FaCheckCircle,
    FaEnvelope,
    FaExclamationTriangle,
    FaNewspaper,
    FaPaperPlane,
    FaSync,
    FaUser,
    FaUsers
} from "react-icons/fa";

import { api } from "../services/api";

import style from "../styles/pages/EmailsAdmin.module.css";;

const rotaEmailsAdmin = "/api/admin/emails";


const destinos = [

    {
        valor:
            "USUARIOS",

        titulo:
            "Todos os clientes",

        descricao:
            "Clientes cadastrados na Pixel Color",

        icone:
            <FaUsers />
    },

    {
        valor:
            "NEWSLETTER",

        titulo:
            "Newsletter",

        descricao:
            "Assinantes ativos da newsletter",

        icone:
            <FaNewspaper />
    },

    {
        valor:
            "ESPECIFICO",

        titulo:
            "Destinatário único",

        descricao:
            "Enviar para um endereço específico",

        icone:
            <FaUser />
    }

];


export default function AdminEmails() {

    // =====================================================
    // FORMULÁRIO
    // =====================================================

    const [
        form,
        setForm
    ] = useState({

        destino:
            "USUARIOS",

        email:
            "",

        assunto:
            "",

        mensagem:
            ""

    });


    // =====================================================
    // ESTADOS
    // =====================================================

    const [
        enviando,
        setEnviando
    ] = useState(false);


    const [
        feedback,
        setFeedback
    ] = useState(null);


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


    // =====================================================
    // INFORMAÇÕES
    // =====================================================

    const caracteres =
        form.mensagem.length;


    const destinoAtual =
        useMemo(
            () =>
                destinos.find(
                    (item) =>
                        item.valor ===
                        form.destino
                ),

            [
                form.destino
            ]
        );


    // =====================================================
    // VERIFICAR SMTP
    // =====================================================

    async function verificarSmtp() {

        setSmtp(
            (atual) => ({
                ...atual,
                carregando:
                    true
            })
        );


        try {

            const {
                data
            } =
                await api.get(
                    `${rotaEmailsAdmin}/status`
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
                "Erro ao verificar SMTP:",
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
                    "Não foi possível consultar o SMTP."

            });

        }

    }


    // =====================================================
    // CARREGAR STATUS
    // =====================================================

    useEffect(
        () => {

            verificarSmtp();

        },
        []
    );


    // =====================================================
    // ALTERAR CAMPO
    // =====================================================

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


    // =====================================================
    // ALTERAR DESTINO
    // =====================================================

    function alterarDestino(
        destino
    ) {

        setForm(
            (atual) => ({

                ...atual,

                destino,

                email:
                    destino ===
                    "ESPECIFICO"
                        ? atual.email
                        : ""

            })
        );


        setFeedback(
            null
        );

    }


    // =====================================================
    // ENVIAR
    // =====================================================

    async function enviar(
        event
    ) {

        event.preventDefault();


        // =================================================
        // SMTP
        // =================================================

        if (
            !smtp.conectado
        ) {

            setFeedback({

                tipo:
                    "erro",

                texto:
                    "O servidor de e-mail ainda não está conectado.",

                detalhe:
                    "Verifique o arquivo .env e clique em Verificar conexão."

            });


            return;

        }


        // =================================================
        // VALIDAR ESPECÍFICO
        // =================================================

        if (
            form.destino ===
                "ESPECIFICO" &&
            !form.email.trim()
        ) {

            setFeedback({

                tipo:
                    "erro",

                texto:
                    "Informe o e-mail do destinatário."

            });


            return;

        }


        // =================================================
        // VALIDAR TEXTO
        // =================================================

        if (
            !form.assunto.trim() ||
            !form.mensagem.trim()
        ) {

            setFeedback({

                tipo:
                    "erro",

                texto:
                    "Preencha o assunto e a mensagem."

            });


            return;

        }


        setEnviando(
            true
        );


        setFeedback(
            null
        );


        try {

            const {
                data
            } =
                await api.post(
                    `${rotaEmailsAdmin}/enviar`,
                    {

                        destino:
                            form.destino,

                        email:
                            form.email.trim(),

                        assunto:
                            form.assunto.trim(),

                        mensagem:
                            form.mensagem.trim()

                    }
                );


            const enviados =
                Number(
                    data.enviados ||
                    0
                );


            const erros =
                Number(
                    data.erros ||
                    0
                );


            setFeedback({

                tipo:
                    erros > 0
                        ? "aviso"
                        : "sucesso",

                texto:
                    data.mensagem ||
                    "E-mail enviado com sucesso.",

                detalhe:
                    `${enviados} enviado${enviados === 1 ? "" : "s"} · ${erros} falha${erros === 1 ? "" : "s"}`

            });


            // =================================================
            // LIMPAR MENSAGEM
            // =================================================

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
                "Erro ao enviar e-mails:",
                error
            );


            setFeedback({

                tipo:
                    "erro",

                texto:
                    error.response?.data?.erro ||
                    "Não foi possível enviar os e-mails.",

                detalhe:
                    error.response?.data?.detalhe ||
                    ""

            });


        } finally {

            setEnviando(
                false
            );

        }

    }


    // =====================================================
    // JSX
    // =====================================================

    return (

        <main
            className="
                adminPage
                emailAdminPage
            "
        >

            {/* ============================================= */}
            {/* TÍTULO */}
            {/* ============================================= */}

            <div
                className="
                    adminTitle
                    emailAdminTitle
                "
            >

                <div>

                    <span>
                        COMUNICAÇÃO
                    </span>

                    <h1>
                        Central de e-mails
                    </h1>

                    <p>
                        Crie mensagens e envie novidades
                        para os clientes da Pixel Color.
                    </p>

                </div>


                <i>
                    <FaEnvelope />
                </i>

            </div>


            {/* ============================================= */}
            {/* FORMULÁRIO */}
            {/* ============================================= */}

            <form
                className="emailAdminLayout"
                onSubmit={enviar}
            >

                <section
                    className="emailComposer"
                >

                    {/* ===================================== */}
                    {/* DESTINATÁRIOS */}
                    {/* ===================================== */}

                    <header>

                        <span>
                            01
                        </span>

                        <div>

                            <h2>
                                Escolha os destinatários
                            </h2>

                            <p>
                                Defina quem receberá esta comunicação.
                            </p>

                        </div>

                    </header>


                    <div
                        className="emailDestinations"
                    >

                        {
                            destinos.map(
                                (item) => (

                                    <button
                                        type="button"
                                        key={item.valor}
                                        className={
                                            form.destino ===
                                            item.valor
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={
                                            () =>
                                                alterarDestino(
                                                    item.valor
                                                )
                                        }
                                    >

                                        <i>
                                            {item.icone}
                                        </i>


                                        <span>

                                            <strong>
                                                {item.titulo}
                                            </strong>

                                            <small>
                                                {item.descricao}
                                            </small>

                                        </span>

                                    </button>

                                )
                            )
                        }

                    </div>


                    {/* ===================================== */}
                    {/* EMAIL ESPECÍFICO */}
                    {/* ===================================== */}

                    {
                        form.destino ===
                        "ESPECIFICO" && (

                            <label
                                className="emailField"
                            >

                                E-mail do destinatário

                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={
                                        (event) =>
                                            alterar(
                                                "email",
                                                event.target.value
                                            )
                                    }
                                    placeholder="cliente@email.com"
                                />

                            </label>

                        )
                    }


                    {/* ===================================== */}
                    {/* MENSAGEM */}
                    {/* ===================================== */}

                    <header>

                        <span>
                            02
                        </span>

                        <div>

                            <h2>
                                Escreva sua mensagem
                            </h2>

                            <p>
                                O conteúdo será aplicado ao
                                modelo visual da Pixel Color.
                            </p>

                        </div>

                    </header>


                    <div
                        className="emailFields"
                    >

                        <label
                            className="emailField"
                        >

                            Assunto

                            <input
                                required
                                type="text"
                                maxLength={150}
                                value={form.assunto}
                                onChange={
                                    (event) =>
                                        alterar(
                                            "assunto",
                                            event.target.value
                                        )
                                }
                                placeholder="Ex.: Novidades chegaram à Pixel Color"
                            />

                        </label>


                        <label
                            className="emailField"
                        >

                            Mensagem

                            <textarea
                                required
                                maxLength={5000}
                                value={form.mensagem}
                                onChange={
                                    (event) =>
                                        alterar(
                                            "mensagem",
                                            event.target.value
                                        )
                                }
                                placeholder="Escreva a mensagem que seus clientes receberão..."
                            />

                            <small>
                                {caracteres}/5000 caracteres
                            </small>

                        </label>

                    </div>

                </section>


                {/* ========================================= */}
                {/* COLUNA DIREITA */}
                {/* ========================================= */}

                <aside
                    className="emailPreviewColumn"
                >

                    {/* ===================================== */}
                    {/* SMTP */}
                    {/* ===================================== */}

                    <div
                        className={
                            `smtpStatus ${
                                smtp.conectado
                                    ? "online"
                                    : "offline"
                            }`
                        }
                    >

                        {
                            smtp.carregando

                                ? (
                                    <FaSync
                                        className="spin"
                                    />
                                )

                                : smtp.conectado

                                    ? (
                                        <FaCheckCircle />
                                    )

                                    : (
                                        <FaExclamationTriangle />
                                    )
                        }


                        <span>

                            <strong>

                                {
                                    smtp.carregando

                                        ? "Verificando servidor..."

                                        : smtp.conectado

                                            ? "SMTP conectado"

                                            : smtp.configurado

                                                ? "Falha na autenticação SMTP"

                                                : "SMTP não configurado"
                                }

                            </strong>


                            <small>

                                {
                                    smtp.erro ||
                                    (
                                        smtp.conectado

                                            ? "Pronto para enviar e-mails reais."

                                            : "Verifique as configurações do arquivo .env."
                                    )
                                }

                            </small>

                        </span>


                        {
                            !smtp.carregando &&
                            !smtp.conectado && (

                                <button
                                    type="button"
                                    onClick={
                                        verificarSmtp
                                    }
                                >
                                    Verificar conexão
                                </button>

                            )
                        }

                    </div>


                    {/* ===================================== */}
                    {/* PREVIEW LABEL */}
                    {/* ===================================== */}

                    <div
                        className="emailPreviewLabel"
                    >

                        <span>
                            PRÉ-VISUALIZAÇÃO
                        </span>

                        <small>
                            {destinoAtual?.titulo}
                        </small>

                    </div>


                    {/* ===================================== */}
                    {/* PREVIEW */}
                    {/* ===================================== */}

                    <div
                        className="emailPreview"
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


                        <div>

                            <p>

                                {
                                    form.mensagem ||
                                    "A mensagem aparecerá aqui conforme você escreve no formulário."
                                }

                            </p>


                            <footer>

                                Pixel Color

                                <br />

                                <small>
                                    Transformando ambientes através das cores.
                                </small>

                            </footer>

                        </div>

                    </div>


                    {/* ===================================== */}
                    {/* FEEDBACK */}
                    {/* ===================================== */}

                    {
                        feedback && (

                            <div
                                className={
                                    `emailFeedback ${feedback.tipo}`
                                }
                            >

                                <strong>
                                    {feedback.texto}
                                </strong>


                                {
                                    feedback.detalhe && (

                                        <small>
                                            {feedback.detalhe}
                                        </small>

                                    )
                                }

                            </div>

                        )
                    }


                    {/* ===================================== */}
                    {/* BOTÃO */}
                    {/* ===================================== */}

                    <button
                        type="submit"
                        className="emailSendButton"
                        disabled={
                            enviando ||
                            !smtp.conectado
                        }
                    >

                        <FaPaperPlane />

                        {
                            enviando
                                ? "Enviando..."
                                : "Enviar e-mail"
                        }

                    </button>


                    <p
                        className="emailConfigNote"
                    >
                        O envio utiliza as configurações SMTP
                        da API Pixel Color.
                    </p>

                </aside>

            </form>

        </main>

    );

}
