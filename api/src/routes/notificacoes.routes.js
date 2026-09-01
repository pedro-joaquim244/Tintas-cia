import express from "express";
import db from "../database.js";

const router = express.Router();


// =====================================================
// LISTAR NOTIFICAÇÕES DE UM USUÁRIO
// =====================================================

router.get(
    "/usuario/:usuario_id",
    async (req, res) => {

        try {

            const {
                usuario_id
            } = req.params;


            const [notificacoes] =
                await db.query(
                    `
                    SELECT
                        id,
                        usuario_id,
                        titulo,
                        mensagem,
                        tipo,
                        referencia_id,
                        lida,
                        criado_em

                    FROM notificacoes

                    WHERE usuario_id = ?

                    ORDER BY
                        lida ASC,
                        criado_em DESC
                    `,
                    [
                        usuario_id
                    ]
                );


            const resultado =
                notificacoes.map(
                    notificacao => ({
                        ...notificacao,

                        lida:
                            Boolean(
                                notificacao.lida
                            )
                    })
                );


            return res.status(200).json(
                resultado
            );

        } catch (error) {

            console.error(
                "Erro ao buscar notificações:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao buscar notificações.",

                detalhe:
                    error.message
            });

        }

    }
);


// =====================================================
// CONTAR NOTIFICAÇÕES NÃO LIDAS
// =====================================================

router.get(
    "/usuario/:usuario_id/nao-lidas",
    async (req, res) => {

        try {

            const {
                usuario_id
            } = req.params;


            const [resultado] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total

                    FROM notificacoes

                    WHERE
                        usuario_id = ?
                        AND lida = FALSE
                    `,
                    [
                        usuario_id
                    ]
                );


            return res.status(200).json({

                total:
                    Number(
                        resultado[0]?.total || 0
                    )

            });

        } catch (error) {

            console.error(
                "Erro ao contar notificações não lidas:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao contar notificações não lidas.",

                detalhe:
                    error.message
            });

        }

    }
);


// =====================================================
// CRIAR NOTIFICAÇÃO
// =====================================================

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                usuario_id,
                titulo,
                mensagem,
                tipo,
                referencia_id
            } = req.body;


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!usuario_id) {

                return res.status(400).json({
                    erro:
                        "Informe o usuário da notificação."
                });

            }


            if (
                !titulo ||
                !titulo.trim()
            ) {

                return res.status(400).json({
                    erro:
                        "Informe o título da notificação."
                });

            }


            if (
                !mensagem ||
                !mensagem.trim()
            ) {

                return res.status(400).json({
                    erro:
                        "Informe a mensagem da notificação."
                });

            }


            const tiposValidos = [
                "pedido",
                "cupom",
                "fidelidade",
                "estoque",
                "sistema"
            ];


            const tipoFinal =
                tiposValidos.includes(tipo)
                    ? tipo
                    : "sistema";


            // =================================================
            // VERIFICAR USUÁRIO
            // =================================================

            const [usuarios] =
                await db.query(
                    `
                    SELECT
                        id

                    FROM usuarios

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        usuario_id
                    ]
                );


            if (usuarios.length === 0) {

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });

            }


            // =================================================
            // CRIAR
            // =================================================

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO notificacoes
                    (
                        usuario_id,
                        titulo,
                        mensagem,
                        tipo,
                        referencia_id,
                        lida
                    )
                    VALUES (?, ?, ?, ?, ?, FALSE)
                    `,
                    [
                        usuario_id,

                        titulo.trim(),

                        mensagem.trim(),

                        tipoFinal,

                        referencia_id || null
                    ]
                );


            // =================================================
            // BUSCAR NOTIFICAÇÃO CRIADA
            // =================================================

            const [notificacoes] =
                await db.query(
                    `
                    SELECT
                        id,
                        usuario_id,
                        titulo,
                        mensagem,
                        tipo,
                        referencia_id,
                        lida,
                        criado_em

                    FROM notificacoes

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        resultado.insertId
                    ]
                );


            const notificacao =
                notificacoes[0];


            return res.status(201).json({

                mensagem:
                    "Notificação criada com sucesso.",

                notificacao: {
                    ...notificacao,

                    lida:
                        Boolean(
                            notificacao.lida
                        )
                }

            });

        } catch (error) {

            console.error(
                "Erro ao criar notificação:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao criar notificação.",

                detalhe:
                    error.message
            });

        }

    }
);


