import express from "express";
import pool from "../database.js";

const router = express.Router();

// =====================================================
// HISTÓRICO DE PEDIDOS DO USUÁRIO
// =====================================================

router.get("/usuario/:usuario_id", async (req, res) => {
    try {
        const { usuario_id } = req.params;

        if (!usuario_id) {
            return res.status(400).json({
                erro: "ID do usuário não informado."
            });
        }

        console.log("=================================");
        console.log("BUSCANDO PEDIDOS");
        console.log("Usuário:", usuario_id);
        console.log("=================================");

        // =================================================
        // BUSCAR PEDIDOS
        // =================================================

        const [pedidos] = await pool.query(
            `
            SELECT
                p.id,
                p.usuario_id,
                p.total,
                p.metodo_pagamento,
                p.status,
                p.criado_em
            FROM pedidos p
            WHERE p.usuario_id = ?
            ORDER BY p.criado_em DESC, p.id DESC
            `,
            [usuario_id]
        );

        console.log("Pedidos encontrados:", pedidos.length);

        // Se não existem pedidos
        if (pedidos.length === 0) {
            return res.json([]);
        }

        // =================================================
        // PEGAR IDS DOS PEDIDOS
        // =================================================

        const idsPedidos = pedidos.map(
            pedido => pedido.id
        );

        // =================================================
        // BUSCAR ITENS
        // =================================================

        const [itens] = await pool.query(
            `
            SELECT
                ip.id,
                ip.pedido_id,
                ip.produto_id,
                ip.quantidade,
                ip.preco,

                (ip.quantidade * ip.preco) AS subtotal,

                i.nome,
                i.descricao,
                i.foto

            FROM itens_pedidos ip

            LEFT JOIN itens i
                ON i.id = ip.produto_id

            WHERE ip.pedido_id IN (?)

            ORDER BY ip.pedido_id DESC, ip.id ASC
            `,
            [idsPedidos]
        );

        console.log("Itens encontrados:", itens.length);

        // =================================================
        // MONTAR PEDIDOS COM ITENS
        // =================================================

        const pedidosComItens = pedidos.map(pedido => {

            const itensDoPedido = itens
                .filter(
                    item =>
                        Number(item.pedido_id) ===
                        Number(pedido.id)
                )
                .map(item => ({
                    id: item.id,
                    pedido_id: item.pedido_id,
                    produto_id: item.produto_id,

                    nome:
                        item.nome ||
                        "Produto não encontrado",

                    descricao:
                        item.descricao || "",

                    quantidade:
                        Number(item.quantidade),

                    preco:
                        Number(item.preco),

                    subtotal:
                        Number(item.subtotal),

                    foto:
                        item.foto || null
                }));

            return {
                id: pedido.id,

                usuario_id:
                    pedido.usuario_id,

                total:
                    Number(pedido.total),

                metodo_pagamento:
                    pedido.metodo_pagamento,

                status:
                    pedido.status,

                criado_em:
                    pedido.criado_em,

                itens:
                    itensDoPedido
            };
        });

        console.log(
            "Pedidos com itens:",
            JSON.stringify(pedidosComItens, null, 2)
        );

        return res.json(pedidosComItens);

    } catch (error) {

        console.error(
            "ERRO AO BUSCAR HISTÓRICO DE PEDIDOS:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao buscar histórico de pedidos.",
            detalhes: error.message
        });
    }
});


// =====================================================
// BUSCAR UM PEDIDO ESPECÍFICO
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const [pedidos] = await pool.query(
            `
            SELECT
                p.id,
                p.usuario_id,
                p.total,
                p.metodo_pagamento,
                p.status,
                p.criado_em
            FROM pedidos p
            WHERE p.id = ?
            `,
            [id]
        );

        if (pedidos.length === 0) {

            return res.status(404).json({
                erro: "Pedido não encontrado."
            });

        }

        const pedido = pedidos[0];

        const [itens] = await pool.query(
            `
            SELECT
                ip.id,
                ip.pedido_id,
                ip.produto_id,
                ip.quantidade,
                ip.preco,

                (ip.quantidade * ip.preco) AS subtotal,

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

        return res.json({
            id: pedido.id,

            usuario_id:
                pedido.usuario_id,

            total:
                Number(pedido.total),

            metodo_pagamento:
                pedido.metodo_pagamento,

            status:
                pedido.status,

            criado_em:
                pedido.criado_em,

            itens: itens.map(item => ({
                id: item.id,
                pedido_id: item.pedido_id,
                produto_id: item.produto_id,

                nome:
                    item.nome ||
                    "Produto não encontrado",

                descricao:
                    item.descricao || "",

                quantidade:
                    Number(item.quantidade),

                preco:
                    Number(item.preco),

                subtotal:
                    Number(item.subtotal),

                foto:
                    item.foto || null
            }))
        });

    } catch (error) {

        console.error(
            "ERRO AO BUSCAR PEDIDO:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao buscar pedido.",
            detalhes: error.message
        });

    }

});

export default router;