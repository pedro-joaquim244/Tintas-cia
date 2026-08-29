import express from "express";
import db from "../database.js";

const router = express.Router();


// =====================================================
// LISTAR CARTÕES DO USUÁRIO
// GET /cartoes/usuario/:usuario_id
// =====================================================

router.get(
    "/usuario/:usuario_id",
    async (req, res) => {

        try {

            const { usuario_id } = req.params;

            const [cartoes] = await db.query(
                `
                SELECT
                    id,
                    usuario_id,
                    bandeira,
                    ultimos_digitos,
                    nome_titular,
                    mes_validade,
                    ano_validade,
                    principal,
                    criado_em

                FROM cartoes

                WHERE usuario_id = ?

                ORDER BY
                    principal DESC,
                    id DESC
                `,
                [usuario_id]
            );

            return res.status(200).json(
                cartoes
            );

        } catch (error) {

            console.error(
                "Erro ao buscar cartões:",
                error
            );

            return res.status(500).json({
                erro: "Erro ao buscar cartões.",
                detalhe: error.message
            });

        }

    }
);


// =====================================================
// BUSCAR UM CARTÃO
// GET /cartoes/:id
// =====================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const { id } = req.params;

            const [resultado] =
                await db.query(
                    `
                    SELECT
                        id,
                        usuario_id,
                        bandeira,
                        ultimos_digitos,
                        nome_titular,
                        mes_validade,
                        ano_validade,
                        principal,
                        criado_em

                    FROM cartoes

                    WHERE id = ?
                    `,
                    [id]
                );

            if (resultado.length === 0) {

                return res.status(404).json({
                    erro: "Cartão não encontrado."
                });

            }

            return res.status(200).json(
                resultado[0]
            );

        } catch (error) {

            console.error(
                "Erro ao buscar cartão:",
                error
            );

            return res.status(500).json({
                erro: "Erro ao buscar cartão.",
                detalhe: error.message
            });

        }

    }
);


// =====================================================
// CADASTRAR CARTÃO
// POST /cartoes
// =====================================================
//
// IMPORTANTE:
// O frontend NÃO deve mandar o número completo do cartão
// nem o CVV para serem salvos.
//
// O ideal é receber um token criado pelo gateway.
//
// Exemplo:
//
// {
//     "usuario_id": 1,
//     "token": "card_xxxxxxxxx",
//     "bandeira": "Visa",
//     "ultimos_digitos": "4582",
//     "nome_titular": "PEDRO JOAQUIM",
//     "mes_validade": 8,
//     "ano_validade": 2030,
//     "principal": true
// }
//
// =====================================================

