import express from "express";
import db from "../database.js";
import { registrarAtividade } from "../services/historico.service.js";

const router = express.Router();


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function numeroValido(valor) {
    return (
        valor !== undefined &&
        valor !== null &&
        !Number.isNaN(Number(valor))
    );
}


function calcularValidadePadrao() {

    const data =
        new Date();

    data.setDate(
        data.getDate() + 7
    );

    return data
        .toISOString()
        .split("T")[0];
}


// =====================================================
// CRIAR ORÇAMENTO
// =====================================================

router.post(
    "/",
    async (req, res) => {

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();


            const {
                usuario_id,
                itens,
                validade
            } = req.body;


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!usuario_id) {

                await connection.rollback();

                return res.status(400).json({
                    erro:
                        "Informe o usuário do orçamento."
                });

            }


            if (
                !Array.isArray(itens) ||
                itens.length === 0
            ) {

                await connection.rollback();

                return res.status(400).json({
                    erro:
                        "Informe pelo menos um produto."
                });

            }


            // =================================================
            // VERIFICAR USUÁRIO
            // =================================================

            const [usuarios] =
                await connection.query(
                    `
                    SELECT id, nome, email

                    FROM usuarios

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        usuario_id
                    ]
                );


            if (
                usuarios.length === 0
            ) {

                await connection.rollback();

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });

            }


            // =================================================
            // VALIDAR PRODUTOS E CALCULAR TOTAL
            // =================================================

            const itensOrcamento = [];

            let total = 0;


            for (
                const item of itens
            ) {

                const {
                    produto_id,
                    quantidade
                } = item;


                if (
                    !produto_id ||
                    !numeroValido(quantidade) ||
                    Number(quantidade) <= 0
                ) {

                    await connection.rollback();

                    return res.status(400).json({
                        erro:
                            "Produto ou quantidade inválida."
                    });

                }


                const [produtos] =
                    await connection.query(
                        `
                        SELECT
                            id,
                            nome,
                            preco,
                            quantidade,
                            status,
                            marca,
                            cor,
                            foto

                        FROM itens

                        WHERE id = ?

                        LIMIT 1
                        `,
                        [
                            produto_id
                        ]
                    );


                if (
                    produtos.length === 0
                ) {

                    await connection.rollback();

                    return res.status(404).json({
                        erro:
                            `Produto ${produto_id} não encontrado.`
                    });

                }


                const produto =
                    produtos[0];


                if (
                    String(
                        produto.status
                    ).toLowerCase() !== "ativo"
                ) {

                    await connection.rollback();

                    return res.status(400).json({
                        erro:
                            `O produto "${produto.nome}" não está disponível.`
                    });

                }


                const quantidadeFinal =
                    Number(
                        quantidade
                    );


                const preco =
                    Number(
                        produto.preco
                    );


                const subtotal =
                    preco *
                    quantidadeFinal;


                total +=
                    subtotal;


                itensOrcamento.push({
                    produto_id:
                        produto.id,

                    nome:
                        produto.nome,

                    quantidade:
                        quantidadeFinal,

                    preco,

                    subtotal,

                    marca:
                        produto.marca,

                    cor:
                        produto.cor,

                    foto:
                        produto.foto
                });

            }


            // =================================================
            // CRIAR ORÇAMENTO
            // =================================================

            const validadeFinal =
                validade ||
                calcularValidadePadrao();


            const [resultadoOrcamento] =
                await connection.query(
                    `
                    INSERT INTO orcamentos
                    (
                        usuario_id,
                        total,
                        status,
                        validade
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        usuario_id,
                        total,
                        "aberto",
                        validadeFinal
                    ]
                );


            const orcamentoId =
                resultadoOrcamento.insertId;


            // =================================================
            // SALVAR ITENS
            // =================================================

            for (
                const item of itensOrcamento
            ) {

                await connection.query(
                    `
                    INSERT INTO orcamento_itens
                    (
                        orcamento_id,
                        produto_id,
                        quantidade,
                        preco
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        orcamentoId,
                        item.produto_id,
                        item.quantidade,
                        item.preco
                    ]
                );

            }

            await registrarAtividade(connection, {
                usuario_id: Number(usuario_id),
                tipo: "orcamento",
                acao: "criar",
                titulo: `Novo orcamento #${orcamentoId}`,
                descricao: `Orcamento solicitado no valor de R$ ${Number(total).toFixed(2)}.`,
                referencia_id: orcamentoId,
                valor_novo: {
                    status: "aberto",
                    total: Number(total),
                    itens: itensOrcamento.length
                }
            });


            await connection.commit();


            return res.status(201).json({

                mensagem:
                    "Orçamento criado com sucesso.",

                orcamento: {

                    id:
                        orcamentoId,

                    usuario_id,

                    total,

                    status:
                        "aberto",

                    validade:
                        validadeFinal,

                    itens:
                        itensOrcamento

                }

            });

        } catch (error) {

            await connection.rollback();

            console.error(
                "Erro ao criar orçamento:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao criar orçamento.",

                detalhe:
                    error.message

            });

        } finally {

            connection.release();

        }

    }
);


