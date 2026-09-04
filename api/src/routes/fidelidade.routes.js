import express from "express";
import db from "../database.js";

const router = express.Router();

async function garantirTabelaCuponsUsuarios(connection = db) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS cupons_usuarios (
            id INT NOT NULL AUTO_INCREMENT,
            usuario_id INT NOT NULL,
            cupom_id INT NOT NULL,
            salvo_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_cupom_usuario (usuario_id, cupom_id),
            CONSTRAINT fk_cupons_usuarios_usuario
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_cupons_usuarios_cupom
                FOREIGN KEY (cupom_id) REFERENCES cupons(id)
                ON DELETE CASCADE
        )
    `);
}


// =====================================================
// REGRAS DE FIDELIDADE
// =====================================================

const RECOMPENSAS = {
    250: {
        tipo: "percentual",
        valor: 5
    },

    500: {
        tipo: "percentual",
        valor: 10
    },

    1000: {
        tipo: "percentual",
        valor: 15
    },

    2000: {
        tipo: "fixo",
        valor: 100
    }
};


// =====================================================
// GERAR CÓDIGO DE CUPOM
// =====================================================

function gerarCodigoCupom(usuarioId) {

    const numeroAleatorio = Math.floor(
        100000 + Math.random() * 900000
    );

    return `FIDELIDADE${usuarioId}${numeroAleatorio}`;
}


// =====================================================
// BUSCAR PONTOS DO USUÁRIO
// GET /fidelidade/:usuario_id
// =====================================================

router.get("/:usuario_id", async (req, res) => {

    try {

        const { usuario_id } = req.params;


        // =================================================
        // BUSCAR USUÁRIO
        // =================================================

        const [usuarios] = await db.query(
            `
            SELECT
                id,
                nome,
                pontos
            FROM usuarios
            WHERE id = ?
            `,
            [usuario_id]
        );


        if (usuarios.length === 0) {

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });

        }


        const usuario = usuarios[0];

        const pontos = Number(usuario.pontos || 0);


        // =================================================
        // CALCULAR NÍVEL
        // =================================================

        let nivel = "Bronze";

        if (pontos >= 3000) {

            nivel = "Platina";

        } else if (pontos >= 1500) {

            nivel = "Ouro";

        } else if (pontos >= 500) {

            nivel = "Prata";

        }


        // =================================================
        // PRÓXIMO RANK
        // =================================================

        const ranks = [
            { pontos: 500, nome: "Prata" },
            { pontos: 1500, nome: "Ouro" },
            { pontos: 3000, nome: "Platina" }
        ];

        let proximaRecompensa = null;
        let proximoNivel = null;

        for (const rank of ranks) {

            if (pontos < rank.pontos) {

                proximaRecompensa = rank.pontos;
                proximoNivel = rank.nome;

                break;

            }

        }


        const faltamPontos = proximaRecompensa
            ? proximaRecompensa - pontos
            : 0;


        // =================================================
        // RESPOSTA
        // =================================================

        return res.status(200).json({

            usuario_id: usuario.id,

            nome: usuario.nome,

            pontos,

            nivel,

            proximo_nivel: proximoNivel,

            proxima_recompensa: proximaRecompensa,

            faltam_pontos: faltamPontos

        });


    } catch (error) {

        console.error(
            "Erro ao buscar fidelidade:",
            error
        );


        return res.status(500).json({

            erro: "Erro ao buscar dados de fidelidade",

            detalhe: error.message

        });

    }

});


// =====================================================
// BUSCAR HISTÓRICO DE PONTOS
// GET /fidelidade/:usuario_id/historico
// =====================================================

router.get(
    "/:usuario_id/historico",
    async (req, res) => {

        try {

            const { usuario_id } = req.params;


            const [historico] = await db.query(
                `
                SELECT
                    hp.id,
                    hp.usuario_id,
                    hp.pedido_id,
                    hp.pontos,
                    hp.tipo,
                    hp.descricao,
                    hp.criado_em

                FROM historico_pontos hp

                WHERE hp.usuario_id = ?

                ORDER BY hp.id DESC
                `,
                [usuario_id]
            );


            return res.status(200).json(historico);


        } catch (error) {

            console.error(
                "Erro ao buscar histórico:",
                error
            );


            return res.status(500).json({

                erro: "Erro ao buscar histórico de pontos",

                detalhe: error.message

            });

        }

    }
);


// =====================================================
// ADICIONAR PONTOS MANUALMENTE
// POST /fidelidade/adicionar
// =====================================================

router.post("/adicionar", async (req, res) => {

    const connection = await db.getConnection();

    try {

        const {
            usuario_id,
            pedido_id = null,
            pontos,
            descricao = "Pontos adicionados"
        } = req.body;


        // =================================================
        // VALIDAÇÕES
        // =================================================

        if (!usuario_id) {

            return res.status(400).json({
                erro: "usuario_id é obrigatório"
            });

        }


        if (!pontos || Number(pontos) <= 0) {

            return res.status(400).json({
                erro: "Informe uma quantidade válida de pontos"
            });

        }


        await connection.beginTransaction();


        // =================================================
        // VERIFICAR USUÁRIO
        // =================================================

        const [usuarios] = await connection.query(
            `
            SELECT
                id,
                pontos
            FROM usuarios
            WHERE id = ?
            FOR UPDATE
            `,
            [usuario_id]
        );


        if (usuarios.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });

        }


        // =================================================
        // ADICIONAR PONTOS
        // =================================================

        await connection.query(
            `
            UPDATE usuarios
            SET pontos = pontos + ?
            WHERE id = ?
            `,
            [
                Number(pontos),
                usuario_id
            ]
        );


        // =================================================
        // HISTÓRICO
        // =================================================

        await connection.query(
            `
            INSERT INTO historico_pontos
            (
                usuario_id,
                pedido_id,
                pontos,
                tipo,
                descricao
            )
            VALUES (?, ?, ?, 'GANHO', ?)
            `,
            [
                usuario_id,
                pedido_id,
                Number(pontos),
                descricao
            ]
        );


        await connection.commit();


        // =================================================
        // BUSCAR NOVO SALDO
        // =================================================

        const [saldoAtualizado] = await db.query(
            `
            SELECT pontos
            FROM usuarios
            WHERE id = ?
            `,
            [usuario_id]
        );


        return res.status(200).json({

            mensagem: "Pontos adicionados com sucesso",

            pontos_adicionados: Number(pontos),

            saldo_atual:
                Number(
                    saldoAtualizado[0]?.pontos || 0
                )

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "Erro ao adicionar pontos:",
            error
        );


        return res.status(500).json({

            erro: "Erro ao adicionar pontos",

            detalhe: error.message

        });


    } finally {

        connection.release();

    }

});


// =====================================================
// ADICIONAR PONTOS POR PEDIDO
// POST /fidelidade/pedido
//
// EXEMPLO:
// valor_total = 387.90
// pontos = 387
// =====================================================

router.post("/pedido", async (req, res) => {

    const connection = await db.getConnection();

    try {

        const {
            usuario_id,
            pedido_id,
            valor_total
        } = req.body;


        // =================================================
        // VALIDAÇÕES
        // =================================================

        if (!usuario_id) {

            return res.status(400).json({
                erro: "usuario_id é obrigatório"
            });

        }


        if (!pedido_id) {

            return res.status(400).json({
                erro: "pedido_id é obrigatório"
            });

        }


        if (
            valor_total === undefined ||
            valor_total === null ||
            Number(valor_total) <= 0
        ) {

            return res.status(400).json({
                erro: "valor_total inválido"
            });

        }


        const pontosGanhos =
            Math.floor(Number(valor_total));


        await connection.beginTransaction();


        // =================================================
        // VERIFICAR SE PEDIDO JÁ GEROU PONTOS
        // =================================================

        const [jaExiste] = await connection.query(
            `
            SELECT id
            FROM historico_pontos
            WHERE pedido_id = ?
              AND tipo = 'GANHO'
            LIMIT 1
            `,
            [pedido_id]
        );


        if (jaExiste.length > 0) {

            await connection.rollback();

            return res.status(400).json({

                erro: "Este pedido já gerou pontos"

            });

        }


        // =================================================
        // VERIFICAR USUÁRIO
        // =================================================

        const [usuarios] = await connection.query(
            `
            SELECT
                id,
                pontos
            FROM usuarios
            WHERE id = ?
            FOR UPDATE
            `,
            [usuario_id]
        );


        if (usuarios.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });

        }


        // =================================================
        // ATUALIZAR PONTOS
        // =================================================

        await connection.query(
            `
            UPDATE usuarios
            SET pontos = pontos + ?
            WHERE id = ?
            `,
            [
                pontosGanhos,
                usuario_id
            ]
        );


        // =================================================
        // HISTÓRICO
        // =================================================

        await connection.query(
            `
            INSERT INTO historico_pontos
            (
                usuario_id,
                pedido_id,
                pontos,
                tipo,
                descricao
            )
            VALUES (?, ?, ?, 'GANHO', ?)
            `,
            [
                usuario_id,
                pedido_id,
                pontosGanhos,
                `Pontos da compra #${pedido_id}`
            ]
        );


        await connection.commit();


        return res.status(201).json({

            mensagem:
                "Pontos da compra adicionados com sucesso",

            pedido_id,

            pontos_ganhos: pontosGanhos

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "Erro ao gerar pontos do pedido:",
            error
        );


        return res.status(500).json({

            erro: "Erro ao gerar pontos",

            detalhe: error.message

        });


    } finally {

        connection.release();

    }

});


