import express from "express";
import nodemailer from "nodemailer";

import db from "../database.js";
import { config } from "../config.js";

import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";


const router = express.Router();


// =====================================================
// SOMENTE ADMIN
// =====================================================

router.use(
    autenticarToken,
    autorizarTipos("admin")
);


// =====================================================
// CRIAR TRANSPORTER SMTP
// =====================================================

function criarTransporter() {

    const host =
        String(
            config.email?.host ||
            "smtp.gmail.com"
        ).trim();


    const port =
        Number(
            config.email?.port ||
            587
        );


    const secure =
        config.email?.secure === true ||
        String(
            config.email?.secure
        )
            .trim()
            .toLowerCase() === "true";


    const usuario =
        String(
            config.email?.user ||
            ""
        ).trim();


    const senha =
        String(
            config.email?.password ||
            ""
        )
            .replace(/\s/g, "")
            .trim();


    console.log(
        "=========================================="
    );

    console.log(
        "CONFIGURAÇÃO SMTP"
    );

    console.log(
        "Host:",
        host
    );

    console.log(
        "Porta:",
        port
    );

    console.log(
        "Secure:",
        secure
    );

    console.log(
        "Usuário:",
        usuario
    );

    console.log(
        "Senha configurada:",
        Boolean(senha)
    );

    console.log(
        "=========================================="
    );


    return nodemailer.createTransport({

        host,

        port,

        secure,

        // Porta 587 utiliza STARTTLS
        requireTLS:
            port === 587,

        auth: {

            user:
                usuario,

            pass:
                senha

        },

        // =================================================
        // TEMPOS MAIORES PARA EVITAR ETIMEDOUT
        // =================================================

        connectionTimeout:
            60000,

        greetingTimeout:
            60000,

        socketTimeout:
            120000,

        dnsTimeout:
            30000

    });

}


// =====================================================
// SMTP CONFIGURADO?
// =====================================================

