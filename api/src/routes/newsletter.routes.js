import express from "express";
import nodemailer from "nodemailer";

import db from "../database.js";
import { config } from "../config.js";

const router = express.Router();


// =====================================================
// CRIAR TRANSPORTER
// =====================================================

function criarTransporter() {
    return nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,

        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 30000,

        auth: {
            user: config.email.user,
            pass: config.email.password
        }
    });
}


// =====================================================
// TEMPLATE DE BOAS-VINDAS
// =====================================================

function montarEmailBoasVindas() {
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">

        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            >

            <title>Bem-vindo à Pixel Color</title>
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

                    <!-- CABEÇALHO -->

                    <div
                        style="
                            background: linear-gradient(
                                135deg,
                                #02142f,
                                #042d66
                            );
                            padding: 42px 30px;
                            text-align: center;
                            color: #ffffff;
                        "
                    >

                        <div
                            style="
                                font-size: 12px;
                                font-weight: 700;
                                letter-spacing: 4px;
                                color: #a9c7f5;
                            "
                        >
                            PIXEL COLOR
                        </div>

                        <h1
                            style="
                                margin: 15px 0 0;
                                font-size: 30px;
                                line-height: 1.2;
                            "
                        >
                            Bem-vindo à nossa newsletter!
                        </h1>

                    </div>


                    <!-- CONTEÚDO -->

                    <div
                        style="
                            padding: 40px;
                            color: #334155;
                            font-size: 15px;
                            line-height: 1.8;
                        "
                    >

                        <p
                            style="
                                margin-top: 0;
                            "
                        >
                            Seu e-mail foi cadastrado com sucesso na
                            newsletter da <strong>Pixel Color</strong>.
                        </p>

                        <p>
                            A partir de agora você poderá receber novidades,
                            lançamentos, promoções e ofertas especiais da
                            nossa loja.
                        </p>

                        <p>
                            Fique de olho na sua caixa de entrada. 🎨
                        </p>


                        <div
                            style="
                                margin-top: 35px;
                                padding-top: 22px;
                                border-top: 1px solid #e7edf5;
                                color: #64748b;
                                font-size: 13px;
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
// ENVIAR BOAS-VINDAS
// =====================================================

async function enviarBoasVindas(email) {
    if (
        !config.email.host ||
        !config.email.user ||
        !config.email.password
    ) {
        throw new Error(
            "Configuração SMTP não encontrada."
        );
    }


    const transporter =
        criarTransporter();


    await transporter.sendMail({
        from:
            config.email.from ||
            `Pixel Color <${config.email.user}>`,

        to:
            email,

        subject:
            "Bem-vindo à Pixel Color 🎨",

        text:
            "Seu e-mail foi cadastrado com sucesso na newsletter da Pixel Color.",

        html:
            montarEmailBoasVindas()
    });
}


// =====================================================
// CADASTRAR E-MAIL NA NEWSLETTER
//
// POST /api/newsletter
// =====================================================

router.post("/", async (req, res) => {
    try {

        const emailNormalizado =
            String(
                req.body?.email ||
                ""
            )
                .trim()
                .toLowerCase();


        // =================================================
        // VALIDAR E-MAIL
        // =================================================

        if (!emailNormalizado) {
            return res
                .status(400)
                .json({
                    erro:
                        "Informe seu e-mail."
                });
        }


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


        // =================================================
        // VERIFICAR SE JÁ EXISTE
        // =================================================

        const [existentes] =
            await db.query(
                `
                SELECT
                    id,
                    ativo

                FROM newsletter_inscritos

                WHERE email = ?

                LIMIT 1
                `,
                [
                    emailNormalizado
                ]
            );


        // =================================================
        // JÁ EXISTE
        // =================================================

        if (
            existentes.length >
            0
        ) {

            const inscrito =
                existentes[0];


            // -------------------------------------------------
            // JÁ ESTÁ ATIVO
            // -------------------------------------------------

            if (
                Number(
                    inscrito.ativo
                ) === 1
            ) {

                return res
                    .status(200)
                    .json({
                        mensagem:
                            "Este e-mail já está cadastrado na nossa newsletter.",
                        jaCadastrado:
                            true
                    });
            }


            // -------------------------------------------------
            // REATIVAR
            // -------------------------------------------------

            await db.query(
                `
                UPDATE newsletter_inscritos

                SET ativo = 1

                WHERE id = ?
                `,
                [
                    inscrito.id
                ]
            );


            let emailEnviado =
                false;

            let erroEmail =
                null;


            try {

                await enviarBoasVindas(
                    emailNormalizado
                );


                emailEnviado =
                    true;

            } catch (error) {

                erroEmail =
                    error.message;


                console.error(
                    "Erro ao enviar e-mail da newsletter:",
                    error
                );

            }


            return res
                .status(200)
                .json({
                    mensagem:
                        emailEnviado
                            ? "Inscrição reativada! Confira seu e-mail."
                            : "Inscrição reativada com sucesso.",

                    emailEnviado,
                    erroEmail
                });
        }


        // =================================================
        // CADASTRAR NOVO
        // =================================================

        await db.query(
            `
            INSERT INTO newsletter_inscritos
            (
                email,
                ativo
            )

            VALUES
            (
                ?,
                1
            )
            `,
            [
                emailNormalizado
            ]
        );


        // =================================================
        // ENVIAR BOAS-VINDAS
        // =================================================

        let emailEnviado =
            false;

        let erroEmail =
            null;


        try {

            await enviarBoasVindas(
                emailNormalizado
            );


            emailEnviado =
                true;


            console.log(
                `✅ Newsletter enviada para ${emailNormalizado}`
            );

        } catch (error) {

            erroEmail =
                error.message;


            console.error(
                "❌ Erro ao enviar boas-vindas da newsletter:",
                error
            );

        }


        // =================================================
        // RESPOSTA
        // =================================================

        return res
            .status(201)
            .json({
                mensagem:
                    emailEnviado
                        ? "Cadastro realizado! Confira seu e-mail."
                        : "Cadastro realizado, mas o e-mail de confirmação não pôde ser enviado.",

                emailEnviado,
                erroEmail
            });


    } catch (error) {

        console.error(
            "Erro ao cadastrar newsletter:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao cadastrar e-mail na newsletter.",

                detalhe:
                    error.message
            });

    }
});


// =====================================================
// LISTAR INSCRITOS
//
// GET /api/newsletter
// =====================================================

router.get("/", async (_req, res) => {
    try {

        const [inscritos] =
            await db.query(
                `
                SELECT
                    id,
                    email,
                    ativo,
                    criado_em

                FROM newsletter_inscritos

                ORDER BY id DESC
                `
            );


        return res
            .status(200)
            .json(
                inscritos
            );


    } catch (error) {

        console.error(
            "Erro ao listar newsletter:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao listar inscritos.",

                detalhe:
                    error.message
            });

    }
});


export default router;