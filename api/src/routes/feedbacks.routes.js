import express from "express";
import db from "../database.js";

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

        console.error("Erro ao buscar feedbacks:", error);

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

        if (!comentario || !comentario.trim()) {

            return res.status(400).json({
                erro: "O comentário é obrigatório"
            });

        }


        if (comentario.trim().length < 5) {

            return res.status(400).json({
                erro: "O comentário deve possuir pelo menos 5 caracteres"
            });

        }


        // =================================================
        // VALIDAR NOTA
        // =================================================

        const notaFinal = Number(nota) || 5;

        if (notaFinal < 1 || notaFinal > 5) {

            return res.status(400).json({
                erro: "A nota deve estar entre 1 e 5"
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
        // RESPOSTA
        // =================================================

        res.status(201).json({

            mensagem: "Feedback cadastrado com sucesso",

            feedback: {
                id: resultado.insertId,
                usuario_id: usuario.id,
                usuario_nome: usuario.nome,
                usuario_foto: usuario.foto,
                nota: notaFinal,
                comentario: comentario.trim()
            }

        });

    } catch (error) {

        console.error("Erro ao cadastrar feedback:", error);

        res.status(500).json({
            erro: "Erro ao cadastrar feedback",
            detalhe: error.message
        });

    }

});


export default router;