// =====================================================
// LISTAR ORÇAMENTOS DE UM USUÁRIO
// =====================================================

router.get(
    "/usuario/:usuario_id",
    async (req, res) => {

        try {

            const {
                usuario_id
            } = req.params;


            const [orcamentos] =
                await db.query(
                    `
                    SELECT
                        o.id,
                        o.usuario_id,
                        o.total,
                        o.status,
                        o.validade,
                        o.criado_em,

                        u.nome AS usuario_nome,
                        u.email AS usuario_email

                    FROM orcamentos o

                    INNER JOIN usuarios u
                        ON u.id = o.usuario_id

                    WHERE o.usuario_id = ?

                    ORDER BY o.criado_em DESC
                    `,
                    [
                        usuario_id
                    ]
                );


            return res.status(200).json(
                orcamentos
            );

        } catch (error) {

            console.error(
                "Erro ao buscar orçamentos:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar orçamentos.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// LISTAR TODOS OS ORÇAMENTOS
// =====================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const [orcamentos] =
                await db.query(
                    `
                    SELECT
                        o.id,
                        o.usuario_id,
                        o.total,
                        o.status,
                        o.validade,
                        o.criado_em,

                        u.nome AS usuario_nome,
                        u.email AS usuario_email

                    FROM orcamentos o

                    INNER JOIN usuarios u
                        ON u.id = o.usuario_id

                    ORDER BY o.criado_em DESC
                    `
                );


            return res.status(200).json(
                orcamentos
            );

        } catch (error) {

            console.error(
                "Erro ao listar orçamentos:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao listar orçamentos.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// BUSCAR ORÇAMENTO COMPLETO
// =====================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const [orcamentos] =
                await db.query(
                    `
                    SELECT
                        o.id,
                        o.usuario_id,
                        o.total,
                        o.status,
                        o.validade,
                        o.criado_em,

                        u.nome AS usuario_nome,
                        u.email AS usuario_email

                    FROM orcamentos o

                    INNER JOIN usuarios u
                        ON u.id = o.usuario_id

                    WHERE o.id = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                orcamentos.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Orçamento não encontrado."
                });

            }


            const [itens] =
                await db.query(
                    `
                    SELECT
                        oi.id,
                        oi.orcamento_id,
                        oi.produto_id,
                        oi.quantidade,
                        oi.preco,

                        i.nome,
                        i.descricao,
                        i.foto,
                        i.marca,
                        i.cor,
                        i.categoria,
                        i.status,

                        (
                            oi.quantidade *
                            oi.preco
                        ) AS subtotal

                    FROM orcamento_itens oi

                    INNER JOIN itens i
                        ON i.id = oi.produto_id

                    WHERE oi.orcamento_id = ?

                    ORDER BY oi.id ASC
                    `,
                    [
                        id
                    ]
                );


            return res.status(200).json({

                ...orcamentos[0],

                itens

            });

        } catch (error) {

            console.error(
                "Erro ao buscar orçamento:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar orçamento.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// ALTERAR STATUS DO ORÇAMENTO
// =====================================================

router.patch(
    "/:id/status",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                status
            } = req.body;


            const statusValidos = [
                "aberto",
                "aprovado",
                "expirado",
                "convertido"
            ];


            if (
                !statusValidos.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    erro:
                        "Status inválido."
                });

            }


            const [resultado] =
                await db.query(
                    `
                    UPDATE orcamentos

                    SET status = ?

                    WHERE id = ?
                    `,
                    [
                        status,
                        id
                    ]
                );


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Orçamento não encontrado."
                });

            }


            return res.status(200).json({

                mensagem:
                    "Status do orçamento atualizado.",

                status

            });

        } catch (error) {

            console.error(
                "Erro ao atualizar orçamento:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao atualizar orçamento.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// ATUALIZAR VALIDADE
// =====================================================

router.patch(
    "/:id/validade",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                validade
            } = req.body;


            if (!validade) {

                return res.status(400).json({
                    erro:
                        "Informe a validade."
                });

            }


            const [resultado] =
                await db.query(
                    `
                    UPDATE orcamentos

                    SET validade = ?

                    WHERE id = ?
                    `,
                    [
                        validade,
                        id
                    ]
                );


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Orçamento não encontrado."
                });

            }


            return res.status(200).json({
                mensagem:
                    "Validade atualizada com sucesso."
            });

        } catch (error) {

            console.error(
                "Erro ao alterar validade:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao alterar validade.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// CONVERTER ORÇAMENTO EM PEDIDO
// =====================================================

router.post(
    "/:id/converter",
    async (req, res) => {

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();


            const {
                id
            } = req.params;


            const {
                metodo_pagamento
            } = req.body;


            if (!metodo_pagamento) {

                await connection.rollback();

                return res.status(400).json({
                    erro:
                        "Informe o método de pagamento."
                });

            }


            // =================================================
            // BUSCAR ORÇAMENTO
            // =================================================

            const [orcamentos] =
                await connection.query(
                    `
                    SELECT
                        id,
                        usuario_id,
                        total,
                        status,
                        validade

                    FROM orcamentos

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                orcamentos.length === 0
            ) {

                await connection.rollback();

                return res.status(404).json({
                    erro:
                        "Orçamento não encontrado."
                });

            }


            const orcamento =
                orcamentos[0];


            if (
                orcamento.status ===
                "convertido"
            ) {

                await connection.rollback();

                return res.status(400).json({
                    erro:
                        "Este orçamento já foi convertido em pedido."
                });

            }


            if (
                orcamento.status ===
                "expirado"
            ) {

                await connection.rollback();

                return res.status(400).json({
                    erro:
                        "Este orçamento está expirado."
                });

            }


            // =================================================
            // VERIFICAR VALIDADE
            // =================================================

            if (
                orcamento.validade
            ) {

                const hoje =
                    new Date();

                hoje.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const validade =
                    new Date(
                        orcamento.validade
                    );


                if (
                    validade <
                    hoje
                ) {

                    await connection.query(
                        `
                        UPDATE orcamentos

                        SET status = 'expirado'

                        WHERE id = ?
                        `,
                        [
                            id
                        ]
                    );


                    await connection.commit();


                    return res.status(400).json({
                        erro:
                            "Este orçamento expirou."
                    });

                }

            }


            // =================================================
            // BUSCAR ITENS
            // =================================================

            const [itens] =
                await connection.query(
                    `
                    SELECT
                        oi.produto_id,
                        oi.quantidade,
                        oi.preco,

                        i.nome,
                        i.quantidade AS estoque,
                        i.status

                    FROM orcamento_itens oi

                    INNER JOIN itens i
                        ON i.id = oi.produto_id

                    WHERE oi.orcamento_id = ?
                    `,
                    [
                        id
                    ]
                );


            if (
                itens.length === 0
            ) {

                await connection.rollback();

                return res.status(400).json({
                    erro:
                        "O orçamento não possui produtos."
                });

            }


            // =================================================
            // VERIFICAR ESTOQUE
            // =================================================

            for (
                const item of itens
            ) {

                if (
                    String(
                        item.status
                    ).toLowerCase() !== "ativo"
                ) {

                    await connection.rollback();

                    return res.status(400).json({
                        erro:
                            `O produto "${item.nome}" não está mais disponível.`
                    });

                }


                if (
                    Number(
                        item.estoque
                    ) <
                    Number(
                        item.quantidade
                    )
                ) {

                    await connection.rollback();

                    return res.status(400).json({
                        erro:
                            `Estoque insuficiente para "${item.nome}".`
                    });

                }

            }


            // =================================================
            // CRIAR PEDIDO
            // =================================================

            const [resultadoPedido] =
                await connection.query(
                    `
                    INSERT INTO pedidos
                    (
                        usuario_id,
                        total,
                        metodo_pagamento,
                        status
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        orcamento.usuario_id,
                        orcamento.total,
                        metodo_pagamento,
                        "Pendente"
                    ]
                );


            const pedidoId =
                resultadoPedido.insertId;


            // =================================================
            // CRIAR ITENS DO PEDIDO
            // =================================================

            for (
                const item of itens
            ) {

                await connection.query(
                    `
                    INSERT INTO itens_pedidos
                    (
                        pedido_id,
                        produto_id,
                        quantidade,
                        preco
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        pedidoId,
                        item.produto_id,
                        item.quantidade,
                        item.preco
                    ]
                );


                // =============================================
                // DIMINUIR ESTOQUE
                // =============================================

                await connection.query(
                    `
                    UPDATE itens

                    SET quantidade =
                        quantidade - ?

                    WHERE id = ?
                    `,
                    [
                        item.quantidade,
                        item.produto_id
                    ]
                );

            }


            // =================================================
            // MARCAR ORÇAMENTO COMO CONVERTIDO
            // =================================================

            await connection.query(
                `
                UPDATE orcamentos

                SET status = 'convertido'

                WHERE id = ?
                `,
                [
                    id
                ]
            );

            await registrarAtividade(connection, {
                usuario_id: Number(orcamento.usuario_id),
                tipo: "orcamento",
                acao: "converter",
                titulo: `Orcamento #${id} convertido`,
                descricao: `O orcamento originou o pedido #${pedidoId}.`,
                referencia_id: Number(id),
                valor_anterior: orcamento.status,
                valor_novo: "convertido"
            });


            await connection.commit();


            return res.status(201).json({

                mensagem:
                    "Orçamento convertido em pedido com sucesso.",

                pedido_id:
                    pedidoId,

                orcamento_id:
                    Number(id)

            });

        } catch (error) {

            await connection.rollback();

            console.error(
                "Erro ao converter orçamento:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao converter orçamento.",

                detalhe:
                    error.message

            });

        } finally {

            connection.release();

        }

    }
);


