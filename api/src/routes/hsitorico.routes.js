import express from "express";
import db from "../database.js";

const router = express.Router();


async function garantirTabelaVisualizacoes() {
    await db.query(
        `
        CREATE TABLE IF NOT EXISTS visualizacoes_produtos (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            produto_id INT UNSIGNED NOT NULL,
            usuario_id INT UNSIGNED NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_visualizacoes_produto (produto_id),
            KEY idx_visualizacoes_usuario (usuario_id),
            KEY idx_visualizacoes_criado_em (criado_em),
            CONSTRAINT fk_visualizacoes_produto
                FOREIGN KEY (produto_id) REFERENCES itens (id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_visualizacoes_usuario
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
                ON DELETE SET NULL ON UPDATE CASCADE
        )
        `
    );
}


// =====================================================
// AUXILIAR — FILTRO DE PERÍODO
// =====================================================

function obterFiltroPeriodo(periodo, coluna = "criado_em") {

    const periodos = {
        "7": `AND ${coluna} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        "30": `AND ${coluna} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        "90": `AND ${coluna} >= DATE_SUB(NOW(), INTERVAL 90 DAY)`,
        "365": `AND ${coluna} >= DATE_SUB(NOW(), INTERVAL 365 DAY)`,
        "todos": ""
    };


    return (
        periodos[String(periodo)] ||
        periodos["30"]
    );

}


// =====================================================
// DASHBOARD COMPLETO DO HISTÓRICO
//
// GET /historico/painel?periodo=30
// =====================================================