// =====================================================
// RESGATAR RECOMPENSA
// POST /fidelidade/resgatar
//
// BODY:
// {
//     "usuario_id": 1,
//     "pontos": 500
// }
// =====================================================

router.post("/resgatar", async (req, res) => {

    const connection = await db.getConnection();

    try {

        const {
            usuario_id,
            pontos
        } = req.body;


        // =================================================
        // VALIDAÇÕES
        // =================================================

        if (!usuario_id) {

            return res.status(400).json({
                erro: "usuario_id é obrigatório"
            });

        }


        const pontosResgate = Number(pontos);


        const recompensa =
            RECOMPENSAS[pontosResgate];


        if (!recompensa) {

            return res.status(400).json({

                erro: "Recompensa inválida",

                recompensas_disponiveis:
                    Object.keys(RECOMPENSAS)

            });

        }


        await connection.beginTransaction();


        // =================================================
        // BUSCAR USUÁRIO
        // =================================================

        const [usuarios] = await connection.query(
            `
            SELECT
                id,
                nome,
                pontos
            FROM usuarios
            WHERE id = ?
            FOR UPDATE
            `,
            [usuario_id]
        );


        if (usuarios.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });

        }


        const usuario = usuarios[0];

        const saldoAtual =
            Number(usuario.pontos || 0);


        // =================================================
        // VERIFICAR SALDO
        // =================================================

        if (saldoAtual < pontosResgate) {

            await connection.rollback();

            return res.status(400).json({

                erro: "Pontos insuficientes",

                pontos_atuais: saldoAtual,

                pontos_necessarios:
                    pontosResgate

            });

        }


        // =================================================
        // GERAR CUPOM
        // =================================================

        let codigoCupom =
            gerarCodigoCupom(usuario_id);


        // =================================================
        // GARANTIR CÓDIGO ÚNICO
        // =================================================

        let codigoExiste = true;


        while (codigoExiste) {

            const [cupomExistente] =
                await connection.query(
                    `
                    SELECT id
                    FROM cupons
                    WHERE codigo = ?
                    LIMIT 1
                    `,
                    [codigoCupom]
                );


            if (cupomExistente.length === 0) {

                codigoExiste = false;

            } else {

                codigoCupom =
                    gerarCodigoCupom(usuario_id);

            }

        }


        // =================================================
        // VALIDADE DO CUPOM
        //
        // 30 DIAS
        // =================================================

        const validade = new Date();

        validade.setDate(
            validade.getDate() + 30
        );


        // =================================================
        // CRIAR CUPOM
        // =================================================

        await connection.query(
            `
            INSERT INTO cupons
            (
                codigo,
                tipo,
                valor,
                validade,
                limite_uso,
                ativo
            )
            VALUES (?, ?, ?, ?, 1, 1)
            `,
            [
                codigoCupom,
                recompensa.tipo,
                recompensa.valor,
                validade
            ]
        );


        // =================================================
        // DESCONTAR PONTOS
        // =================================================

        await connection.query(
            `
            UPDATE usuarios
            SET pontos = pontos - ?
            WHERE id = ?
            `,
            [
                pontosResgate,
                usuario_id
            ]
        );


        // =================================================
        // HISTÓRICO
        // =================================================

        let descricao = "";


        if (recompensa.tipo === "percentual") {

            descricao =
                `Resgate de ${recompensa.valor}% de desconto`;

        } else {

            descricao =
                `Resgate de R$ ${recompensa.valor} de desconto`;

        }


        await connection.query(
            `
            INSERT INTO historico_pontos
            (
                usuario_id,
                pedido_id,
                pontos,
                tipo,
                descricao
            )
            VALUES (?, NULL, ?, 'RESGATE', ?)
            `,
            [
                usuario_id,
                pontosResgate,
                descricao
            ]
        );


        await connection.commit();


        // =================================================
        // SALDO FINAL
        // =================================================

        const saldoFinal =
            saldoAtual - pontosResgate;


        return res.status(201).json({

            mensagem:
                "Recompensa resgatada com sucesso",

            pontos_gastos:
                pontosResgate,

            saldo_atual:
                saldoFinal,

            cupom: {

                codigo:
                    codigoCupom,

                tipo:
                    recompensa.tipo,

                valor:
                    recompensa.valor,

                validade

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "Erro ao resgatar recompensa:",
            error
        );


        return res.status(500).json({

            erro: "Erro ao resgatar recompensa",

            detalhe: error.message

        });


    } finally {

        connection.release();

    }

});


