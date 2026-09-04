import express from "express";
import crypto from "crypto";

const router = express.Router();


// =====================================================
// TESTAR ACCESS TOKEN
//
// GET /api/mercado-pago/teste
// =====================================================

router.get("/teste", async (_req, res) => {

    try {

        const accessToken =
            process.env.MERCADO_PAGO_ACCESS_TOKEN;


        if (!accessToken) {

            return res
                .status(500)
                .json({
                    erro:
                        "Access Token do Mercado Pago não configurado."
                });

        }


        const resposta =
            await fetch(
                "https://api.mercadopago.com/users/me",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            console.error(
                "Erro ao testar Mercado Pago:",
                dados
            );


            return res
                .status(resposta.status)
                .json({
                    erro:
                        "Erro ao conectar com Mercado Pago.",

                    detalhe:
                        dados
                });

        }


        return res
            .status(200)
            .json({
                mensagem:
                    "Mercado Pago conectado com sucesso!"
            });


    } catch (error) {

        console.error(
            "Erro Mercado Pago:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao testar Mercado Pago.",

                detalhe:
                    error.message
            });

    }

});


// =====================================================
// CRIAR PAGAMENTO PIX
//
// POST /api/mercado-pago/pix
// =====================================================

router.post("/pix", async (req, res) => {

    try {

        const {
            valor,
            email,
            pedido_id,
            nome
        } = req.body;


        // =================================================
        // ACCESS TOKEN
        // =================================================

        const accessToken =
            process.env.MERCADO_PAGO_ACCESS_TOKEN;


        if (!accessToken) {

            return res
                .status(500)
                .json({
                    erro:
                        "Access Token do Mercado Pago não configurado."
                });

        }


        // =================================================
        // VALOR
        // =================================================

        const valorNumero =
            Number(valor);


        if (
            !Number.isFinite(valorNumero) ||
            valorNumero <= 0
        ) {

            return res
                .status(400)
                .json({
                    erro:
                        "Valor do pagamento inválido."
                });

        }


        // =================================================
        // EMAIL
        // =================================================

        const emailNormalizado =
            String(email || "")
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
                        "E-mail do comprador inválido."
                });

        }


        // =================================================
        // REFERÊNCIA DO PEDIDO
        // =================================================

        const referencia =
            pedido_id
                ? `pedido-${pedido_id}`
                : `pedido-${Date.now()}`;


        // =================================================
        // IDEMPOTÊNCIA
        // =================================================

        const idempotencyKey =
            crypto.randomUUID();


        // =================================================
        // DADOS DA ORDER PIX
        // =================================================

        const body = {

            type:
                "online",

            processing_mode:
                "automatic",

            external_reference:
                referencia,

            total_amount:
                valorNumero.toFixed(2),

            payer: {

                email:
                    emailNormalizado,

                ...(nome
                    ? {
                        first_name:
                            String(nome).trim()
                    }
                    : {})

            },

            transactions: {

                payments: [

                    {

                        amount:
                            valorNumero.toFixed(2),

                        payment_method: {

                            id:
                                "pix",

                            type:
                                "bank_transfer"

                        }

                    }

                ]

            }

        };


        console.log(
            "======================================"
        );

        console.log(
            "CRIANDO PIX NO MERCADO PAGO"
        );

        console.log(
            "Pedido:",
            referencia
        );

        console.log(
            "Valor:",
            valorNumero.toFixed(2)
        );

        console.log(
            "======================================"
        );


        // =================================================
        // CRIAR ORDER
        // =================================================

        const resposta =
            await fetch(
                "https://api.mercadopago.com/v1/orders",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${accessToken}`,

                        "X-Idempotency-Key":
                            idempotencyKey

                    },

                    body:
                        JSON.stringify(
                            body
                        )

                }
            );


        const dados =
            await resposta.json();


        // =================================================
        // ERRO MERCADO PAGO
        // =================================================

        if (!resposta.ok) {

            console.error(
                "======================================"
            );

            console.error(
                "ERRO MERCADO PAGO PIX"
            );

            console.error(
                JSON.stringify(
                    dados,
                    null,
                    2
                )
            );

            console.error(
                "======================================"
            );


            return res
                .status(resposta.status)
                .json({

                    erro:
                        "Erro ao criar pagamento PIX.",

                    detalhe:
                        dados

                });

        }


        // =================================================
        // PEGAR PAGAMENTO PIX
        // =================================================

        const pagamento =
            dados
                ?.transactions
                ?.payments
                ?.[0];


        const metodoPagamento =
            pagamento
                ?.payment_method ||
            {};


        const qrCode =
            metodoPagamento
                .qr_code ||
            null;


        const qrCodeBase64 =
            metodoPagamento
                .qr_code_base64 ||
            null;


        const ticketUrl =
            metodoPagamento
                .ticket_url ||
            null;


        // =================================================
        // LOG
        // =================================================

        console.log(
            "======================================"
        );

        console.log(
            "PIX CRIADO COM SUCESSO"
        );

        console.log(
            "Order ID:",
            dados.id
        );

        console.log(
            "Payment ID:",
            pagamento?.id
        );

        console.log(
            "Status:",
            dados.status
        );

        console.log(
            "======================================"
        );


        // =================================================
        // RETORNO
        // =================================================

        return res
            .status(201)
            .json({

                mensagem:
                    "PIX criado com sucesso.",

                order_id:
                    dados.id,

                payment_id:
                    pagamento?.id ||
                    null,

                external_reference:
                    dados.external_reference,

                status:
                    dados.status,

                status_detail:
                    dados.status_detail,

                valor:
                    dados.total_amount,

                qr_code:
                    qrCode,

                qr_code_base64:
                    qrCodeBase64,

                ticket_url:
                    ticketUrl,

                dados

            });


    } catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "ERRO INTERNO AO CRIAR PIX"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );


        return res
            .status(500)
            .json({

                erro:
                    "Erro interno ao criar PIX.",

                detalhe:
                    error.message

            });

    }

});


// =====================================================
// CRIAR PAGAMENTO BOLETO
//
// POST /api/mercado-pago/boleto
// =====================================================

router.post("/boleto", async (req, res) => {

    try {

        // =================================================
        // DADOS RECEBIDOS
        // =================================================

        const {
            valor,
            email,
            pedido_id,
            nome,
            cpf,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            estado
        } = req.body;


        // =================================================
        // ACCESS TOKEN
        // =================================================

        const accessToken =
            process.env.MERCADO_PAGO_ACCESS_TOKEN;


        if (!accessToken) {

            return res
                .status(500)
                .json({
                    erro:
                        "Access Token do Mercado Pago não configurado."
                });

        }


        // =================================================
        // VALOR
        // =================================================

        const valorNumero =
            Number(valor);


        if (
            !Number.isFinite(valorNumero) ||
            valorNumero <= 0
        ) {

            return res
                .status(400)
                .json({
                    erro:
                        "Valor do boleto inválido."
                });

        }


        // =================================================
        // EMAIL
        // =================================================

        const emailNormalizado =
            String(email || "")
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
                        "E-mail do comprador inválido."
                });

        }


        // =================================================
        // CPF
        // =================================================

        const cpfLimpo =
            String(cpf || "")
                .replace(
                    /\D/g,
                    ""
                );


        if (
            cpfLimpo.length !== 11
        ) {

            return res
                .status(400)
                .json({
                    erro:
                        "Informe um CPF válido."
                });

        }


        // =================================================
        // CEP
        // =================================================

        const cepLimpo =
            String(cep || "")
                .replace(
                    /\D/g,
                    ""
                );


        if (
            cepLimpo.length !== 8
        ) {

            return res
                .status(400)
                .json({
                    erro:
                        "Informe um CEP válido."
                });

        }


        // =================================================
        // ENDEREÇO
        // =================================================

        if (
            !endereco ||
            !numero ||
            !bairro ||
            !cidade ||
            !estado
        ) {

            return res
                .status(400)
                .json({
                    erro:
                        "Preencha o endereço completo para gerar o boleto."
                });

        }


        // =================================================
        // NOME
        // =================================================

        const nomeCompleto =
            String(
                nome ||
                "Cliente Pixel Color"
            )
                .trim();


        const partesNome =
            nomeCompleto
                .split(/\s+/);


        const primeiroNome =
            partesNome[0] ||
            "Cliente";


        const sobrenome =
            partesNome
                .slice(1)
                .join(" ") ||
            "Pixel Color";


        // =================================================
        // REFERÊNCIA
        // =================================================

        const referencia =
            pedido_id
                ? `pedido-${pedido_id}`
                : `pedido-${Date.now()}`;


        // =================================================
        // IDEMPOTÊNCIA
        // =================================================

        const idempotencyKey =
            crypto.randomUUID();


        // =================================================
        // BODY DO BOLETO
        // =================================================

        const body = {

            type:
                "online",

            processing_mode:
                "automatic",

            external_reference:
                referencia,

            total_amount:
                valorNumero.toFixed(2),

            description:
                pedido_id
                    ? `Pedido Pixel Color #${pedido_id}`
                    : "Compra Pixel Color",

            payer: {

                email:
                    emailNormalizado,

                first_name:
                    primeiroNome,

                last_name:
                    sobrenome,

                identification: {

                    type:
                        "CPF",

                    number:
                        cpfLimpo

                },

                address: {

                    street_name:
                        String(endereco)
                            .trim(),

                    street_number:
                        String(numero)
                            .trim(),

                    zip_code:
                        cepLimpo,

                    neighborhood:
                        String(bairro)
                            .trim(),

                    city:
                        String(cidade)
                            .trim(),

                    state:
                        String(estado)
                            .trim()
                            .toUpperCase()

                }

            },

            transactions: {

                payments: [

                    {

                        amount:
                            valorNumero.toFixed(2),

                        expiration_time:
                            "P3D",

                        payment_method: {

                            id:
                                "boleto",

                            type:
                                "ticket"

                        }

                    }

                ]

            }

        };


        console.log(
            "======================================"
        );

        console.log(
            "CRIANDO BOLETO NO MERCADO PAGO"
        );

        console.log(
            "Pedido:",
            referencia
        );

        console.log(
            "Valor:",
            valorNumero.toFixed(2)
        );

        console.log(
            "======================================"
        );


        // =================================================
        // CRIAR ORDER
        // =================================================

        const resposta =
            await fetch(
                "https://api.mercadopago.com/v1/orders",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${accessToken}`,

                        "X-Idempotency-Key":
                            idempotencyKey

                    },

                    body:
                        JSON.stringify(
                            body
                        )

                }
            );


        const dados =
            await resposta.json();


        // =================================================
        // ERRO MERCADO PAGO
        // =================================================

        if (!resposta.ok) {

            console.error(
                "======================================"
            );

            console.error(
                "ERRO MERCADO PAGO BOLETO"
            );

            console.error(
                JSON.stringify(
                    dados,
                    null,
                    2
                )
            );

            console.error(
                "======================================"
            );


            return res
                .status(resposta.status)
                .json({

                    erro:
                        "Erro ao criar boleto.",

                    detalhe:
                        dados

                });

        }


        // =================================================
        // PEGAR PAGAMENTO
        // =================================================

        const pagamento =
            dados
                ?.transactions
                ?.payments
                ?.[0];


        const metodoPagamento =
            pagamento
                ?.payment_method ||
            {};


        // =================================================
        // DADOS DO BOLETO
        // =================================================

        const ticketUrl =
            metodoPagamento
                .ticket_url ||
            null;


        const linhaDigitavel =
            metodoPagamento
                .digitable_line ||
            null;


        const codigoBarras =
            metodoPagamento
                .barcode_content ||
            null;


        // =================================================
        // LOG
        // =================================================

        console.log(
            "======================================"
        );

        console.log(
            "BOLETO CRIADO COM SUCESSO"
        );

        console.log(
            "Order ID:",
            dados.id
        );

        console.log(
            "Payment ID:",
            pagamento?.id
        );

        console.log(
            "Status:",
            dados.status
        );

        console.log(
            "Status detail:",
            dados.status_detail
        );

        console.log(
            "Ticket URL:",
            ticketUrl
        );

        console.log(
            "======================================"
        );


        // =================================================
        // RETORNO
        // =================================================

        return res
            .status(201)
            .json({

                mensagem:
                    "Boleto criado com sucesso.",

                order_id:
                    dados.id,

                payment_id:
                    pagamento?.id ||
                    null,

                external_reference:
                    dados.external_reference,

                status:
                    dados.status,

                status_detail:
                    dados.status_detail,

                valor:
                    dados.total_amount,

                boleto_url:
                    ticketUrl,

                ticket_url:
                    ticketUrl,

                linha_digitavel:
                    linhaDigitavel,

                codigo_barras:
                    codigoBarras,

                dados

            });


    } catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "ERRO INTERNO AO CRIAR BOLETO"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );


        return res
            .status(500)
            .json({

                erro:
                    "Erro interno ao criar boleto.",

                detalhe:
                    error.message

            });

    }

});


// =====================================================
// CONSULTAR ORDER
//
// GET /api/mercado-pago/order/:id
// =====================================================

router.get("/order/:id", async (req, res) => {

    try {

        // =================================================
        // ACCESS TOKEN
        // =================================================

        const accessToken =
            process.env.MERCADO_PAGO_ACCESS_TOKEN;


        if (!accessToken) {

            return res
                .status(500)
                .json({
                    erro:
                        "Access Token do Mercado Pago não configurado."
                });

        }


        // =================================================
        // ID
        // =================================================

        const {
            id
        } = req.params;


        if (!id) {

            return res
                .status(400)
                .json({
                    erro:
                        "ID da order não informado."
                });

        }


        // =================================================
        // BUSCAR ORDER
        // =================================================

        const resposta =
            await fetch(
                `https://api.mercadopago.com/v1/orders/${encodeURIComponent(id)}`,
                {

                    method:
                        "GET",

                    headers: {

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${accessToken}`

                    }

                }
            );


        const dados =
            await resposta.json();


        // =================================================
        // ERRO
        // =================================================

        if (!resposta.ok) {

            console.error(
                "Erro ao consultar order:",
                dados
            );


            return res
                .status(resposta.status)
                .json({

                    erro:
                        "Erro ao consultar pagamento.",

                    detalhe:
                        dados

                });

        }


        // =================================================
        // PAGAMENTO
        // =================================================

        const pagamento =
            dados
                ?.transactions
                ?.payments
                ?.[0];


        const metodoPagamento =
            pagamento
                ?.payment_method ||
            {};


        // =================================================
        // DADOS PIX
        // =================================================

        const qrCode =
            metodoPagamento
                .qr_code ||
            null;


        const qrCodeBase64 =
            metodoPagamento
                .qr_code_base64 ||
            null;


        // =================================================
        // DADOS BOLETO
        // =================================================

        const ticketUrl =
            metodoPagamento
                .ticket_url ||
            null;


        const linhaDigitavel =
            metodoPagamento
                .digitable_line ||
            null;


        const codigoBarras =
            metodoPagamento
                .barcode_content ||
            null;


        // =================================================
        // RETORNO
        // =================================================

        return res
            .status(200)
            .json({

                order_id:
                    dados.id,

                payment_id:
                    pagamento?.id ||
                    null,

                status:
                    dados.status,

                status_detail:
                    dados.status_detail,

                external_reference:
                    dados.external_reference,

                valor:
                    dados.total_amount,

                qr_code:
                    qrCode,

                qr_code_base64:
                    qrCodeBase64,

                ticket_url:
                    ticketUrl,

                boleto_url:
                    ticketUrl,

                linha_digitavel:
                    linhaDigitavel,

                codigo_barras:
                    codigoBarras,

                dados

            });


    } catch (error) {

        console.error(
            "Erro interno ao consultar order:",
            error
        );


        return res
            .status(500)
            .json({

                erro:
                    "Erro interno ao consultar pagamento.",

                detalhe:
                    error.message

            });

    }

});


export default router;