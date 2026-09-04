import express from "express";
import pool from "../database.js";
import { registrarAtividade } from "../services/historico.service.js";

const router = express.Router();


// =====================================================
// LISTAR CUPONS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const [cupons] = await pool.query(
            `
            SELECT
                id,
                codigo,
                tipo,
                desconto,
                valor_minimo,
                limite_uso,
                usos,
                validade_inicio,
                validade_fim,
                status,
                criado_em
            FROM cupons
            ORDER BY id DESC
            `
        );

        const resultado = cupons.map((cupom) => ({
            ...cupom,

            // Compatibilidade com o frontend
            valor: cupom.desconto,

            validade: cupom.validade_fim,

            ativo:
                cupom.status === "Ativo"
        }));

        res.json(resultado);

    } catch (error) {

        console.error(
            "Erro ao buscar cupons:",
            error
        );

        res.status(500).json({
            mensagem:
                "Erro ao buscar cupons."
        });

    }

});


// =====================================================
// CADASTRAR CUPOM
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            codigo,
            tipo,
            desconto,
            valor_minimo,
            validade_inicio,
            validade_fim,
            limite_uso,
            status
        } = req.body;


        // ==========================
        // VALIDAÇÕES
        // ==========================

        if (!codigo || !codigo.trim()) {

            return res.status(400).json({
                mensagem:
                    "Informe o código do cupom."
            });

        }


        if (
            tipo !== "porcentagem" &&
            tipo !== "valor"
        ) {

            return res.status(400).json({
                mensagem:
                    "Tipo de desconto inválido."
            });

        }


        if (
            desconto === undefined ||
            desconto === null ||
            Number(desconto) <= 0
        ) {

            return res.status(400).json({
                mensagem:
                    "Informe um desconto válido."
            });

        }


        // ==========================
        // VALIDAR PORCENTAGEM
        // ==========================

        if (
            tipo === "porcentagem" &&
            Number(desconto) > 100
        ) {

            return res.status(400).json({
                mensagem:
                    "O desconto percentual não pode ser maior que 100%."
            });

        }


        // ==========================
        // VERIFICAR CÓDIGO DUPLICADO
        // ==========================

        const [existente] = await pool.query(
            `
            SELECT id
            FROM cupons
            WHERE codigo = ?
            LIMIT 1
            `,
            [
                codigo.trim().toUpperCase()
            ]
        );


        if (existente.length > 0) {

            return res.status(400).json({
                mensagem:
                    "Já existe um cupom com este código."
            });

        }


        // ==========================
        // INSERIR CUPOM
        // ==========================

        const [resultado] = await pool.query(
            `
            INSERT INTO cupons
            (
                codigo,
                tipo,
                desconto,
                valor_minimo,
                limite_uso,
                usos,
                validade_inicio,
                validade_fim,
                status
            )
            VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
            `,
            [
                codigo.trim().toUpperCase(),

                tipo,

                Number(desconto),

                valor_minimo
                    ? Number(valor_minimo)
                    : 0,

                limite_uso
                    ? Number(limite_uso)
                    : null,

                validade_inicio || null,

                validade_fim || null,

                status === "Inativo"
                    ? "Inativo"
                    : "Ativo"
            ]
        );

        await registrarAtividade(pool, {
            tipo: "cupom",
            acao: "criar",
            titulo: `Cupom ${codigo.trim().toUpperCase()} criado`,
            descricao: `Novo cupom de desconto cadastrado.`,
            referencia_id: resultado.insertId,
            valor_novo: {
                codigo: codigo.trim().toUpperCase(),
                tipo,
                desconto: Number(desconto),
                status: status === "Inativo" ? "Inativo" : "Ativo"
            }
        });


        res.status(201).json({

            mensagem:
                "Cupom cadastrado com sucesso.",

            id: resultado.insertId

        });

    } catch (error) {

        console.error(
            "Erro ao cadastrar cupom:",
            error
        );

        res.status(500).json({
            mensagem:
                "Erro interno ao cadastrar cupom."
        });

    }

});


// =====================================================
// VALIDAR CUPOM PARA COMPRA
// =====================================================

