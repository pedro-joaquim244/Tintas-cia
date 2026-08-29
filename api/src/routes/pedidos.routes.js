import express from "express";
import pool from "../database.js";

const router = express.Router();

const RANKS_FIDELIDADE = [
    { nome: "Bronze", pontos: 0, desconto: 0 },
    { nome: "Prata", pontos: 500, desconto: 5 },
    { nome: "Ouro", pontos: 1500, desconto: 10 },
    { nome: "Platina", pontos: 3000, desconto: 15 }
];

function obterRankFidelidade(pontos) {
    return [...RANKS_FIDELIDADE]
        .reverse()
        .find((rank) => pontos >= rank.pontos);
}

function gerarCodigoFidelidade(rank) {
    return rank.toUpperCase();
}


// =====================================================
// FINALIZAR COMPRA
// POST /pedidos
// =====================================================

router.post("/", async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const {
            usuario_id,
            metodo_pagamento,
            cupom_id
        } = req.body;


        // =================================================
        // VALIDAR USUÁRIO
        // =================================================

        if (!usuario_id) {

            return res.status(400).json({
                mensagem: "Usuário não informado."
            });

        }


        // =================================================
        // VALIDAR PAGAMENTO
        // =================================================

        if (!metodo_pagamento) {

            return res.status(400).json({
                mensagem: "Forma de pagamento não informada."
            });

        }


        // =================================================
        // INICIAR TRANSAÇÃO
        // =================================================

        await connection.beginTransaction();


        // =================================================
        // BUSCAR CARRINHO
        // =================================================

        const [carrinho] = await connection.query(
            `
            SELECT
                c.id,
                c.usuario_id,
                c.produto_id,
                c.quantidade,
                i.nome,
                i.preco,
                i.quantidade AS estoque_disponivel

            FROM carrinho c

            INNER JOIN itens i
                ON i.id = c.produto_id

            WHERE c.usuario_id = ?

            ORDER BY c.id ASC
            FOR UPDATE
            `,
            [usuario_id]
        );


        // =================================================
        // CARRINHO VAZIO
        // =================================================

        if (carrinho.length === 0) {

            await connection.rollback();

            return res.status(400).json({
                mensagem: "O carrinho está vazio."
            });

        }

        for (const produto of carrinho) {
            if (Number(produto.quantidade) > Number(produto.estoque_disponivel)) {
                await connection.rollback();

                return res.status(409).json({
                    mensagem: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque_disponivel} unidade(s).`
                });
            }
        }


        // =================================================
        // CALCULAR SUBTOTAL
        // =================================================

        let subtotal = 0;

        for (const produto of carrinho) {

            subtotal +=
                Number(produto.preco) *
                Number(produto.quantidade);

        }


        // =================================================
        // FRETE
        // =================================================

        const frete =
            subtotal > 0
                ? 29.90
                : 0;


        // =================================================
        // CUPOM
        // =================================================

        let desconto = 0;

        let codigoCupom = null;

        let cupomUtilizado = null;


        if (cupom_id) {

            const [cupons] =
                await connection.query(
                    `
                    SELECT
                        id,
                        codigo,
                        tipo,
                        desconto AS valor

                    FROM cupons

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [cupom_id]
                );


            if (cupons.length === 0) {

                await connection.rollback();

                return res.status(400).json({
                    mensagem: "Cupom não encontrado."
                });

            }


            cupomUtilizado = cupons[0];

            codigoCupom =
                cupomUtilizado.codigo;


            // =============================================
            // CUPOM PERCENTUAL
            // =============================================

            if (
                cupomUtilizado.tipo === "percentual" ||
                cupomUtilizado.tipo === "porcentagem"
            ) {

                desconto =
                    subtotal *
                    (
                        Number(
                            cupomUtilizado.valor
                        ) / 100
                    );

            }


            // =============================================
            // CUPOM VALOR FIXO
            // =============================================

            else {

                desconto =
                    Number(
                        cupomUtilizado.valor
                    );

            }


            // =============================================
            // LIMITAR DESCONTO
            // =============================================

            if (desconto > subtotal) {

                desconto = subtotal;

            }

        }


        // =================================================
        // TOTAL
        // =================================================

        const total =
            Math.max(
                subtotal +
                frete -
                desconto,
                0
            );


        // =================================================
        // CRIAR PEDIDO
        // =================================================

        const [resultadoPedido] =
            await connection.query(
                `
                INSERT INTO pedidos (
                    usuario_id,
                    total,
                    metodo_pagamento,
                    status,
                    cupom_id,
                    codigo_cupom,
                    desconto
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    usuario_id,
                    total,
                    metodo_pagamento,
                    "pendente",
                    cupomUtilizado
                        ? cupomUtilizado.id
                        : null,
                    codigoCupom,
                    desconto
                ]
            );


        const pedidoId =
            resultadoPedido.insertId;


        // =================================================
        // INSERIR ITENS DO PEDIDO
        // =================================================

        for (const produto of carrinho) {
            await connection.query(
                `
                INSERT INTO itens_pedidos (
                    pedido_id,
                    produto_id,
                    quantidade,
                    preco
                )

                VALUES (?, ?, ?, ?)
                `,
                [
                    pedidoId,
                    produto.produto_id,
                    produto.quantidade,
                    produto.preco
                ]
            );

        }


        // =================================================
        // FIDELIDADE
        // 1 ponto para cada real efetivamente pago.
        // Ao subir de rank, o cupom correspondente é criado
        // na mesma transação do pedido.
        // =================================================

        const pontosGanhos = Math.floor(Number(total));
        let saldoPontos = 0;
        let cupomFidelidade = null;

        const [usuarios] = await connection.query(
            `
            SELECT id, pontos
            FROM usuarios
            WHERE id = ?
            FOR UPDATE
            `,
            [usuario_id]
        );

        if (usuarios.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const saldoAnterior = Number(usuarios[0].pontos || 0);
        const rankAnterior = obterRankFidelidade(saldoAnterior);

        saldoPontos = saldoAnterior + pontosGanhos;
        const rankAtual = obterRankFidelidade(saldoPontos);

        await connection.query(
            `UPDATE usuarios SET pontos = ? WHERE id = ?`,
            [saldoPontos, usuario_id]
        );

        if (pontosGanhos > 0) {
            await connection.query(
                `
                INSERT INTO historico_pontos
                    (usuario_id, pedido_id, pontos, tipo, descricao)
                VALUES (?, ?, ?, 'GANHO', ?)
                `,
                [
                    usuario_id,
                    pedidoId,
                    pontosGanhos,
                    `Pontos da compra #${pedidoId}`
                ]
            );
        }

        const subiuDeRank = rankAtual.pontos > rankAnterior.pontos;

        if (subiuDeRank) {
            const codigo = gerarCodigoFidelidade(rankAtual.nome);
            const [cuponsDoRank] = await connection.query(
                `SELECT id FROM cupons WHERE codigo = ? LIMIT 1`,
                [codigo]
            );

            let cupomId = cuponsDoRank[0]?.id;

            if (!cupomId) {
                const [resultadoCupom] = await connection.query(
                    `
                    INSERT INTO cupons
                        (codigo, tipo, desconto, valor_minimo, limite_uso,
                         usos, validade_inicio, validade_fim, status)
                    VALUES (?, 'porcentagem', ?, 0, NULL, 0, NULL, NULL, 'Ativo')
                    `,
                    [
                        codigo,
                        rankAtual.desconto
                    ]
                );

                cupomId = resultadoCupom.insertId;
            }

            cupomFidelidade = {
                id: cupomId,
                codigo,
                rank: rankAtual.nome,
                tipo: "porcentagem",
                desconto: rankAtual.desconto,
                validade_fim: null
            };
        }


        // =================================================
        // LIMPAR CARRINHO
        // =================================================

        await connection.query(
            `
            DELETE FROM carrinho

            WHERE usuario_id = ?
            `,
            [usuario_id]
        );


        // =================================================
        // FINALIZAR TRANSAÇÃO
        // =================================================

        await connection.commit();


        // =================================================
        // RESPOSTA
        // =================================================

        return res.status(201).json({

            mensagem:
                "Compra realizada com sucesso.",

            pedido: {

                id:
                    pedidoId,

                usuario_id:
                    Number(usuario_id),

                subtotal:
                    Number(subtotal),

                frete:
                    Number(frete),

                desconto:
                    Number(desconto),

                total:
                    Number(total),

                metodo_pagamento:
                    metodo_pagamento,

                status:
                    "pendente",

                cupom_id:
                    cupomUtilizado
                        ? cupomUtilizado.id
                        : null,

                codigo_cupom:
                    codigoCupom

            },

            fidelidade: {
                pontos_ganhos: pontosGanhos,
                saldo_atual: saldoPontos,
                rank_anterior: rankAnterior.nome,
                rank_atual: rankAtual.nome,
                subiu_de_rank: subiuDeRank,
                cupom: cupomFidelidade
            }

        });


    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            "ERRO AO FINALIZAR COMPRA:",
            error
        );


        return res.status(500).json({

            mensagem:
                "Erro ao finalizar compra.",

            detalhes:
                error.message

        });


    } finally {

        if (connection) {
            connection.release();
        }

    }

});


