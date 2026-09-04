import express from "express";
import pool from "../database.js";
import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";

const router = express.Router();


// =====================================================
// RESUMO PÃšBLICO
// =====================================================

router.get("/resumo-publico", async (req, res) => {

    try {

        const [[resumo]] = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM itens) AS produtos,
                (SELECT COUNT(*) FROM pedidos) AS pedidos,
                (
                    SELECT COUNT(*)
                    FROM usuarios
                    WHERE tipo = 'cliente'
                ) AS clientes
        `);


        return res.status(200).json({

            resumo: {

                clientes:
                    Number(resumo.clientes),

                pedidos:
                    Number(resumo.pedidos),

                produtos:
                    Number(resumo.produtos)

            }

        });

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR RESUMO PÃšBLICO:",
            error
        );

        return res.status(500).json({

            erro:
                "Erro ao carregar resumo pÃºblico."

        });

    }

});


// =====================================================
// DASHBOARD ADMINISTRATIVO
// =====================================================

router.get(
    "/",
    autenticarToken,
    autorizarTipos("admin"),
    async (req, res) => {

    try {

        // =================================================
        // TOTAL DE PRODUTOS
        // =================================================

        const [[produtos]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM itens
        `);


        // =================================================
        // TOTAL DE PEDIDOS
        // =================================================

        const [[pedidos]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM pedidos
        `);


        // =================================================
        // TOTAL DE CLIENTES
        // =================================================

        const [[clientes]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM usuarios
            WHERE tipo = 'cliente'
        `);


        // =================================================
        // FATURAMENTO TOTAL
        // =================================================

        const [[faturamento]] = await pool.query(`
            SELECT
                COALESCE(SUM(total), 0) AS total
            FROM pedidos
        `);


        // =================================================
        // PEDIDOS PENDENTES
        // =================================================

        const [[pendentes]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM pedidos
            WHERE LOWER(status) IN (
                'pendente',
                'aguardando pagamento',
                'aguardando_pagamento'
            )
        `);


        // =================================================
        // FATURAMENTO DOS ÚLTIMOS 7 DIAS
        // =================================================

        const [vendasSemana] = await pool.query(`
            SELECT
                DATE(criado_em) AS data,
                COUNT(*) AS pedidos,
                COALESCE(SUM(total), 0) AS faturamento
            FROM pedidos
            WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(criado_em)
            ORDER BY data ASC
        `);


        // =================================================
        // VENDAS RECENTES
        // =================================================

        const [vendasRecentes] = await pool.query(`
            SELECT
                p.id,
                p.usuario_id,
                p.total,
                p.metodo_pagamento,
                p.status,
                p.criado_em,

                u.nome AS cliente,

                (
                    SELECT i.nome
                    FROM itens_pedidos ip
                    INNER JOIN itens i
                        ON i.id = ip.produto_id
                    WHERE ip.pedido_id = p.id
                    ORDER BY ip.id ASC
                    LIMIT 1
                ) AS produto

            FROM pedidos p

            LEFT JOIN usuarios u
                ON u.id = p.usuario_id

            ORDER BY p.criado_em DESC, p.id DESC

            LIMIT 10
        `);


        // =================================================
        // PRODUTOS COM ESTOQUE BAIXO
        // =================================================

        const [estoqueBaixo] = await pool.query(`
            SELECT
                id,
                nome,
                quantidade,
                preco,
                foto
            FROM itens
            WHERE quantidade < 5
            ORDER BY quantidade ASC
            LIMIT 10
        `);


        // =================================================
        // PEDIDOS DA SEMANA
        // =================================================

        const [[pedidosSemana]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM pedidos
            WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        `);


        // =================================================
        // FATURAMENTO DA SEMANA
        // =================================================

        const [[faturamentoSemana]] = await pool.query(`
            SELECT
                COALESCE(SUM(total), 0) AS total
            FROM pedidos
            WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        `);


        // =================================================
        // RESPOSTA
        // =================================================

        return res.json({

            resumo: {

                produtos:
                    Number(produtos.total),

                pedidos:
                    Number(pedidos.total),

                clientes:
                    Number(clientes.total),

                faturamento:
                    Number(faturamento.total),

                pedidos_pendentes:
                    Number(pendentes.total),

                pedidos_semana:
                    Number(pedidosSemana.total),

                faturamento_semana:
                    Number(faturamentoSemana.total)

            },

            vendasSemana:

                vendasSemana.map(venda => ({

                    data:
                        venda.data,

                    pedidos:
                        Number(venda.pedidos),

                    faturamento:
                        Number(venda.faturamento)

                })),

            vendasRecentes:

                vendasRecentes.map(venda => ({

                    id:
                        venda.id,

                    usuario_id:
                        venda.usuario_id,

                    cliente:
                        venda.cliente ||
                        "Cliente não encontrado",

                    produto:
                        venda.produto ||
                        "Produto não encontrado",

                    total:
                        Number(venda.total),

                    metodo_pagamento:
                        venda.metodo_pagamento,

                    status:
                        venda.status,

                    criado_em:
                        venda.criado_em

                })),

            estoqueBaixo:

                estoqueBaixo.map(item => ({

                    id:
                        item.id,

                    nome:
                        item.nome,

                    quantidade:
                        Number(item.quantidade),

                    preco:
                        Number(item.preco),

                    foto:
                        item.foto || null

                }))

        });

    } catch (error) {

        console.error(
            "ERRO AO CARREGAR DASHBOARD:",
            error
        );

        return res.status(500).json({

            erro:
                "Erro ao carregar dados do dashboard.",

            detalhes:
                error.message

        });

    }

    }
);


export default router;