router.get(
    "/validar/:codigo",
    async (req, res) => {

        try {

            const codigo =
                req.params.codigo
                    .trim()
                    .toUpperCase();


            const [cupons] = await pool.query(
                `
                SELECT
                    id,
                    codigo,
                    tipo,
                    desconto,
                    valor_minimo,
                    limite_uso,
                    usos,
                    validade_inicio,
                    validade_fim,
                    status
                FROM cupons
                WHERE codigo = ?
                LIMIT 1
                `,
                [codigo]
            );


            if (cupons.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Cupom não encontrado."
                });

            }


            const cupom = cupons[0];


            // ==========================
            // USO ÚNICO POR CLIENTE
            // ==========================

            const usuarioId = Number(req.query.usuario_id);

            if (Number.isInteger(usuarioId) && usuarioId > 0) {
                const [usoAnterior] = await pool.query(
                    `
                    SELECT id
                    FROM pedidos
                    WHERE usuario_id = ?
                      AND cupom_id = ?
                    LIMIT 1
                    `,
                    [usuarioId, cupom.id]
                );

                if (usoAnterior.length > 0) {
                    return res.status(409).json({
                        mensagem: "Você já utilizou este cupom."
                    });
                }
            }


            // ==========================
            // STATUS
            // ==========================

            if (cupom.status !== "Ativo") {

                return res.status(400).json({
                    mensagem:
                        "Este cupom está inativo."
                });

            }


            // ==========================
            // DATA INICIAL
            // ==========================

            const agora = new Date();


            if (
                cupom.validade_inicio &&
                new Date(
                    cupom.validade_inicio
                ) > agora
            ) {

                return res.status(400).json({
                    mensagem:
                        "Este cupom ainda não está disponível."
                });

            }


            // ==========================
            // DATA FINAL
            // ==========================

            if (
                cupom.validade_fim &&
                new Date(
                    cupom.validade_fim
                ) < agora
            ) {

                return res.status(400).json({
                    mensagem:
                        "Este cupom está expirado."
                });

            }


            // ==========================
            // LIMITE DE USO
            // ==========================

            if (
                cupom.limite_uso !== null &&
                cupom.usos >= cupom.limite_uso
            ) {

                return res.status(400).json({
                    mensagem:
                        "Este cupom atingiu o limite de uso."
                });

            }


            // ==========================
            // DEVOLVER PARA O FRONTEND
            // ==========================

            res.json({

                id: cupom.id,

                codigo: cupom.codigo,

                tipo: cupom.tipo,

                // O Compra.jsx utiliza "valor"
                valor: cupom.desconto,

                desconto: cupom.desconto,

                valor_minimo:
                    cupom.valor_minimo,

                limite_uso:
                    cupom.limite_uso,

                usos: cupom.usos,

                validade:
                    cupom.validade_fim,

                validade_fim:
                    cupom.validade_fim,

                ativo:
                    cupom.status === "Ativo"

            });

        } catch (error) {

            console.error(
                "Erro ao validar cupom:",
                error
            );

            res.status(500).json({
                mensagem:
                    "Erro ao validar cupom."
            });

        }

    }
);


// =====================================================
// ALTERAR STATUS
// =====================================================

router.patch(
    "/:id/status",
    async (req, res) => {

        try {

            const { id } = req.params;

            const status = req.body.status === "Ativo"
                ? "Ativo"
                : "Inativo";

            const [cupomAtual] = await pool.query(
                `SELECT codigo, status FROM cupons WHERE id = ? LIMIT 1`,
                [id]
            );


            await pool.query(
                `
                UPDATE cupons
                SET status = ?
                WHERE id = ?
                `,
                [
                    status,
                    id
                ]
            );

            if (cupomAtual.length > 0 && cupomAtual[0].status !== status) {
                await registrarAtividade(pool, {
                    tipo: "cupom",
                    acao: "alterar_status",
                    titulo: `Status do cupom ${cupomAtual[0].codigo} alterado`,
                    referencia_id: Number(id),
                    valor_anterior: cupomAtual[0].status,
                    valor_novo: status
                });
            }


            res.json({
                mensagem:
                    "Status do cupom atualizado."
            });

        } catch (error) {

            console.error(
                "Erro ao alterar status:",
                error
            );

            res.status(500).json({
                mensagem:
                    "Erro ao alterar status."
            });

        }

    }
);

router.put(
    "/:id",
    async (req, res) => {
        try {
            const { id } = req.params;

            const [cupomAtual] = await pool.query(
                `SELECT codigo, status FROM cupons WHERE id = ? LIMIT 1`,
                [id]
            );
            const status = req.body.ativo ? "Ativo" : "Inativo";

            await pool.query(
                `UPDATE cupons SET status = ? WHERE id = ?`,
                [status, id]
            );

            if (cupomAtual.length > 0 && cupomAtual[0].status !== status) {
                await registrarAtividade(pool, {
                    tipo: "cupom",
                    acao: "alterar_status",
                    titulo: `Status do cupom ${cupomAtual[0].codigo} alterado`,
                    referencia_id: Number(id),
                    valor_anterior: cupomAtual[0].status,
                    valor_novo: status
                });
            }

            return res.json({
                mensagem: "Status do cupom atualizado."
            });
        } catch (error) {
            console.error("Erro ao alterar status:", error);

            return res.status(500).json({
                mensagem: "Erro ao alterar status."
            });
        }
    }
);


// =====================================================
// EXCLUIR CUPOM
// =====================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const { id } = req.params;

            const [cupomAtual] = await pool.query(
                `SELECT codigo, status FROM cupons WHERE id = ? LIMIT 1`,
                [id]
            );


            await pool.query(
                `
                DELETE FROM cupons
                WHERE id = ?
                `,
                [id]
            );

            if (cupomAtual.length > 0) {
                await registrarAtividade(pool, {
                    tipo: "cupom",
                    acao: "excluir",
                    titulo: `Cupom ${cupomAtual[0].codigo} excluido`,
                    referencia_id: Number(id),
                    valor_anterior: cupomAtual[0]
                });
            }


            res.json({
                mensagem:
                    "Cupom excluído com sucesso."
            });

        } catch (error) {

            console.error(
                "Erro ao excluir cupom:",
                error
            );

            res.status(500).json({
                mensagem:
                    "Erro ao excluir cupom."
            });

        }

    }
);


export default router;