// =====================================================
// MARCAR UMA NOTIFICAÇÃO COMO LIDA
// =====================================================

router.patch(
    "/:id/lida",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            // =================================================
            // VERIFICAR SE EXISTE
            // =================================================

            const [notificacoes] =
                await db.query(
                    `
                    SELECT
                        id

                    FROM notificacoes

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                notificacoes.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Notificação não encontrada."
                });

            }


            // =================================================
            // MARCAR COMO LIDA
            // =================================================

            await db.query(
                `
                UPDATE notificacoes

                SET lida = TRUE

                WHERE id = ?
                `,
                [
                    id
                ]
            );


            return res.status(200).json({
                mensagem:
                    "Notificação marcada como lida."
            });

        } catch (error) {

            console.error(
                "Erro ao marcar notificação como lida:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao marcar notificação como lida.",

                detalhe:
                    error.message
            });

        }

    }
);


// =====================================================
// MARCAR UMA NOTIFICAÇÃO COMO NÃO LIDA
// =====================================================

router.patch(
    "/:id/nao-lida",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const [notificacoes] =
                await db.query(
                    `
                    SELECT
                        id

                    FROM notificacoes

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                notificacoes.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Notificação não encontrada."
                });

            }


            await db.query(
                `
                UPDATE notificacoes

                SET lida = FALSE

                WHERE id = ?
                `,
                [
                    id
                ]
            );


            return res.status(200).json({
                mensagem:
                    "Notificação marcada como não lida."
            });

        } catch (error) {

            console.error(
                "Erro ao marcar notificação como não lida:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao marcar notificação como não lida.",

                detalhe:
                    error.message
            });

        }

    }
);


// =====================================================
// MARCAR TODAS COMO LIDAS
// =====================================================

router.patch(
    "/usuario/:usuario_id/ler-todas",
    async (req, res) => {

        try {

            const {
                usuario_id
            } = req.params;


            const [resultado] =
                await db.query(
                    `
                    UPDATE notificacoes

                    SET lida = TRUE

                    WHERE
                        usuario_id = ?
                        AND lida = FALSE
                    `,
                    [
                        usuario_id
                    ]
                );


            return res.status(200).json({

                mensagem:
                    "Todas as notificações foram marcadas como lidas.",

                atualizadas:
                    resultado.affectedRows

            });

        } catch (error) {

            console.error(
                "Erro ao marcar todas as notificações como lidas:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao marcar todas as notificações como lidas.",

                detalhe:
                    error.message
            });

        }

    }
);


// =====================================================
// EXCLUIR UMA NOTIFICAÇÃO
// =====================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const [resultado] =
                await db.query(
                    `
                    DELETE FROM notificacoes

                    WHERE id = ?
                    `,
                    [
                        id
                    ]
                );


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Notificação não encontrada."
                });

            }


            return res.status(200).json({
                mensagem:
                    "Notificação excluída com sucesso."
            });

        } catch (error) {

            console.error(
                "Erro ao excluir notificação:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao excluir notificação.",

                detalhe:
                    error.message
            });

        }

    }
);


// =====================================================
// EXCLUIR TODAS AS NOTIFICAÇÕES DO USUÁRIO
// =====================================================

router.delete(
    "/usuario/:usuario_id",
    async (req, res) => {

        try {

            const {
                usuario_id
            } = req.params;


            const [resultado] =
                await db.query(
                    `
                    DELETE FROM notificacoes

                    WHERE usuario_id = ?
                    `,
                    [
                        usuario_id
                    ]
                );


            return res.status(200).json({

                mensagem:
                    "Notificações excluídas com sucesso.",

                excluidas:
                    resultado.affectedRows

            });

        } catch (error) {

            console.error(
                "Erro ao excluir notificações:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao excluir notificações.",

                detalhe:
                    error.message
            });

        }

    }
);


export default router;