function smtpConfigurado() {

    return (
        Boolean(
            config.email?.host
        ) &&
        Boolean(
            config.email?.user
        ) &&
        Boolean(
            config.email?.password
        )
    );

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(texto = "") {

    return String(texto)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// TEMPLATE DO EMAIL
// =====================================================

function montarEmail({
    assunto,
    mensagem
}) {

    const assuntoSeguro =
        escaparHtml(
            assunto
        );


    const mensagemSegura =
        escaparHtml(
            mensagem
        )
            .replaceAll(
                "\n",
                "<br>"
            );


    return `
        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                ${assuntoSeguro}
            </title>

        </head>


        <body
            style="
                margin: 0;
                padding: 0;
                background: #f4f1e9;
                font-family: Arial, Helvetica, sans-serif;
            "
        >

            <div
                style="
                    width: 100%;
                    padding: 45px 15px;
                    box-sizing: border-box;
                "
            >

                <div
                    style="
                        max-width: 620px;
                        margin: 0 auto;
                        overflow: hidden;
                        background: #ffffff;

                        border:
                            1px solid
                            rgba(
                                23,
                                32,
                                51,
                                0.12
                            );
                    "
                >

                    <!-- ===================================== -->
                    <!-- CABEÇALHO -->
                    <!-- ===================================== -->

                    <div
                        style="
                            padding: 42px 35px;
                            text-align: center;
                            color: #ffffff;

                            background:
                                linear-gradient(
                                    135deg,
                                    #172033,
                                    #21304d
                                );
                        "
                    >

                        <div
                            style="
                                color: #a9c2f3;
                                font-size: 11px;
                                font-weight: 700;
                                letter-spacing: 4px;
                            "
                        >
                            PIXEL COLOR
                        </div>


                        <h1
                            style="
                                margin: 15px 0 0;
                                color: #ffffff;
                                font-size: 28px;
                                line-height: 1.3;
                            "
                        >

                            ${assuntoSeguro}

                        </h1>

                    </div>


                    <!-- ===================================== -->
                    <!-- MENSAGEM -->
                    <!-- ===================================== -->

                    <div
                        style="
                            padding: 42px;
                            color: #334155;
                            font-size: 15px;
                            line-height: 1.8;
                        "
                    >

                        <div>

                            ${mensagemSegura}

                        </div>


                        <!-- ================================= -->
                        <!-- RODAPÉ -->
                        <!-- ================================= -->

                        <div
                            style="
                                margin-top: 38px;
                                padding-top: 22px;

                                border-top:
                                    1px solid
                                    #e6ebf1;

                                color: #768397;
                                font-size: 12px;
                            "
                        >

                            <strong
                                style="
                                    color: #3264c8;
                                "
                            >
                                Pixel Color
                            </strong>

                            <br>

                            Transformando ambientes através da cor.

                        </div>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `;

}


// =====================================================
// STATUS DO SMTP
//
// GET /admin/emails/status
// =====================================================

router.get(
    "/status",
    async (_req, res) => {

        try {

            // =================================================
            // VERIFICAR CONFIGURAÇÃO
            // =================================================

            if (
                !smtpConfigurado()
            ) {

                return res
                    .status(200)
                    .json({

                        configurado:
                            false,

                        conectado:
                            false,

                        erro:
                            "O servidor SMTP não está configurado."

                    });

            }


            // =================================================
            // CRIAR TRANSPORTER
            // =================================================

            const transporter =
                criarTransporter();


            console.log(
                "Testando conexão SMTP..."
            );


            // Aqui o verify continua.
            // Essa rota existe especificamente para testar SMTP.
            await transporter.verify();


            console.log(
                "✅ SMTP conectado com sucesso."
            );


            return res
                .status(200)
                .json({

                    configurado:
                        true,

                    conectado:
                        true,

                    email:
                        config.email.user,

                    mensagem:
                        "SMTP conectado."

                });


        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "❌ ERRO SMTP"
            );

            console.error(
                "Mensagem:",
                error.message
            );

            console.error(
                "Código:",
                error.code
            );

            console.error(
                "Resposta SMTP:",
                error.response
            );

            console.error(
                "Response Code:",
                error.responseCode
            );

            console.error(
                "Comando:",
                error.command
            );

            console.error(
                "=========================================="
            );


            return res
                .status(200)
                .json({

                    configurado:
                        true,

                    conectado:
                        false,

                    erro:
                        error.message,

                    codigo:
                        error.code ||
                        null,

                    resposta_smtp:
                        error.response ||
                        null,

                    response_code:
                        error.responseCode ||
                        null,

                    comando:
                        error.command ||
                        null

                });

        }

    }
);


// =====================================================
// LISTAR DESTINATÁRIOS
//
// GET /admin/emails/destinatarios
// =====================================================

router.get(
    "/destinatarios",
    async (_req, res) => {

        try {

            const [usuarios] =
                await db.query(
                    `
                    SELECT
                        id,
                        nome,
                        email

                    FROM usuarios

                    WHERE
                        LOWER(tipo) = 'cliente'

                        AND email IS NOT NULL

                        AND TRIM(email) <> ''

                    ORDER BY
                        nome ASC
                    `
                );


            return res
                .status(200)
                .json(
                    usuarios
                );


        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "❌ ERRO AO BUSCAR DESTINATÁRIOS"
            );

            console.error(
                error
            );

            console.error(
                "=========================================="
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível carregar os clientes.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// RESUMO
//
// GET /admin/emails/resumo
// =====================================================

router.get(
    "/resumo",
    async (_req, res) => {

        try {

            // =================================================
            // CLIENTES
            // =================================================

            const [[clientes]] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total

                    FROM usuarios

                    WHERE
                        LOWER(tipo) = 'cliente'

                        AND email IS NOT NULL

                        AND TRIM(email) <> ''
                    `
                );


            // =================================================
            // NEWSLETTER
            // =================================================

            const [[newsletter]] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total

                    FROM newsletter_inscritos

                    WHERE
                        ativo = 1

                        AND email IS NOT NULL

                        AND TRIM(email) <> ''
                    `
                );


            // =================================================
            // RETORNO
            // =================================================

            return res
                .status(200)
                .json({

                    clientes:
                        Number(
                            clientes?.total ||
                            0
                        ),

                    newsletter:
                        Number(
                            newsletter?.total ||
                            0
                        )

                });


        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "❌ ERRO AO CARREGAR RESUMO"
            );

            console.error(
                error
            );

            console.error(
                "=========================================="
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível carregar os dados.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// ENVIAR EMAIL
//
// POST /admin/emails/enviar
// =====================================================

router.post(
    "/enviar",
    async (req, res) => {

        try {

            // =================================================
            // BODY
            // =================================================

            const destino =
                String(
                    req.body?.destino ||
                    ""
                )
                    .trim()
                    .toUpperCase();


            const usuarioId =
                Number(
                    req.body?.usuario_id
                );


            const assunto =
                String(
                    req.body?.assunto ||
                    ""
                )
                    .trim();


            const mensagem =
                String(
                    req.body?.mensagem ||
                    ""
                )
                    .trim();


            console.log(
                "=========================================="
            );

            console.log(
                "SOLICITAÇÃO DE ENVIO DE EMAIL"
            );

            console.log(
                "Destino:",
                destino
            );

            console.log(
                "Usuário ID:",
                usuarioId
            );

            console.log(
                "Assunto:",
                assunto
            );

            console.log(
                "=========================================="
            );


            // =================================================
            // SMTP
            // =================================================

            if (
                !smtpConfigurado()
            ) {

                return res
                    .status(503)
                    .json({

                        erro:
                            "O servidor de e-mail não está configurado."

                    });

            }


            // =================================================
            // ASSUNTO
            // =================================================

            if (!assunto) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe o assunto."

                    });

            }


            if (
                assunto.length >
                150
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O assunto pode ter no máximo 150 caracteres."

                    });

            }


            // Evitar header injection
            if (
                /[\r\n]/.test(
                    assunto
                )
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Assunto inválido."

                    });

            }


            // =================================================
            // MENSAGEM
            // =================================================

            if (!mensagem) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe a mensagem."

                    });

            }


            if (
                mensagem.length >
                5000
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "A mensagem pode ter no máximo 5000 caracteres."

                    });

            }


            // =================================================
            // DESTINO
            // =================================================

            const destinosValidos = [

                "USUARIO",
                "NEWSLETTER",
                "TODOS"

            ];


            if (
                !destinosValidos.includes(
                    destino
                )
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Tipo de destinatário inválido."

                    });

            }


            let destinatarios =
                [];


            // =================================================
            // USUÁRIO ÚNICO
            // =================================================

            if (
                destino ===
                "USUARIO"
            ) {

                if (
                    !Number.isInteger(
                        usuarioId
                    ) ||
                    usuarioId <= 0
                ) {

                    return res
                        .status(400)
                        .json({

                            erro:
                                "Selecione um usuário."

                        });

                }


                const [usuarios] =
                    await db.query(
                        `
                        SELECT
                            id,
                            nome,
                            email

                        FROM usuarios

                        WHERE
                            id = ?

                            AND LOWER(tipo) = 'cliente'

                            AND email IS NOT NULL

                            AND TRIM(email) <> ''

                        LIMIT 1
                        `,
                        [
                            usuarioId
                        ]
                    );


                if (
                    usuarios.length ===
                    0
                ) {

                    return res
                        .status(404)
                        .json({

                            erro:
                                "Usuário não encontrado ou sem e-mail."

                        });

                }


                destinatarios = [

                    usuarios[0].email

                ];

            }


            // =================================================
            // NEWSLETTER
            // =================================================

            if (
                destino ===
                "NEWSLETTER"
            ) {

                const [inscritos] =
                    await db.query(
                        `
                        SELECT DISTINCT
                            email

                        FROM newsletter_inscritos

                        WHERE
                            ativo = 1

                            AND email IS NOT NULL

                            AND TRIM(email) <> ''
                        `
                    );


                destinatarios =
                    inscritos.map(
                        (item) =>
                            item.email
                    );

            }


            // =================================================
            // TODOS OS CLIENTES
            // =================================================

            if (
                destino ===
                "TODOS"
            ) {

                const [usuarios] =
                    await db.query(
                        `
                        SELECT DISTINCT
                            email

                        FROM usuarios

                        WHERE
                            LOWER(tipo) = 'cliente'

                            AND email IS NOT NULL

                            AND TRIM(email) <> ''
                        `
                    );


                destinatarios =
                    usuarios.map(
                        (usuario) =>
                            usuario.email
                    );

            }


            // =================================================
            // NORMALIZAR DESTINATÁRIOS
            // =================================================

            destinatarios = [

                ...new Set(

                    destinatarios

                        .filter(
                            Boolean
                        )

                        .map(
                            (email) =>
                                String(email)
                                    .trim()
                                    .toLowerCase()
                        )

                )

            ];


            console.log(
                "Destinatários encontrados:",
                destinatarios.length
            );


            // =================================================
            // NENHUM DESTINATÁRIO
            // =================================================

            if (
                destinatarios.length ===
                0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Nenhum destinatário foi encontrado."

                    });

            }


            // =================================================
            // TRANSPORTER
            // =================================================

            const transporter =
                criarTransporter();


            console.log(
                "Preparando envio SMTP..."
            );


            /*
             * IMPORTANTE:
             *
             * NÃO usamos transporter.verify() aqui.
             *
             * O /status já é responsável por testar a conexão.
             *
             * Antes o sistema fazia:
             *
             * verify()
             * +
             * sendMail()
             *
             * criando duas conexões seguidas com o Gmail.
             *
             * O seu erro ETIMEDOUT ocorreu na segunda conexão.
             */


            // =================================================
            // HTML
            // =================================================

            const html =
                montarEmail({

                    assunto,
                    mensagem

                });


            // =================================================
            // REMETENTE
            // =================================================

            const remetente =
                String(
                    config.email?.from ||
                    `Pixel Color <${config.email.user}>`
                ).trim();


            // =================================================
            // USUÁRIO ÚNICO
            // =================================================

            if (
                destino ===
                "USUARIO"
            ) {

                console.log(
                    "Enviando e-mail para:",
                    destinatarios[0]
                );


                const info =
                    await transporter.sendMail({

                        from:
                            remetente,

                        to:
                            destinatarios[0],

                        subject:
                            assunto,

                        text:
                            mensagem,

                        html

                    });


                console.log(
                    "=========================================="
                );

                console.log(
                    "✅ EMAIL ENVIADO COM SUCESSO"
                );

                console.log(
                    "Destinatário:",
                    destinatarios[0]
                );

                console.log(
                    "Message ID:",
                    info.messageId
                );

                console.log(
                    "Aceitos:",
                    info.accepted
                );

                console.log(
                    "Rejeitados:",
                    info.rejected
                );

                console.log(
                    "=========================================="
                );


                return res
                    .status(200)
                    .json({

                        mensagem:
                            "E-mail enviado com sucesso!",

                        messageId:
                            info.messageId,

                        enviados:
                            1,

                        erros:
                            0,

                        total:
                            1

                    });

            }


            // =================================================
            // NEWSLETTER / TODOS
            //
            // BCC = os destinatários não enxergam
            // os e-mails uns dos outros.
            // =================================================

            console.log(
                `Iniciando disparo para ${destinatarios.length} destinatário(s)...`
            );


            const info =
                await transporter.sendMail({

                    from:
                        remetente,

                    to:
                        config.email.user,

                    bcc:
                        destinatarios,

                    subject:
                        assunto,

                    text:
                        mensagem,

                    html

                });


            // =================================================
            // RESULTADO
            // =================================================

            const rejeitadosLista =
                Array.isArray(
                    info.rejected
                )
                    ? info.rejected
                    : [];


            const aceitosLista =
                Array.isArray(
                    info.accepted
                )
                    ? info.accepted
                    : [];


            const rejeitados =
                rejeitadosLista.length;


            const enviados =
                Math.max(
                    0,

                    destinatarios.length -
                    rejeitados
                );


            console.log(
                "=========================================="
            );

            console.log(
                "✅ DISPARO FINALIZADO"
            );

            console.log(
                "Total:",
                destinatarios.length
            );

            console.log(
                "Enviados:",
                enviados
            );

            console.log(
                "Aceitos pelo SMTP:",
                aceitosLista.length
            );

            console.log(
                "Rejeitados:",
                rejeitados
            );

            console.log(
                "Message ID:",
                info.messageId
            );

            console.log(
                "=========================================="
            );


            return res
                .status(200)
                .json({

                    mensagem:
                        rejeitados > 0
                            ? "Envio concluído com algumas falhas."
                            : "E-mails enviados com sucesso!",

                    messageId:
                        info.messageId,

                    enviados,

                    erros:
                        rejeitados,

                    total:
                        destinatarios.length

                });


        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "❌ ERRO AO ENVIAR EMAIL"
            );

            console.error(
                "Mensagem:",
                error.message
            );

            console.error(
                "Código:",
                error.code
            );

            console.error(
                "Resposta SMTP:",
                error.response
            );

            console.error(
                "Response Code:",
                error.responseCode
            );

            console.error(
                "Comando:",
                error.command
            );

            console.error(
                "Stack:",
                error.stack
            );

            console.error(
                "=========================================="
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível enviar o e-mail.",

                    detalhe:
                        error.message,

                    codigo:
                        error.code ||
                        null,

                    resposta_smtp:
                        error.response ||
                        null,

                    response_code:
                        error.responseCode ||
                        null,

                    comando:
                        error.command ||
                        null

                });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

export default router;