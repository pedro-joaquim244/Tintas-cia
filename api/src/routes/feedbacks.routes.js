import express from "express";
import db from "../database.js";
import { registrarAtividade } from "../services/historico.service.js";

const router = express.Router();


// =====================================================
// LISTAR FEEDBACKS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const [feedbacks] = await db.query(`
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

            INNER JOIN usuarios u
                ON u.id = f.usuario_id

            ORDER BY f.id DESC
        `);


        res.status(200).json(feedbacks);

    } catch (error) {

        console.error(
            "Erro ao buscar feedbacks:",
            error
        );

        res.status(500).json({
            erro: "Erro ao buscar feedbacks",
            detalhe: error.message
        });

    }

});


// =====================================================
// CADASTRAR FEEDBACK
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            usuario_id,
            comentario,
            nota
        } = req.body;


        // =================================================
        // VALIDAR USUÁRIO
        // =================================================

        if (!usuario_id) {

            return res.status(400).json({
                erro: "Usuário não informado"
            });

        }


        // =================================================
        // VALIDAR COMENTÁRIO
        // =================================================

        if (
            !comentario ||
            typeof comentario !== "string" ||
            !comentario.trim()
        ) {

            return res.status(400).json({
                erro: "O comentário é obrigatório"
            });

        }


        if (comentario.trim().length < 5) {

            return res.status(400).json({
                erro:
                    "O comentário deve possuir pelo menos 5 caracteres"
            });

        }


        if (comentario.trim().length > 500) {

            return res.status(400).json({
                erro:
                    "O comentário deve possuir no máximo 500 caracteres"
            });

        }


        // =================================================
        // VALIDAR ESTRELAS
        // =================================================

        const notaFinal = Number(nota);


        // Não permite nota vazia, NaN ou fora de 1 a 5

        if (
            !Number.isInteger(notaFinal) ||
            notaFinal < 1 ||
            notaFinal > 5
        ) {

            return res.status(400).json({
                erro:
                    "A avaliação deve possuir entre 1 e 5 estrelas"
            });

        }


        // =================================================
        // VERIFICAR USUÁRIO
        // =================================================

        const [usuarios] = await db.query(
            `
                SELECT
                    id,
                    nome,
                    foto
                FROM usuarios
                WHERE id = ?
            `,
            [usuario_id]
        );


        if (usuarios.length === 0) {

            return res.status(400).json({
                erro: "Usuário não encontrado"
            });

        }


        const usuario = usuarios[0];


        // =================================================
        // CADASTRAR FEEDBACK
        // =================================================

        const [resultado] = await db.query(
            `
                INSERT INTO feedbacks
                (
                    usuario_id,
                    nota,
                    comentario
                )
                VALUES
                (?, ?, ?)
            `,
            [
                usuario_id,
                notaFinal,
                comentario.trim()
            ]
        );


        // =================================================
        // BUSCAR FEEDBACK COMPLETO
        // =================================================

        const [feedbackCadastrado] = await db.query(
            `
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

                INNER JOIN usuarios u
                    ON u.id = f.usuario_id

                WHERE f.id = ?
            `,
            [resultado.insertId]
        );

        await registrarAtividade(db, {
            usuario_id: Number(usuario_id),
            tipo: "feedback",
            acao: "criar",
            titulo: `Novo feedback de ${usuario.nome}`,
            descricao: `Avaliacao enviada com ${notaFinal} estrela(s).`,
            referencia_id: resultado.insertId,
            valor_novo: { nota: notaFinal }
        });


        // =================================================
        // RESPOSTA
        // =================================================

        res.status(201).json({

            mensagem:
                "Feedback cadastrado com sucesso",

            feedback:
                feedbackCadastrado[0]

        });

    } catch (error) {

        console.error(
            "Erro ao cadastrar feedback:",
            error
        );

        res.status(500).json({
            erro: "Erro ao cadastrar feedback",
            detalhe: error.message
        });

    }

});


export default router;