// =====================================================
// LISTAR TODOS OS PEDIDOS
// GET /pedidos
// =====================================================

router.get("/", async (req, res) => {

    try {

        const [pedidos] =
            await pool.query(
                `
                SELECT
                    p.id,
                    p.usuario_id,

                    u.nome AS cliente,
                    u.email AS email_cliente,
                    u.telefone AS telefone_cliente,

                    p.total,
                    p.metodo_pagamento,
                    p.status,
                    p.criado_em,
                    p.cupom_id,
                    p.codigo_cupom,
                    p.desconto

                FROM pedidos p

                INNER JOIN usuarios u
                    ON u.id = p.usuario_id

                ORDER BY
                    p.criado_em DESC,
                    p.id DESC
                `
            );


        return res.json(

            pedidos.map(pedido => ({

                id:
                    pedido.id,

                usuario_id:
                    pedido.usuario_id,

                cliente:
                    pedido.cliente,

                email_cliente:
                    pedido.email_cliente,

                telefone_cliente:
                    pedido.telefone_cliente,

                total:
                    Number(
                        pedido.total || 0
                    ),

                metodo_pagamento:
                    pedido.metodo_pagamento,

                status:
                    pedido.status,

                criado_em:
                    pedido.criado_em,

                cupom_id:
                    pedido.cupom_id,

                codigo_cupom:
                    pedido.codigo_cupom,

                desconto:
                    Number(
                        pedido.desconto || 0
                    )

            }))

        );


    } catch (error) {

        console.error(
            "ERRO AO BUSCAR TODOS OS PEDIDOS:",
            error
        );


        return res.status(500).json({

            erro:
                "Erro ao buscar pedidos.",

            detalhes:
                error.message

        });

    }

});


