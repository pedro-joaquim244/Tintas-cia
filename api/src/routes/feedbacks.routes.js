import express from "express";
import db from "../database.js";
import { autenticarToken } from "../middlewares/autenticacao.js";
import { registrarAtividade } from "../services/historico.service.js";

const router = express.Router();

const CAMPOS_FEEDBACK = `
    SELECT
        f.id,
        f.usuario_id,
        f.nota,
        f.comentario,
        f.criado_em,
        f.atualizado_em,
        u.nome AS usuario_nome,
        u.foto AS usuario_foto
    FROM feedbacks f
    INNER JOIN usuarios u ON u.id = f.usuario_id
`;

// =====================================================
// LISTAR FEEDBACKS
// =====================================================

router.get("/", async (_req, res) => {
    try {
        const [feedbacks] = await db.query(`
            ${CAMPOS_FEEDBACK}
            ORDER BY f.criado_em DESC, f.id DESC
        `);

        return res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Erro ao buscar feedbacks:", error);

        return res.status(500).json({
            erro: "Erro ao buscar feedbacks",
            detalhe: error.message
        });
    }
});

// =====================================================
// CADASTRAR FEEDBACK
// =====================================================

router.post("/", autenticarToken, async (req, res) => {
    let connection = null;
    let transacaoIniciada = false;

    try {
        const usuarioId = Number(req.usuario?.id);
        const { comentario, nota } = req.body || {};

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            });
        }

        if (typeof comentario !== "string" || !comentario.trim()) {
            return res.status(400).json({
                erro: "O comentário é obrigatório"
            });
        }

        const comentarioFinal = comentario.trim();

        if (comentarioFinal.length < 5) {
            return res.status(400).json({
                erro: "O comentário deve possuir pelo menos 5 caracteres"
            });
        }

        if (comentarioFinal.length > 500) {
            return res.status(400).json({
                erro: "O comentário deve possuir no máximo 500 caracteres"
            });
        }

        const notaFinal = Number(nota);

        if (
            !Number.isInteger(notaFinal) ||
            notaFinal < 1 ||
            notaFinal > 5
        ) {
            return res.status(400).json({
                erro: "A avaliação deve possuir entre 1 e 5 estrelas"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();
        transacaoIniciada = true;

        const [usuarios] = await connection.query(
            `
                SELECT id, nome
                FROM usuarios
                WHERE id = ?
                LIMIT 1
            `,
            [usuarioId]
        );

        if (usuarios.length === 0) {
            await connection.rollback();
            transacaoIniciada = false;

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });
        }

        const usuario = usuarios[0];
        const [resultado] = await connection.query(
            `
                INSERT INTO feedbacks (usuario_id, nota, comentario)
                VALUES (?, ?, ?)
            `,
            [usuarioId, notaFinal, comentarioFinal]
        );

        const [feedbacksCadastrados] = await connection.query(
            `
                ${CAMPOS_FEEDBACK}
                WHERE f.id = ?
                LIMIT 1
            `,
            [resultado.insertId]
        );

        const feedbackCadastrado = feedbacksCadastrados[0];

        if (!feedbackCadastrado) {
            throw new Error("O feedback criado não foi encontrado");
        }

        await registrarAtividade(connection, {
            usuario_id: usuarioId,
            tipo: "feedback",
            acao: "criar",
            titulo: `Novo feedback de ${usuario.nome}`,
            descricao: `Avaliação enviada com ${notaFinal} estrela(s).`,
            referencia_id: resultado.insertId,
            valor_novo: {
                nota: notaFinal,
                comentario: comentarioFinal
            }
        });

        await connection.commit();
        transacaoIniciada = false;

        return res.status(201).json({
            mensagem: "Feedback cadastrado com sucesso",
            feedback: feedbackCadastrado
        });
    } catch (error) {
        if (connection && transacaoIniciada) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Erro ao desfazer cadastro de feedback:",
                    rollbackError
                );
            }
        }

        console.error("Erro ao cadastrar feedback:", error);

        return res.status(500).json({
            erro: "Erro ao cadastrar feedback",
            detalhe: error.message
        });
    } finally {
        connection?.release();
    }
});

export default router;