router.get(
    "/painel",
    async (req, res) => {

        try {

            await garantirTabelaVisualizacoes();

            const periodo =
                req.query.periodo || "30";


            const filtroPedidos =
                obterFiltroPeriodo(
                    periodo,
                    "p.criado_em"
                );


            const filtroOrcamentos =
                obterFiltroPeriodo(
                    periodo,
                    "o.criado_em"
                );


            const filtroVisualizacoes =
                obterFiltroPeriodo(
                    periodo,
                    "v.criado_em"
                );


            const filtroHistorico =
                obterFiltroPeriodo(
                    periodo,
                    "h.criado_em"
                );


            // =================================================
            // RESUMO FINANCEIRO
            // =================================================

            const [resumoPedidos] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total_pedidos,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN LOWER(
                                        COALESCE(
                                            p.status,
                                            ''
                                        )
                                    ) NOT LIKE '%cancel%'
                                    THEN p.total
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS faturamento,

                        COALESCE(
                            AVG(
                                CASE
                                    WHEN LOWER(
                                        COALESCE(
                                            p.status,
                                            ''
                                        )
                                    ) NOT LIKE '%cancel%'
                                    THEN p.total
                                    ELSE NULL
                                END
                            ),
                            0
                        ) AS ticket_medio

                    FROM pedidos p

                    WHERE 1 = 1

                    ${filtroPedidos}
                    `
                );


            // =================================================
            // ORÇAMENTOS
            // =================================================

            const [resumoOrcamentos] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total_orcamentos,

                        SUM(
                            CASE
                                WHEN o.status = 'aberto'
                                THEN 1
                                ELSE 0
                            END
                        ) AS abertos,

                        SUM(
                            CASE
                                WHEN o.status = 'aprovado'
                                THEN 1
                                ELSE 0
                            END
                        ) AS aprovados,

                        SUM(
                            CASE
                                WHEN o.status = 'convertido'
                                THEN 1
                                ELSE 0
                            END
                        ) AS convertidos,

                        SUM(
                            CASE
                                WHEN o.status = 'expirado'
                                THEN 1
                                ELSE 0
                            END
                        ) AS expirados,

                        COALESCE(
                            SUM(o.total),
                            0
                        ) AS valor_orcamentos

                    FROM orcamentos o

                    WHERE 1 = 1

                    ${filtroOrcamentos}
                    `
                );


            // =================================================
            // CLIENTES
            // =================================================

            const [clientes] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total_clientes

                    FROM usuarios

                    WHERE tipo = 'cliente'
                    `
                );


            // =================================================
            // VISUALIZAÇÕES
            // =================================================

            const [visualizacoes] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total_visualizacoes,

                        COUNT(
                            DISTINCT v.produto_id
                        ) AS produtos_visualizados,

                        COUNT(
                            DISTINCT v.usuario_id
                        ) AS usuarios_visualizaram

                    FROM visualizacoes_produtos v

                    WHERE 1 = 1

                    ${filtroVisualizacoes}
                    `
                );


            // =================================================
            // PRODUTOS MAIS VENDIDOS
            // =================================================

            const [maisVendidos] =
                await db.query(
                    `
                    SELECT
                        i.id,
                        i.nome,
                        i.marca,
                        i.cor,
                        i.foto,

                        SUM(
                            ip.quantidade
                        ) AS unidades_vendidas,

                        SUM(
                            ip.quantidade *
                            ip.preco
                        ) AS faturamento

                    FROM itens_pedidos ip

                    INNER JOIN itens i
                        ON i.id = ip.produto_id

                    INNER JOIN pedidos p
                        ON p.id = ip.pedido_id

                    WHERE
                        LOWER(
                            COALESCE(
                                p.status,
                                ''
                            )
                        ) NOT LIKE '%cancel%'

                        ${filtroPedidos}

                    GROUP BY
                        i.id,
                        i.nome,
                        i.marca,
                        i.cor,
                        i.foto

                    ORDER BY
                        unidades_vendidas DESC

                    LIMIT 10
                    `
                );


            // =================================================
            // MAIS VISUALIZADOS
            // =================================================

            const [maisVisualizados] =
                await db.query(
                    `
                    SELECT
                        i.id,
                        i.nome,
                        i.marca,
                        i.cor,
                        i.foto,

                        COUNT(
                            v.id
                        ) AS visualizacoes,

                        COUNT(
                            DISTINCT v.usuario_id
                        ) AS usuarios_unicos

                    FROM visualizacoes_produtos v

                    INNER JOIN itens i
                        ON i.id = v.produto_id

                    WHERE 1 = 1

                    ${filtroVisualizacoes}

                    GROUP BY
                        i.id,
                        i.nome,
                        i.marca,
                        i.cor,
                        i.foto

                    ORDER BY
                        visualizacoes DESC

                    LIMIT 10
                    `
                );


            // =================================================
            // ATIVIDADES RECENTES
            // =================================================

            const [atividades] =
                await db.query(
                    `
                    SELECT
                        h.id,
                        h.usuario_id,
                        h.tipo,
                        h.acao,
                        h.titulo,
                        h.descricao,
                        h.referencia_id,
                        h.valor_anterior,
                        h.valor_novo,
                        h.criado_em,

                        u.nome AS usuario_nome,
                        u.email AS usuario_email

                    FROM historico_sistema h

                    LEFT JOIN usuarios u
                        ON u.id = h.usuario_id

                    WHERE 1 = 1

                    ${filtroHistorico}

                    ORDER BY
                        h.criado_em DESC

                    LIMIT 100
                    `
                );


            // =================================================
            // TAXA DE CONVERSÃO DOS ORÇAMENTOS
            // =================================================

            const dadosOrcamentos =
                resumoOrcamentos[0] || {};


            const totalOrcamentos =
                Number(
                    dadosOrcamentos.total_orcamentos ||
                    0
                );


            const convertidos =
                Number(
                    dadosOrcamentos.convertidos ||
                    0
                );


            const taxaConversaoOrcamentos =
                totalOrcamentos > 0
                    ? (
                        convertidos /
                        totalOrcamentos
                    ) * 100
                    : 0;


            // =================================================
            // RESPOSTA
            // =================================================

            return res.status(200).json({

                periodo,

                resumo: {

                    faturamento:
                        Number(
                            resumoPedidos[0]?.faturamento ||
                            0
                        ),

                    pedidos:
                        Number(
                            resumoPedidos[0]?.total_pedidos ||
                            0
                        ),

                    ticket_medio:
                        Number(
                            resumoPedidos[0]?.ticket_medio ||
                            0
                        ),

                    clientes:
                        Number(
                            clientes[0]?.total_clientes ||
                            0
                        ),

                    visualizacoes:
                        Number(
                            visualizacoes[0]?.total_visualizacoes ||
                            0
                        ),

                    produtos_visualizados:
                        Number(
                            visualizacoes[0]?.produtos_visualizados ||
                            0
                        ),

                    usuarios_visualizaram:
                        Number(
                            visualizacoes[0]?.usuarios_visualizaram ||
                            0
                        )

                },

                orcamentos: {

                    total:
                        totalOrcamentos,

                    abertos:
                        Number(
                            dadosOrcamentos.abertos ||
                            0
                        ),

                    aprovados:
                        Number(
                            dadosOrcamentos.aprovados ||
                            0
                        ),

                    convertidos:
                        convertidos,

                    expirados:
                        Number(
                            dadosOrcamentos.expirados ||
                            0
                        ),

                    valor_total:
                        Number(
                            dadosOrcamentos.valor_orcamentos ||
                            0
                        ),

                    taxa_conversao:
                        Number(
                            taxaConversaoOrcamentos.toFixed(
                                2
                            )
                        )

                },

                mais_vendidos:
                    maisVendidos.map(
                        item => ({
                            ...item,

                            unidades_vendidas:
                                Number(
                                    item.unidades_vendidas ||
                                    0
                                ),

                            faturamento:
                                Number(
                                    item.faturamento ||
                                    0
                                )
                        })
                    ),

                mais_visualizados:
                    maisVisualizados.map(
                        item => ({
                            ...item,

                            visualizacoes:
                                Number(
                                    item.visualizacoes ||
                                    0
                                ),

                            usuarios_unicos:
                                Number(
                                    item.usuarios_unicos ||
                                    0
                                )
                        })
                    ),

                atividades

            });

        } catch (error) {

            console.error(
                "Erro ao carregar painel de histórico:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao carregar painel de histórico.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// RESUMO
//
// GET /historico/resumo?periodo=30
// =====================================================

router.get(
    "/resumo",
    async (req, res) => {

        try {

            const periodo =
                req.query.periodo ||
                "30";


            const filtroPedidos =
                obterFiltroPeriodo(
                    periodo,
                    "p.criado_em"
                );


            const [pedidos] =
                await db.query(
                    `
                    SELECT

                        COUNT(*) AS total_pedidos,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN LOWER(
                                        COALESCE(
                                            p.status,
                                            ''
                                        )
                                    ) NOT LIKE '%cancel%'
                                    THEN p.total
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS faturamento,

                        COALESCE(
                            AVG(
                                CASE
                                    WHEN LOWER(
                                        COALESCE(
                                            p.status,
                                            ''
                                        )
                                    ) NOT LIKE '%cancel%'
                                    THEN p.total
                                    ELSE NULL
                                END
                            ),
                            0
                        ) AS ticket_medio

                    FROM pedidos p

                    WHERE 1 = 1

                    ${filtroPedidos}
                    `
                );


            const [orcamentos] =
                await db.query(
                    `
                    SELECT

                        COUNT(*) AS total_orcamentos,

                        SUM(
                            CASE
                                WHEN status = 'convertido'
                                THEN 1
                                ELSE 0
                            END
                        ) AS convertidos

                    FROM orcamentos
                    `
                );


            const [visualizacoes] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total

                    FROM visualizacoes_produtos
                    `
                );


            return res.status(200).json({

                faturamento:
                    Number(
                        pedidos[0]?.faturamento ||
                        0
                    ),

                pedidos:
                    Number(
                        pedidos[0]?.total_pedidos ||
                        0
                    ),

                ticket_medio:
                    Number(
                        pedidos[0]?.ticket_medio ||
                        0
                    ),

                orcamentos:
                    Number(
                        orcamentos[0]?.total_orcamentos ||
                        0
                    ),

                orcamentos_convertidos:
                    Number(
                        orcamentos[0]?.convertidos ||
                        0
                    ),

                visualizacoes:
                    Number(
                        visualizacoes[0]?.total ||
                        0
                    )

            });

        } catch (error) {

            console.error(
                "Erro ao buscar resumo:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar resumo.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// PRODUTOS MAIS VENDIDOS
//
// GET /historico/mais-vendidos
// GET /historico/mais-vendidos?periodo=30
// =====================================================

router.get(
    "/mais-vendidos",
    async (req, res) => {

        try {

            const periodo =
                req.query.periodo ||
                "30";


            const filtro =
                obterFiltroPeriodo(
                    periodo,
                    "p.criado_em"
                );


            const [produtos] =
                await db.query(
                    `
                    SELECT
                        i.id,
                        i.nome,
                        i.descricao,
                        i.marca,
                        i.cor,
                        i.foto,
                        i.preco,

                        SUM(
                            ip.quantidade
                        ) AS unidades_vendidas,

                        COUNT(
                            DISTINCT p.id
                        ) AS pedidos,

                        SUM(
                            ip.quantidade *
                            ip.preco
                        ) AS faturamento

                    FROM itens_pedidos ip

                    INNER JOIN itens i
                        ON i.id = ip.produto_id

                    INNER JOIN pedidos p
                        ON p.id = ip.pedido_id

                    WHERE
                        LOWER(
                            COALESCE(
                                p.status,
                                ''
                            )
                        ) NOT LIKE '%cancel%'

                        ${filtro}

                    GROUP BY
                        i.id,
                        i.nome,
                        i.descricao,
                        i.marca,
                        i.cor,
                        i.foto,
                        i.preco

                    ORDER BY
                        unidades_vendidas DESC

                    LIMIT 10
                    `
                );


            return res.status(200).json(
                produtos.map(
                    produto => ({

                        ...produto,

                        unidades_vendidas:
                            Number(
                                produto.unidades_vendidas ||
                                0
                            ),

                        pedidos:
                            Number(
                                produto.pedidos ||
                                0
                            ),

                        faturamento:
                            Number(
                                produto.faturamento ||
                                0
                            )

                    })
                )
            );

        } catch (error) {

            console.error(
                "Erro ao buscar produtos mais vendidos:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar produtos mais vendidos.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// PRODUTOS MAIS VISUALIZADOS
//
// GET /historico/mais-visualizados
// GET /historico/mais-visualizados?periodo=30
// =====================================================

router.get(
    "/mais-visualizados",
    async (req, res) => {

        try {

            const periodo =
                req.query.periodo ||
                "30";


            const filtro =
                obterFiltroPeriodo(
                    periodo,
                    "v.criado_em"
                );


            const [produtos] =
                await db.query(
                    `
                    SELECT
                        i.id,
                        i.nome,
                        i.descricao,
                        i.marca,
                        i.cor,
                        i.foto,
                        i.preco,

                        COUNT(
                            v.id
                        ) AS visualizacoes,

                        COUNT(
                            DISTINCT v.usuario_id
                        ) AS usuarios_unicos

                    FROM visualizacoes_produtos v

                    INNER JOIN itens i
                        ON i.id = v.produto_id

                    WHERE 1 = 1

                    ${filtro}

                    GROUP BY
                        i.id,
                        i.nome,
                        i.descricao,
                        i.marca,
                        i.cor,
                        i.foto,
                        i.preco

                    ORDER BY
                        visualizacoes DESC

                    LIMIT 10
                    `
                );


            return res.status(200).json(
                produtos.map(
                    produto => ({

                        ...produto,

                        visualizacoes:
                            Number(
                                produto.visualizacoes ||
                                0
                            ),

                        usuarios_unicos:
                            Number(
                                produto.usuarios_unicos ||
                                0
                            )

                    })
                )
            );

        } catch (error) {

            console.error(
                "Erro ao buscar produtos mais visualizados:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar produtos mais visualizados.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// REGISTRAR VISUALIZAÇÃO
//
// POST /historico/visualizacoes
//
// {
//     "produto_id": 5,
//     "usuario_id": 2
// }
//
// usuario_id pode ser null
// =====================================================

router.post(
    "/visualizacoes",
    async (req, res) => {

        try {

            await garantirTabelaVisualizacoes();

            const {
                produto_id,
                usuario_id = null
            } = req.body;


            if (!produto_id) {

                return res.status(400).json({
                    erro:
                        "Informe o produto."
                });

            }


            // =================================================
            // VERIFICAR PRODUTO
            // =================================================

            const [produtos] =
                await db.query(
                    `
                    SELECT id

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

                return res.status(404).json({
                    erro:
                        "Produto não encontrado."
                });

            }


            // =================================================
            // VERIFICAR USUÁRIO, SE INFORMADO
            // =================================================

            if (usuario_id) {

                const [usuarios] =
                    await db.query(
                        `
                        SELECT id

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

                    return res.status(404).json({
                        erro:
                            "Usuário não encontrado."
                    });

                }

            }


            // =================================================
            // REGISTRAR
            // =================================================

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO visualizacoes_produtos
                    (
                        produto_id,
                        usuario_id
                    )
                    VALUES (?, ?)
                    `,
                    [
                        produto_id,
                        usuario_id || null
                    ]
                );


            return res.status(201).json({

                mensagem:
                    "Visualização registrada.",

                id:
                    resultado.insertId

            });

        } catch (error) {

            console.error(
                "Erro ao registrar visualização:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao registrar visualização.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// LISTAR ATIVIDADES
//
// GET /historico/atividades
// GET /historico/atividades?tipo=pedido
// GET /historico/atividades?periodo=30
// =====================================================

router.get(
    "/atividades",
    async (req, res) => {

        try {

            const {
                tipo,
                periodo = "30"
            } = req.query;


            const tiposValidos = [
                "pedido",
                "produto",
                "estoque",
                "cupom",
                "usuario",
                "orcamento",
                "fidelidade",
                "feedback",
                "sistema"
            ];


            const parametros = [];


            let filtroTipo = "";


            if (
                tipo &&
                tiposValidos.includes(
                    tipo
                )
            ) {

                filtroTipo =
                    "AND h.tipo = ?";

                parametros.push(
                    tipo
                );

            }


            const filtroPeriodo =
                obterFiltroPeriodo(
                    periodo,
                    "h.criado_em"
                );


            const [historico] =
                await db.query(
                    `
                    SELECT
                        h.id,
                        h.usuario_id,
                        h.tipo,
                        h.acao,
                        h.titulo,
                        h.descricao,
                        h.referencia_id,
                        h.valor_anterior,
                        h.valor_novo,
                        h.criado_em,

                        u.nome AS usuario_nome,
                        u.email AS usuario_email

                    FROM historico_sistema h

                    LEFT JOIN usuarios u
                        ON u.id = h.usuario_id

                    WHERE 1 = 1

                    ${filtroTipo}

                    ${filtroPeriodo}

                    ORDER BY
                        h.criado_em DESC

                    LIMIT 100
                    `,
                    parametros
                );


            return res.status(200).json(
                historico
            );

        } catch (error) {

            console.error(
                "Erro ao buscar histórico:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar histórico.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// REGISTRAR ATIVIDADE
//
// POST /historico/atividade
// =====================================================

router.post(
    "/atividade",
    async (req, res) => {

        try {

            const {
                usuario_id = null,
                tipo = "sistema",
                acao,
                titulo,
                descricao = null,
                referencia_id = null,
                valor_anterior = null,
                valor_novo = null
            } = req.body;


            // =================================================
            // TIPOS
            // =================================================

            const tiposValidos = [
                "pedido",
                "produto",
                "estoque",
                "cupom",
                "usuario",
                "orcamento",
                "fidelidade",
                "feedback",
                "sistema"
            ];


            if (
                !tiposValidos.includes(
                    tipo
                )
            ) {

                return res.status(400).json({
                    erro:
                        "Tipo de histórico inválido."
                });

            }


            if (!acao) {

                return res.status(400).json({
                    erro:
                        "Informe a ação."
                });

            }


            if (!titulo) {

                return res.status(400).json({
                    erro:
                        "Informe o título."
                });

            }


            // =================================================
            // VERIFICAR USUÁRIO
            // =================================================

            if (usuario_id) {

                const [usuarios] =
                    await db.query(
                        `
                        SELECT id

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

                    return res.status(404).json({
                        erro:
                            "Usuário não encontrado."
                    });

                }

            }


            // =================================================
            // SALVAR
            // =================================================

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO historico_sistema
                    (
                        usuario_id,
                        tipo,
                        acao,
                        titulo,
                        descricao,
                        referencia_id,
                        valor_anterior,
                        valor_novo
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        usuario_id || null,
                        tipo,
                        acao,
                        titulo,
                        descricao,
                        referencia_id,
                        valor_anterior,
                        valor_novo
                    ]
                );


            return res.status(201).json({

                mensagem:
                    "Atividade registrada com sucesso.",

                atividade: {

                    id:
                        resultado.insertId,

                    usuario_id,

                    tipo,

                    acao,

                    titulo,

                    descricao,

                    referencia_id,

                    valor_anterior,

                    valor_novo

                }

            });

        } catch (error) {

            console.error(
                "Erro ao registrar atividade:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao registrar atividade.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// ESTATÍSTICAS DAS VISUALIZAÇÕES
//
// GET /historico/visualizacoes/resumo
// =====================================================

router.get(
    "/visualizacoes/resumo",
    async (req, res) => {

        try {

            const [resultado] =
                await db.query(
                    `
                    SELECT

                        COUNT(*) AS total,

                        COUNT(
                            DISTINCT produto_id
                        ) AS produtos,

                        COUNT(
                            DISTINCT usuario_id
                        ) AS usuarios

                    FROM visualizacoes_produtos
                    `
                );


            return res.status(200).json({

                total:
                    Number(
                        resultado[0]?.total ||
                        0
                    ),

                produtos:
                    Number(
                        resultado[0]?.produtos ||
                        0
                    ),

                usuarios:
                    Number(
                        resultado[0]?.usuarios ||
                        0
                    )

            });

        } catch (error) {

            console.error(
                "Erro ao buscar visualizações:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar visualizações.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// EXCLUIR UM REGISTRO DO HISTÓRICO
//
// DELETE /historico/atividade/:id
// =====================================================

router.delete(
    "/atividade/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const [resultado] =
                await db.query(
                    `
                    DELETE FROM historico_sistema

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
                        "Registro de histórico não encontrado."
                });

            }


            return res.status(200).json({
                mensagem:
                    "Registro excluído com sucesso."
            });

        } catch (error) {

            console.error(
                "Erro ao excluir registro:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao excluir registro.",

                detalhe:
                    error.message

            });

        }

    }
);


export default router;