// =====================================================
// ALTERAR STATUS DO PEDIDO
// PUT /pedidos/:id/status
// =====================================================

router.put("/:id/status", async (req, res) => {

    let connection;

    try {

        connection = await pool.getConnection();

        const { id } =
            req.params;

        const { status } =
            req.body;


        // =================================================
        // STATUS PERMITIDOS
        // =================================================

        const statusPermitidos = [

            "pendente",

            "processando",

            "em transporte",

            "entregue",

            "cancelado"

        ];


        // =================================================
        // VALIDAR STATUS
        // =================================================

        if (!status) {

            return res.status(400).json({

                erro:
                    "Status não informado."

            });

        }


        const statusNormalizado =
            String(status)
                .trim()
                .toLowerCase();


        if (
            !statusPermitidos.includes(
                statusNormalizado
            )
        ) {

            return res.status(400).json({

                erro:
                    "Status inválido.",

                statusPermitidos

            });

        }


        // =================================================
        // VERIFICAR PEDIDO
        // =================================================

        await connection.beginTransaction();

        const [pedidoExistente] =
            await connection.query(
                `
                SELECT
                    id,
                    status

                FROM pedidos

                WHERE id = ?

                LIMIT 1
                `,
                [id]
            );


        if (
            pedidoExistente.length === 0
        ) {

            await connection.rollback();

            return res.status(404).json({

                erro:
                    "Pedido não encontrado."

            });

        }

        const pedidoAtual = pedidoExistente[0];
        const deveBaixarEstoque =
            pedidoAtual.status === "pendente" &&
            ["processando", "em transporte", "entregue"].includes(statusNormalizado);

        if (deveBaixarEstoque) {
            const [itensPedido] = await connection.query(
                `
                SELECT ip.produto_id, ip.quantidade, i.nome
                FROM itens_pedidos ip
                INNER JOIN itens i ON i.id = ip.produto_id
                WHERE ip.pedido_id = ?
                FOR UPDATE
                `,
                [id]
            );

            for (const item of itensPedido) {
                const [estoque] = await connection.query(
                    `SELECT quantidade FROM itens WHERE id = ? FOR UPDATE`,
                    [item.produto_id]
                );

                if (!estoque.length || Number(estoque[0].quantidade) < Number(item.quantidade)) {
                    await connection.rollback();
                    return res.status(409).json({
                        erro: `Estoque insuficiente para ${item.nome}.`
                    });
                }
            }

            for (const item of itensPedido) {
                await connection.query(
                    `
                    UPDATE itens
                    SET
                        status = CASE
                            WHEN quantidade = ? THEN 'Inativo'
                            ELSE status
                        END,
                        quantidade = quantidade - ?
                    WHERE id = ?
                    `,
                    [item.quantidade, item.quantidade, item.produto_id]
                );
            }

        }


        // =================================================
        // ATUALIZAR STATUS
        // =================================================

        await connection.query(
            `
            UPDATE pedidos

            SET status = ?

            WHERE id = ?
            `,
            [
                statusNormalizado,
                id
            ]
        );


        // =================================================
        // BUSCAR PEDIDO ATUALIZADO
        // =================================================

        const [pedidoAtualizado] =
            await connection.query(
                `
                SELECT
                    p.id,
                    p.usuario_id,

                    u.nome AS cliente,
                    u.email AS email_cliente,
                    u.telefone AS telefone_cliente,

                    p.total,
                    p.metodo_pagamento,
                    p.status,
                    p.criado_em,
                    p.cupom_id,
                    p.codigo_cupom,
                    p.desconto

                FROM pedidos p

                INNER JOIN usuarios u
                    ON u.id = p.usuario_id

                WHERE p.id = ?

                LIMIT 1
                `,
                [id]
            );


        // =================================================
        // RESPOSTA
        // =================================================

        await connection.commit();

        return res.json({

            mensagem:
                "Status do pedido atualizado com sucesso.",

            pedido: {

                ...pedidoAtualizado[0],

                total:
                    Number(
                        pedidoAtualizado[0].total || 0
                    ),

                desconto:
                    Number(
                        pedidoAtualizado[0].desconto || 0
                    )

            }

        });


    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            "ERRO AO ALTERAR STATUS:",
            error
        );


        return res.status(500).json({

            erro:
                "Erro ao alterar status do pedido.",

            detalhes:
                error.message

        });

    } finally {
        if (connection) {
            connection.release();
        }
    }

});


