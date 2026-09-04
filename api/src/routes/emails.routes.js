import express from "express";
import nodemailer from "nodemailer";

import db from "../database.js";
import { config } from "../config.js";

import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";


const router =
    express.Router();


// =====================================================
// PROTEGER TODAS AS ROTAS
// SOMENTE ADMIN
// =====================================================

router.use(
    autenticarToken,
    autorizarTipos("admin")
);


// =====================================================
// CRIAR TRANSPORTER
// =====================================================

function criarTransporter() {

    return nodemailer.createTransport({

        host:
            config.email.host,

        port:
            Number(
                config.email.port ||
                587
            ),

        secure:
            Boolean(
                config.email.secure
            ),

        connectionTimeout:
            15000,

        greetingTimeout:
            15000,

        socketTimeout:
            30000,

        auth: {
            user:
                config.email.user,

            pass:
                config.email.password
        }

    });

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(
    texto = ""
) {

    return String(
        texto
    )
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
// TEMPLATE DO E-MAIL
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
                content="width=device-width, initial-scale=1"
            >

            <title>
                ${assuntoSeguro}
            </title>

        </head>


        <body
            style="
                margin: 0;
                padding: 0;
                background: #f4f7fb;
                font-family: Arial, Helvetica, sans-serif;
            "
        >

            <div
                style="
                    width: 100%;
                    padding: 40px 15px;
                    box-sizing: border-box;
                "
            >

                <div
                    style="
                        max-width: 620px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 18px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(15, 35, 65, 0.08);
                    "
                >


                    <!-- ======================================== -->
                    <!-- CABEÇALHO -->
                    <!-- ======================================== -->

                    <div
                        style="
                            background:
                                linear-gradient(
                                    135deg,
                                    #02142f,
                                    #042d66
                                );
                            color: #ffffff;
                            padding: 42px 35px;
                            text-align: center;
                        "
                    >

                        <div
                            style="
                                color: #a9c7f5;
                                font-size: 11px;
                                font-weight: bold;
                                letter-spacing: 4px;
                            "
                        >
                            PIXEL COLOR
                        </div>


                        <h1
                            style="
                                margin: 16px 0 0;
                                font-size: 29px;
                                line-height: 1.3;
                                color: #ffffff;
                            "
                        >
                            ${assuntoSeguro}
                        </h1>

                    </div>


                    <!-- ======================================== -->
                    <!-- CONTEÚDO -->
                    <!-- ======================================== -->

                    <div
                        style="
                            padding: 42px;
                            color: #334155;
                            line-height: 1.8;
                            font-size: 15px;
                        "
                    >

                        <div>
                            ${mensagemSegura}
                        </div>


                        <!-- ==================================== -->
                        <!-- RODAPÉ -->
                        <!-- ==================================== -->

                        <div
                            style="
                                margin-top: 38px;
                                padding-top: 22px;
                                border-top: 1px solid #e7edf5;
                                color: #64748b;
                                font-size: 12px;
                            "
                        >

                            <strong
                                style="
                                    color: #0f2f5c;
                                "
                            >
                                Pixel Color
                            </strong>

                            <br>

                            Transformando ambientes através das cores.

                        </div>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `;

}


// =====================================================
// STATUS SMTP
//
// GET /api/admin/emails/status
// =====================================================

router.get(
    "/status",
    async (_req, res) => {

        try {

            // =================================================
            // VERIFICAR CONFIGURAÇÃO
            // =================================================

            const configurado =
                Boolean(
                    config.email.host
                ) &&
                Boolean(
                    config.email.user
                ) &&
                Boolean(
                    config.email.password
                );


            if (
                !configurado
            ) {

                return res
                    .status(200)
                    .json({

                        configurado:
                            false,

                        conectado:
                            false,

                        erro:
                            "Preencha EMAIL_USER e EMAIL_PASSWORD no arquivo .env."

                    });

            }


            // =================================================
            // TESTAR SMTP
            // =================================================

            const transporter =
                criarTransporter();


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
                        "Servidor SMTP conectado com sucesso."

                });


        } catch (error) {

            console.error(
                "❌ Erro ao verificar SMTP:",
                error
            );


            return res
                .status(200)
                .json({

                    configurado:
                        true,

                    conectado:
                        false,

                    erro:
                        error.message

                });

        }

    }
);


// =====================================================
// LISTAR DESTINATÁRIOS
//
// GET /api/admin/emails/destinatarios
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
                        tipo = 'cliente'
                        AND email IS NOT NULL
                        AND TRIM(email) <> ''

                    ORDER BY
                        nome ASC,
                        email ASC
                    `
                );


            return res
                .status(200)
                .json(
                    usuarios
                );


        } catch (error) {

            console.error(
                "Erro ao listar destinatários:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível carregar os destinatários.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// ENVIAR E-MAIL
//
// POST /api/admin/emails/enviar
// =====================================================

router.post(
    "/enviar",
    async (req, res) => {

        try {

            const {
                destino,
                email,
                assunto,
                mensagem
            } = req.body;


            // =================================================
            // NORMALIZAR
            // =================================================

            const assuntoNormalizado =
                String(
                    assunto ||
                    ""
                )
                    .trim();


            const mensagemNormalizada =
                String(
                    mensagem ||
                    ""
                )
                    .trim();


            // =================================================
            // VERIFICAR SMTP
            // =================================================

            if (
                !config.email.host ||
                !config.email.user ||
                !config.email.password
            ) {

                return res
                    .status(503)
                    .json({

                        erro:
                            "O serviço de e-mail não está configurado.",

                        detalhe:
                            "Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASSWORD no arquivo .env."

                    });

            }


            // =================================================
            // VALIDAR ASSUNTO
            // =================================================

            if (
                !assuntoNormalizado
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe o assunto do e-mail."

                    });

            }


            if (
                assuntoNormalizado.length >
                150
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O assunto pode ter no máximo 150 caracteres."

                    });

            }


            // =================================================
            // IMPEDIR HEADER INJECTION
            // =================================================

            if (
                /[\r\n]/.test(
                    assuntoNormalizado
                )
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O assunto informado é inválido."

                    });

            }


            // =================================================
            // VALIDAR MENSAGEM
            // =================================================

            if (
                !mensagemNormalizada
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe a mensagem do e-mail."

                    });

            }


            if (
                mensagemNormalizada.length >
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
            // VALIDAR DESTINO
            // =================================================

            const destinosValidos = [
                "USUARIOS",
                "NEWSLETTER",
                "ESPECIFICO"
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
                            "Destino inválido."

                    });

            }


            // =================================================
            // BUSCAR DESTINATÁRIOS
            // =================================================

            let destinatarios =
                [];


            // =================================================
            // TODOS OS CLIENTES
            // =================================================

            if (
                destino ===
                "USUARIOS"
            ) {

                const [usuarios] =
                    await db.query(
                        `
                        SELECT DISTINCT
                            email

                        FROM usuarios

                        WHERE
                            tipo = 'cliente'
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
            // NEWSLETTER
            // =================================================

            if (
                destino ===
                "NEWSLETTER"
            ) {

                const [newsletter] =
                    await db.query(
                        `
                        SELECT DISTINCT
                            email

                        FROM newsletter_inscritos

                        WHERE
                            email IS NOT NULL
                            AND TRIM(email) <> ''
                            AND ativo = 1
                        `
                    );


                destinatarios =
                    newsletter.map(
                        (item) =>
                            item.email
                    );

            }


            // =================================================
            // DESTINATÁRIO ESPECÍFICO
            // =================================================

            if (
                destino ===
                "ESPECIFICO"
            ) {

                const emailNormalizado =
                    String(
                        email ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const regexEmail =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !regexEmail.test(
                        emailNormalizado
                    )
                ) {

                    return res
                        .status(400)
                        .json({

                            erro:
                                "Informe um e-mail válido."

                        });

                }


                destinatarios = [
                    emailNormalizado
                ];

            }


            // =================================================
            // NORMALIZAR E REMOVER DUPLICADOS
            // =================================================

            destinatarios = [
                ...new Set(
                    destinatarios

                        .filter(
                            Boolean
                        )

                        .map(
                            (item) =>
                                String(
                                    item
                                )
                                    .trim()
                                    .toLowerCase()
                        )

                        .filter(
                            Boolean
                        )
                )
            ];


            // =================================================
            // SEM DESTINATÁRIOS
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
            // CRIAR TRANSPORTER
            // =================================================

            const transporter =
                criarTransporter();


            // =================================================
            // TESTAR CONEXÃO
            // =================================================

            console.log(
                "Testando conexão SMTP..."
            );


            await transporter.verify();


            console.log(
                "✅ SMTP conectado."
            );


            // =================================================
            // PREPARAR HTML
            // =================================================

            const html =
                montarEmail({

                    assunto:
                        assuntoNormalizado,

                    mensagem:
                        mensagemNormalizada

                });


            // =================================================
            // CONTADORES
            // =================================================

            let enviados =
                0;

            let erros =
                0;

            const detalhesErros =
                [];


            // =================================================
            // ENVIAR INDIVIDUALMENTE
            // =================================================

            for (
                const destinatario
                of destinatarios
            ) {

                try {

                    const info =
                        await transporter.sendMail({

                            from:
                                config.email.from ||
                                `Pixel Color <${config.email.user}>`,

                            to:
                                destinatario,

                            subject:
                                assuntoNormalizado,

                            text:
                                mensagemNormalizada,

                            html

                        });


                    enviados +=
                        1;


                    console.log(
                        `✅ E-mail enviado para: ${destinatario}`
                    );


                    console.log(
                        "Message ID:",
                        info.messageId
                    );


                } catch (error) {

                    erros +=
                        1;


                    console.error(
                        `❌ Erro ao enviar para ${destinatario}:`,
                        error.message
                    );


                    detalhesErros.push({

                        email:
                            destinatario,

                        erro:
                            error.message

                    });

                }

            }


            // =================================================
            // TODOS FALHARAM
            // =================================================

            if (
                enviados ===
                0
            ) {

                return res
                    .status(500)
                    .json({

                        erro:
                            "Nenhum e-mail conseguiu ser enviado.",

                        detalhe:
                            detalhesErros[0]?.erro ||
                            "Falha no servidor SMTP.",

                        enviados,

                        erros,

                        total:
                            destinatarios.length,

                        detalhesErros

                    });

            }


            // =================================================
            // RESPOSTA
            // =================================================

            return res
                .status(200)
                .json({

                    mensagem:
                        erros > 0
                            ? `Envio concluído com ${erros} falha${erros === 1 ? "" : "s"}.`
                            : "E-mails enviados com sucesso!",

                    enviados,

                    erros,

                    total:
                        destinatarios.length,

                    detalhesErros

                });


        } catch (error) {

            console.error(
                "========================================"
            );

            console.error(
                "ERRO AO ENVIAR E-MAIL:"
            );

            console.error(
                error
            );

            console.error(
                "========================================"
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível enviar o e-mail.",

                    detalhe:
                        error.message

                });

        }

    }
);


export default router;