// =====================================================
// LISTAR RECOMPENSAS
// GET /fidelidade/recompensas/listar
// =====================================================

router.get(
    "/recompensas/listar",
    (req, res) => {

        const recompensas =
            Object.entries(RECOMPENSAS)
                .map(
                    ([pontos, recompensa]) => ({

                        pontos:
                            Number(pontos),

                        tipo:
                            recompensa.tipo,

                        valor:
                            recompensa.valor

                    })
                );


        return res.status(200).json(
            recompensas
        );

    }
);


// =====================================================
// GUARDAR CUPOM NO PERFIL
// POST /fidelidade/cupons/salvar
// =====================================================

router.post("/cupons/salvar", async (req, res) => {
    try {
        const { usuario_id, cupom_id } = req.body;

        if (!usuario_id || !cupom_id) {
            return res.status(400).json({
                erro: "Usuário e cupom são obrigatórios."
            });
        }

        await garantirTabelaCuponsUsuarios();

        const [dados] = await db.query(
            `
            SELECT u.pontos, c.id AS cupom_id, c.codigo
            FROM usuarios u
            INNER JOIN cupons c ON c.id = ?
            WHERE u.id = ?
            LIMIT 1
            `,
            [cupom_id, usuario_id]
        );

        if (dados.length === 0) {
            return res.status(404).json({
                erro: "Usuário ou cupom não encontrado."
            });
        }

        const pontosPorRank = {
            PRATA: 500,
            OURO: 1500,
            PLATINA: 3000
        };
        const pontosNecessarios = pontosPorRank[dados[0].codigo];

        if (
            pontosNecessarios === undefined ||
            Number(dados[0].pontos || 0) < pontosNecessarios
        ) {
            return res.status(403).json({
                erro: "Este cupom não pertence ao rank atual do cliente."
            });
        }

        const [usoAnterior] = await db.query(
            `
            SELECT id
            FROM pedidos
            WHERE usuario_id = ?
              AND cupom_id = ?
            LIMIT 1
            `,
            [usuario_id, cupom_id]
        );

        if (usoAnterior.length > 0) {
            return res.status(409).json({
                erro: "Este cupom já foi utilizado e não pode ser guardado novamente."
            });
        }

        await db.query(
            `
            INSERT INTO cupons_usuarios (usuario_id, cupom_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE salvo_em = salvo_em
            `,
            [usuario_id, cupom_id]
        );

        return res.status(200).json({
            mensagem: "Cupom guardado no perfil com sucesso."
        });
    } catch (error) {
        console.error("Erro ao guardar cupom:", error);

        return res.status(500).json({
            erro: "Não foi possível guardar o cupom.",
            detalhe: error.message
        });
    }
});


// =====================================================
// LISTAR CUPONS SALVOS NO PERFIL
// GET /fidelidade/:usuario_id/cupons
// =====================================================

router.get("/:usuario_id/cupons", async (req, res) => {
    try {
        await garantirTabelaCuponsUsuarios();

        const [cupons] = await db.query(
            `
            SELECT
                c.id,
                c.codigo,
                c.tipo,
                c.desconto,
                c.status,
                cu.salvo_em
            FROM cupons_usuarios cu
            INNER JOIN cupons c ON c.id = cu.cupom_id
                        WHERE cu.usuario_id = ?
                            AND NOT EXISTS (
                                    SELECT 1
                                    FROM pedidos p
                                    WHERE p.usuario_id = cu.usuario_id
                                        AND p.cupom_id = cu.cupom_id
                            )
            ORDER BY cu.salvo_em DESC
            `,
            [req.params.usuario_id]
        );

        return res.status(200).json(cupons);
    } catch (error) {
        console.error("Erro ao listar cupons do perfil:", error);

        return res.status(500).json({
            erro: "Não foi possível carregar os cupons salvos.",
            detalhe: error.message
        });
    }
});


// =====================================================
// EXPORTAR
// =====================================================

export default router;
