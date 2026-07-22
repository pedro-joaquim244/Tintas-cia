    import express from 'express';
    import pool from '../database.js';
    import { autenticarToken, autorizarTipos } from '../middlewares/autenticacao.js';

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

    router.post("/", autenticarToken, autorizarTipos("admin"), async (req, res) => {
        try {
            const { nome, descricao, preco, quantidade } = req.body;

            if (!nome || preco === undefined) {
                return res.status(400).json({
                    erro: "Nome e preço são obrigatórios."
                });
            }

            const sql = `
            INSERT INTO itens 
            (nome, descricao, preco, quantidade)
            VALUES
            (?, ?, ?, ?)
            `;

            const [resultado] = await pool.query(sql, [
                nome,
                descricao || null,
                preco,
                quantidade || 0,
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
                erro: "erro ao criar item :(",
            });
        }
    });

    router.put("/:id", autenticarToken, autorizarTipos("admin"), async (req, res) => {
        try {
            const { id } = req.params
            const { nome, descricao, preco, quantidade } = req.body;

            if (!nome || preco === undefined || quantidade === undefined) {
                return res.status(400).json({
                    erro: "nome, preço e quantidade são obrigatórios"
                });
            }

            const sql = `
            UPDATE itens
            SET 
            nome = ?,
            descricao = ?,
            preco = ?,
            quantidade = ?

            WHERE id = ?
            `;

            const [resultado] = await pool.query(
                sql, [
                nome,
                descricao || null,
                preco,
                quantidade,
                id
            ]);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: "item nao encontardo"
                })
            }

            const [itemAtualizado] = await pool.query(
                `
                
                SELECT 
                *
                FROM itens
                WHERE id = ?             
                
                `,
                [id]
            );

            return res.status(201).json(itemAtualizado[0]);
        }

        catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "erro aoatualizar item :("
            });

        }
    });

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