// =====================================================
// HISTÓRICO DE PEDIDOS DO USUÁRIO
// GET /pedidos/usuario/:usuario_id
// =====================================================

router.get(
    "/usuario/:usuario_id",
    async (req, res) => {

        try {

            const { usuario_id } =
                req.params;


            // =================================================
            // VALIDAR USUÁRIO
            // =================================================

            if (!usuario_id) {

                return res.status(400).json({

                    erro:
                        "ID do usuário não informado."

                });

            }


            // =================================================
            // BUSCAR PEDIDOS
            // =================================================

            const [pedidos] =
                await pool.query(
                    `
                    SELECT
                        p.id,
                        p.usuario_id,

                        u.nome AS cliente,
                        u.email AS email_cliente,

                        p.total,
                        p.metodo_pagamento,
                        p.status,
                        p.criado_em,
                        p.cupom_id,
                        p.codigo_cupom,
                        p.desconto

                    FROM pedidos p

                    INNER JOIN usuarios u
                        ON u.id = p.usuario_id

                    WHERE p.usuario_id = ?

                    ORDER BY
                        p.criado_em DESC,
                        p.id DESC
                    `,
                    [usuario_id]
                );


            // =================================================
            // NENHUM PEDIDO
            // =================================================

            if (
                pedidos.length === 0
            ) {

                return res.json([]);

            }


            // =================================================
            // IDS DOS PEDIDOS
            // =================================================

            const idsPedidos =
                pedidos.map(
                    pedido =>
                        pedido.id
                );


            // =================================================
            // BUSCAR ITENS
            // =================================================

            const [itens] =
                await pool.query(
                    `
                    SELECT
                        ip.id,
                        ip.pedido_id,
                        ip.produto_id,
                        ip.quantidade,
                        ip.preco,

                        (
                            ip.quantidade *
                            ip.preco
                        ) AS subtotal,

                        i.nome,
                        i.descricao,
                        i.foto

                    FROM itens_pedidos ip

                    LEFT JOIN itens i
                        ON i.id = ip.produto_id

                    WHERE ip.pedido_id IN (?)

                    ORDER BY
                        ip.pedido_id DESC,
                        ip.id ASC
                    `,
                    [idsPedidos]
                );


            // =================================================
            // MONTAR PEDIDOS COM ITENS
            // =================================================

            const pedidosComItens =
                pedidos.map(
                    pedido => {

                        const itensDoPedido =
                            itens
                                .filter(
                                    item =>
                                        Number(
                                            item.pedido_id
                                        ) ===
                                        Number(
                                            pedido.id
                                        )
                                )
                                .map(
                                    item => ({

                                        id:
                                            item.id,

                                        pedido_id:
                                            item.pedido_id,

                                        produto_id:
                                            item.produto_id,

                                        nome:
                                            item.nome ||
                                            "Produto não encontrado",

                                        descricao:
                                            item.descricao ||
                                            "",

                                        quantidade:
                                            Number(
                                                item.quantidade
                                            ),

                                        preco:
                                            Number(
                                                item.preco
                                            ),

                                        subtotal:
                                            Number(
                                                item.subtotal
                                            ),

                                        foto:
                                            item.foto ||
                                            null

                                    })
                                );


                        return {

                            id:
                                pedido.id,

                            usuario_id:
                                pedido.usuario_id,

                            cliente:
                                pedido.cliente,

                            email_cliente:
                                pedido.email_cliente,

                            total:
                                Number(
                                    pedido.total || 0
                                ),

                            metodo_pagamento:
                                pedido.metodo_pagamento,

                            status:
                                pedido.status,

                            criado_em:
                                pedido.criado_em,

                            cupom_id:
                                pedido.cupom_id,

                            codigo_cupom:
                                pedido.codigo_cupom,

                            desconto:
                                Number(
                                    pedido.desconto || 0
                                ),

                            itens:
                                itensDoPedido

                        };

                    }
                );


            return res.json(
                pedidosComItens
            );


        } catch (error) {

            console.error(
                "ERRO AO BUSCAR HISTÓRICO:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar histórico de pedidos.",

                detalhes:
                    error.message

            });

        }

    }
);