router.post(
    "/",
    async (req, res) => {

        const conexao =
            await db.getConnection();

        try {

            const {
                usuario_id,
                token,
                bandeira,
                ultimos_digitos,
                nome_titular,
                mes_validade,
                ano_validade,
                principal
            } = req.body;


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!usuario_id) {

                return res.status(400).json({
                    erro: "Usuário é obrigatório."
                });

            }


            if (!token) {

                return res.status(400).json({
                    erro: "Token do cartão é obrigatório."
                });

            }


            if (!ultimos_digitos) {

                return res.status(400).json({
                    erro: "Últimos dígitos do cartão são obrigatórios."
                });

            }


            if (
                String(ultimos_digitos)
                    .replace(/\D/g, "")
                    .length !== 4
            ) {

                return res.status(400).json({
                    erro: "Os últimos dígitos devem possuir 4 números."
                });

            }


            if (
                !mes_validade ||
                Number(mes_validade) < 1 ||
                Number(mes_validade) > 12
            ) {

                return res.status(400).json({
                    erro: "Mês de validade inválido."
                });

            }


            if (
                !ano_validade ||
                Number(ano_validade) <
                    new Date().getFullYear()
            ) {

                return res.status(400).json({
                    erro: "Ano de validade inválido."
                });

            }


            await conexao.beginTransaction();


            // =================================================
            // VERIFICAR USUÁRIO
            // =================================================

            const [usuarios] =
                await conexao.query(
                    `
                    SELECT id

                    FROM usuarios

                    WHERE id = ?
                    `,
                    [usuario_id]
                );


            if (usuarios.length === 0) {

                await conexao.rollback();

                return res.status(404).json({
                    erro: "Usuário não encontrado."
                });

            }


            // =================================================
            // VERIFICAR SE TOKEN JÁ FOI SALVO
            // =================================================

            const [cartaoExistente] =
                await conexao.query(
                    `
                    SELECT id

                    FROM cartoes

                    WHERE
                        usuario_id = ?
                        AND token = ?
                    `,
                    [
                        usuario_id,
                        token
                    ]
                );


            if (
                cartaoExistente.length > 0
            ) {

                await conexao.rollback();

                return res.status(409).json({
                    erro: "Este cartão já está salvo."
                });

            }


            // =================================================
            // VERIFICAR SE É O PRIMEIRO CARTÃO
            // =================================================

            const [quantidadeCartoes] =
                await conexao.query(
                    `
                    SELECT COUNT(*) AS total

                    FROM cartoes

                    WHERE usuario_id = ?
                    `,
                    [usuario_id]
                );


            const primeiroCartao =
                Number(
                    quantidadeCartoes[0].total
                ) === 0;


            const definirPrincipal =
                primeiroCartao ||
                principal === true ||
                principal === 1;


            // =================================================
            // REMOVER PRINCIPAL DOS OUTROS
            // =================================================

            if (definirPrincipal) {

                await conexao.query(
                    `
                    UPDATE cartoes

                    SET principal = 0

                    WHERE usuario_id = ?
                    `,
                    [usuario_id]
                );

            }


            // =================================================
            // CADASTRAR
            // =================================================

            const [resultado] =
                await conexao.query(
                    `
                    INSERT INTO cartoes
                    (
                        usuario_id,
                        token,
                        bandeira,
                        ultimos_digitos,
                        nome_titular,
                        mes_validade,
                        ano_validade,
                        principal
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        usuario_id,
                        token,
                        bandeira || null,
                        String(
                            ultimos_digitos
                        )
                            .replace(/\D/g, "")
                            .slice(-4),
                        nome_titular || null,
                        mes_validade,
                        ano_validade,
                        definirPrincipal
                            ? 1
                            : 0
                    ]
                );


            await conexao.commit();


            return res.status(201).json({

                mensagem:
                    "Cartão salvo com sucesso.",

                cartao: {
                    id:
                        resultado.insertId,

                    usuario_id,

                    bandeira:
                        bandeira || null,

                    ultimos_digitos:
                        String(
                            ultimos_digitos
                        )
                            .replace(/\D/g, "")
                            .slice(-4),

                    nome_titular:
                        nome_titular || null,

                    mes_validade,

                    ano_validade,

                    principal:
                        definirPrincipal
                }

            });


        } catch (error) {

            await conexao.rollback();

            console.error(
                "Erro ao cadastrar cartão:",
                error
            );

            return res.status(500).json({
                erro: "Erro ao cadastrar cartão.",
                detalhe: error.message
            });

        } finally {

            conexao.release();

        }

    }
);


// =====================================================
// DEFINIR CARTÃO COMO PRINCIPAL
// PUT /cartoes/:id/principal
// =====================================================

router.put(
    "/:id/principal",
    async (req, res) => {

        const conexao =
            await db.getConnection();

        try {

            const { id } = req.params;

            const { usuario_id } =
                req.body;


            if (!usuario_id) {

                return res.status(400).json({
                    erro: "Usuário é obrigatório."
                });

            }


            await conexao.beginTransaction();


            // =================================================
            // BUSCAR CARTÃO
            // =================================================

            const [cartoes] =
                await conexao.query(
                    `
                    SELECT
                        id,
                        usuario_id

                    FROM cartoes

                    WHERE
                        id = ?
                        AND usuario_id = ?
                    `,
                    [
                        id,
                        usuario_id
                    ]
                );


            if (cartoes.length === 0) {

                await conexao.rollback();

                return res.status(404).json({
                    erro: "Cartão não encontrado."
                });

            }


            // =================================================
            // REMOVER PRINCIPAL DOS OUTROS
            // =================================================

            await conexao.query(
                `
                UPDATE cartoes

                SET principal = 0

                WHERE usuario_id = ?
                `,
                [usuario_id]
            );


            // =================================================
            // DEFINIR NOVO PRINCIPAL
            // =================================================

            await conexao.query(
                `
                UPDATE cartoes

                SET principal = 1

                WHERE
                    id = ?
                    AND usuario_id = ?
                `,
                [
                    id,
                    usuario_id
                ]
            );


            await conexao.commit();


            return res.status(200).json({
                mensagem:
                    "Cartão principal atualizado com sucesso."
            });


        } catch (error) {

            await conexao.rollback();

            console.error(
                "Erro ao definir cartão principal:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao definir cartão principal.",
                detalhe: error.message
            });

        } finally {

            conexao.release();

        }

    }
);


// =====================================================
// EXCLUIR CARTÃO
// DELETE /cartoes/:id
// =====================================================
//
// Body:
//
// {
//     "usuario_id": 1
// }
//
// =====================================================

router.delete(
    "/:id",
    async (req, res) => {

        const conexao =
            await db.getConnection();

        try {

            const { id } = req.params;

            const { usuario_id } =
                req.body;


            if (!usuario_id) {

                return res.status(400).json({
                    erro: "Usuário é obrigatório."
                });

            }


            await conexao.beginTransaction();


            // =================================================
            // BUSCAR CARTÃO
            // =================================================

            const [cartoes] =
                await conexao.query(
                    `
                    SELECT
                        id,
                        usuario_id,
                        principal

                    FROM cartoes

                    WHERE
                        id = ?
                        AND usuario_id = ?
                    `,
                    [
                        id,
                        usuario_id
                    ]
                );


            if (cartoes.length === 0) {

                await conexao.rollback();

                return res.status(404).json({
                    erro: "Cartão não encontrado."
                });

            }


            const eraPrincipal =
                Boolean(
                    cartoes[0].principal
                );


            // =================================================
            // EXCLUIR
            // =================================================

            await conexao.query(
                `
                DELETE FROM cartoes

                WHERE
                    id = ?
                    AND usuario_id = ?
                `,
                [
                    id,
                    usuario_id
                ]
            );


            // =================================================
            // SE ERA PRINCIPAL,
            // DEFINIR OUTRO AUTOMATICAMENTE
            // =================================================

            if (eraPrincipal) {

                const [proximoCartao] =
                    await conexao.query(
                        `
                        SELECT id

                        FROM cartoes

                        WHERE usuario_id = ?

                        ORDER BY id DESC

                        LIMIT 1
                        `,
                        [usuario_id]
                    );


                if (
                    proximoCartao.length > 0
                ) {

                    await conexao.query(
                        `
                        UPDATE cartoes

                        SET principal = 1

                        WHERE id = ?
                        `,
                        [
                            proximoCartao[0].id
                        ]
                    );

                }

            }


            await conexao.commit();


            return res.status(200).json({
                mensagem:
                    "Cartão excluído com sucesso."
            });


        } catch (error) {

            await conexao.rollback();

            console.error(
                "Erro ao excluir cartão:",
                error
            );

            return res.status(500).json({
                erro: "Erro ao excluir cartão.",
                detalhe: error.message
            });

        } finally {

            conexao.release();

        }

    }
);


export default router;