// =====================================================
// EXCLUIR ORÇAMENTO
// =====================================================

router.delete(
    "/:id",
    async (req, res) => {

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();


            const {
                id
            } = req.params;


            // =================================================
            // VERIFICAR
            // =================================================

            const [orcamentos] =
                await connection.query(
                    `
                    SELECT
                        id,
                        status

                    FROM orcamentos

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                orcamentos.length === 0
            ) {

                await connection.rollback();

                return res.status(404).json({
                    erro:
                        "Orçamento não encontrado."
                });

            }


            // =================================================
            // EXCLUIR ITENS
            // =================================================

            await connection.query(
                `
                DELETE FROM orcamento_itens

                WHERE orcamento_id = ?
                `,
                [
                    id
                ]
            );


            // =================================================
            // EXCLUIR ORÇAMENTO
            // =================================================

            await connection.query(
                `
                DELETE FROM orcamentos

                WHERE id = ?
                `,
                [
                    id
                ]
            );


            await connection.commit();


            return res.status(200).json({
                mensagem:
                    "Orçamento excluído com sucesso."
            });

        } catch (error) {

            await connection.rollback();

            console.error(
                "Erro ao excluir orçamento:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao excluir orçamento.",

                detalhe:
                    error.message

            });

        } finally {

            connection.release();

        }

    }
);


export default router;
