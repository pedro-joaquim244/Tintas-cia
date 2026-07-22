    import express from 'express';
    import pool from '../database.js';
    import { autenticarToken, autorizarTipos } from '../middlewares/autenticacao.js';
    import upload from "../middlewares/upload.js";

    const router = express.Router();

    router.get("/", autenticarToken, async (req, res) => {
        try {
            const sql = `
        SELECT
        id,
        nome,
        descricao,
        preco,
        quantidade,
        foto,
        criado_em,
        atualizado_em
        FROM itens
        ORDER BY id DESC
        `;

            const [itens] = await pool.query(sql)
            return res.json(itens)

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "Erro ao listar itens.",
            })

        }

    });

    router.get("/:id", autenticarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const sql = `
            SELECT
            *
            FROM itens
            WHERE id = ?
            `;
            const [resultado] = await pool.query(sql, [id]);

            if (resultado.length === 0) {
                return res.status(404).json({
                    erro: "item nao encontrado"
                })
            }
            return res.json(resultado[0]);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                erro: "erro ao buscar item."
            })

        }


    });

router.post(
    "/",
    autenticarToken,
    autorizarTipos("admin"),
    upload.single("foto"),
    async (req, res) => {
        try {

            const {
                nome,
                descricao,
                preco,
                quantidade
            } = req.body;

            const foto = req.file
                ? `uploads/${req.file.filename}`
                : null;

            if (!nome || preco === undefined) {
                return res.status(400).json({
                    erro: "Nome e preço são obrigatórios."
                });
            }

            const sql = `
                INSERT INTO itens
                (
                    nome,
                    descricao,
                    preco,
                    quantidade,
                    foto
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
            `;

            const [resultado] = await pool.query(sql, [
                nome,
                descricao || null,
                preco,
                quantidade || 0,
                foto
            ]);

            const [itemCriado] = await pool.query(
                `
                SELECT *
                FROM itens
                WHERE id = ?
                `,
                [resultado.insertId]
            );

            return res.status(201).json(itemCriado[0]);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: "Erro ao criar item."
            });

        }
    }
);

router.put(
    "/:id",
    autenticarToken,
    autorizarTipos("admin"),
    upload.single("foto"),
    async (req, res) => {
        try {

            const { id } = req.params;

            const {
                nome,
                descricao,
                preco,
                quantidade
            } = req.body;

            if (!nome || preco === undefined || quantidade === undefined) {
                return res.status(400).json({
                    erro: "Nome, preço e quantidade são obrigatórios."
                });
            }

            // Busca o item atual
            const [itemAtual] = await pool.query(
                `
                SELECT foto
                FROM itens
                WHERE id = ?
                `,
                [id]
            );

            if (itemAtual.length === 0) {
                return res.status(404).json({
                    erro: "Item não encontrado."
                });
            }

            // Mantém a foto antiga caso nenhuma nova seja enviada
            const foto = req.file
                ? `uploads/${req.file.filename}`
                : itemAtual[0].foto;

            const sql = `
                UPDATE itens
                SET
                    nome = ?,
                    descricao = ?,
                    preco = ?,
                    quantidade = ?,
                    foto = ?
                WHERE id = ?
            `;

            const [resultado] = await pool.query(sql, [
                nome,
                descricao || null,
                preco,
                quantidade,
                foto,
                id
            ]);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: "Item não encontrado."
                });
            }

            const [itemAtualizado] = await pool.query(
                `
                SELECT *
                FROM itens
                WHERE id = ?
                `,
                [id]
            );

            return res.status(200).json(itemAtualizado[0]);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: "Erro ao atualizar item."
            });

        }
    }
);
    


router.delete("/:id", autenticarToken, autorizarTipos("admin"), async (req, res) => {
        try {
            const { id } = req.params;

            const sql = `
            DELETE from itens
            WHERE id = ?
            `
            const [resultado] = await pool.query(sql, [id]);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: "item nao encontardo"
                })
            }
            return res.status(200).json({
                mensagem: "item excluido com sucesso!"
            });

        }
        catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "erro deletar item :("
            });
        }
    });

    export default router;