// =====================================================
// BUSCAR PEDIDO ESPECÍFICO
// GET /pedidos/:id
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const { id } =
            req.params;


        // =================================================
        // BUSCAR PEDIDO + CLIENTE
        // =================================================

        const [pedidos] =
            await pool.query(
                `
                SELECT
                    p.id,
                    p.usuario_id,

                    u.nome AS cliente,
                    u.email AS email_cliente,
                    u.telefone AS telefone_cliente,

                    p.total,
                    p.metodo_pagamento,
                    p.status,
                    p.criado_em,
                    p.cupom_id,
                    p.codigo_cupom,
                    p.desconto

                FROM pedidos p

                INNER JOIN usuarios u
                    ON u.id = p.usuario_id

                WHERE p.id = ?

                LIMIT 1
                `,
                [id]
            );


        // =================================================
        // PEDIDO NÃO ENCONTRADO
        // =================================================

        if (
            pedidos.length === 0
        ) {

            return res.status(404).json({

                erro:
                    "Pedido não encontrado."

            });

        }


        const pedido =
            pedidos[0];


        // =================================================
        // BUSCAR ITENS
        // =================================================

        const [itens] =
            await pool.query(
                `
                SELECT
                    ip.id,
                    ip.pedido_id,
                    ip.produto_id,
                    ip.quantidade,
                    ip.preco,

                    (
                        ip.quantidade *
                        ip.preco
                    ) AS subtotal,

                    i.nome,
                    i.descricao,
                    i.foto

                FROM itens_pedidos ip

                LEFT JOIN itens i
                    ON i.id = ip.produto_id

                WHERE ip.pedido_id = ?

                ORDER BY ip.id ASC
                `,
                [id]
            );


        // =================================================
        // RESPOSTA
        // =================================================

        return res.json({

            id:
                pedido.id,

            usuario_id:
                pedido.usuario_id,

            cliente:
                pedido.cliente,

            email_cliente:
                pedido.email_cliente,

            telefone_cliente:
                pedido.telefone_cliente,

            total:
                Number(
                    pedido.total || 0
                ),

            metodo_pagamento:
                pedido.metodo_pagamento,

            status:
                pedido.status,

            criado_em:
                pedido.criado_em,

            cupom_id:
                pedido.cupom_id,

            codigo_cupom:
                pedido.codigo_cupom,

            desconto:
                Number(
                    pedido.desconto || 0
                ),

            itens:
                itens.map(
                    item => ({

                        id:
                            item.id,

                        pedido_id:
                            item.pedido_id,

                        produto_id:
                            item.produto_id,

                        nome:
                            item.nome ||
                            "Produto não encontrado",

                        descricao:
                            item.descricao ||
                            "",

                        quantidade:
                            Number(
                                item.quantidade
                            ),

                        preco:
                            Number(
                                item.preco
                            ),

                        subtotal:
                            Number(
                                item.subtotal
                            ),

                        foto:
                            item.foto ||
                            null

                    })
                )

        });


    } catch (error) {

        console.error(
            "ERRO AO BUSCAR PEDIDO:",
            error
        );


        return res.status(500).json({

            erro:
                "Erro ao buscar pedido.",

            detalhes:
                error.message

        });

    }

});


export default router;
