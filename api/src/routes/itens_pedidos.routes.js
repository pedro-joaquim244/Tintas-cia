import express from "express";
import pool from "../database.js";

const router = express.Router();


// =====================================================
// BUSCAR ITENS DE UM PEDIDO
// =====================================================

router.get("/pedido/:pedido_id", async (req, res) => {

    try {

        const { pedido_id } = req.params;

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
            [pedido_id]
        );

        return res.json(
            itens.map(item => ({
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
        );

    } catch (error) {

        console.error(
            "ERRO AO BUSCAR ITENS DO PEDIDO:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao buscar itens do pedido.",
            detalhes: error.message
        });

    }

});


// =====================================================
// BUSCAR TODOS OS ITENS DE UM USUÁRIO
// =====================================================

router.get("/usuario/:usuario_id", async (req, res) => {

    try {

        const { usuario_id } = req.params;

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
                i.foto,

                p.status,
                p.metodo_pagamento,
                p.criado_em

            FROM itens_pedidos ip

            INNER JOIN pedidos p
                ON p.id = ip.pedido_id

            LEFT JOIN itens i
                ON i.id = ip.produto_id

            WHERE p.usuario_id = ?

            ORDER BY p.criado_em DESC, ip.id ASC
            `,
            [usuario_id]
        );

        return res.json(
            itens.map(item => ({
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
                    item.foto || null,

                status:
                    item.status,

                metodo_pagamento:
                    item.metodo_pagamento,

                criado_em:
                    item.criado_em
            }))
        );

    } catch (error) {

        console.error(
            "ERRO AO BUSCAR ITENS DO USUÁRIO:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao buscar itens dos pedidos.",
            detalhes: error.message
        });

    }

});


export default router;