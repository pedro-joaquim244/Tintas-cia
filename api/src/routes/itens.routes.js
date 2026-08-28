import express from 'express';
import pool from '../database.js';
import { autenticarToken, autorizarTipos } from '../middlewares/autenticacao.js';
import upload from "../middlewares/upload.js";

const router = express.Router();


// =====================================================
// LISTAR TODOS OS ITENS
// =====================================================

router.get("/", autenticarToken, async (req, res) => {

    try {

        const sql = `
            SELECT
                id,
                nome,
                descricao,
                categoria,
                preco,
                quantidade,
                foto,
                CASE WHEN quantidade > 0 THEN 'Ativo' ELSE 'Inativo' END AS status,
                COALESCE((
                    SELECT COUNT(DISTINCT ip.pedido_id)
                    FROM itens_pedidos ip
                    WHERE ip.produto_id = itens.id
                ), 0) AS quantidade_pedidos,
                criado_em,
                atualizado_em
            FROM itens
            ORDER BY id DESC
        `;

        const [itens] = await pool.query(sql);

        return res.json(itens);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            erro: "Erro ao listar itens."
        });

    }

});


// =====================================================
// BUSCAR ITEM POR ID
// =====================================================

router.get("/:id", autenticarToken, async (req, res) => {

    try {

        const { id } = req.params;

        const sql = `
            SELECT
                id,
                nome,
                descricao,
                categoria,
                preco,
                quantidade,
                foto,
                status,
                criado_em,
                atualizado_em
            FROM itens
            WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.length === 0) {

            return res.status(404).json({
                erro: "Item não encontrado."
            });

        }

        return res.json(resultado[0]);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            erro: "Erro ao buscar item."
        });

    }

});


// =====================================================
// CRIAR ITEM
// =====================================================

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
                categoria,
                preco,
                quantidade
            } = req.body;


            const foto = req.file
                ? `uploads/${req.file.filename}`
                : null;


            // =============================================
            // VALIDAÇÕES
            // =============================================

            if (!nome || preco === undefined) {

                return res.status(400).json({
                    erro: "Nome e preço são obrigatórios."
                });

            }


            if (!categoria) {

                return res.status(400).json({
                    erro: "A categoria é obrigatória."
                });

            }


            // =============================================
            // CATEGORIAS PERMITIDAS
            // =============================================

            const categoriasPermitidas = [

                "Tintas para Parede",

                "Tintas para Área Externa",

                "Tintas para Madeira",

                "Tintas para Metal",

                "Efeitos e Acabamentos",

                "Proteção e Segurança",

                "Pincéis e Acessórios",

                "Ferramentas",

                "Preparação de Superfície",

                "Complementos",

                "Outros"

            ];


            if (!categoriasPermitidas.includes(categoria)) {

                return res.status(400).json({
                    erro: "Categoria inválida."
                });

            }


            // =============================================
            // INSERIR
            // =============================================

            const sql = `
                INSERT INTO itens
                (
                    nome,
                    descricao,
                    categoria,
                    preco,
                    quantidade,
                    status,
                    foto
                )
                VALUES
                (
                    ?,
                    ?,
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

                categoria,

                Number(preco),

                Number(quantidade) || 0,

                Number(quantidade) > 0 ? "Ativo" : "Inativo",

                foto

            ]);


            // =============================================
            // BUSCAR ITEM CRIADO
            // =============================================

            const [itemCriado] = await pool.query(
                `
                    SELECT
                        id,
                        nome,
                        descricao,
                        categoria,
                        preco,
                        quantidade,
                        foto,
                        CASE WHEN quantidade > 0 THEN 'Ativo' ELSE 'Inativo' END AS status,
                        criado_em,
                        atualizado_em
                    FROM itens
                    WHERE id = ?
                `,
                [resultado.insertId]
            );


            return res.status(201).json(itemCriado[0]);

        } catch (error) {

            console.error("========== ERRO AO CRIAR ITEM ==========");
            console.error(error);
            console.error("Mensagem:", error.message);
            console.error("Código:", error.code);
            console.error("SQL:", error.sql);


            return res.status(500).json({
                erro: "Erro ao criar item."
            });

        }

    }
);


// =====================================================
// ATUALIZAR ITEM
// =====================================================

router.put(
    "/:id",
    autenticarToken,
    autorizarTipos("admin"),
    upload.single("foto"),
    async (req, res) => {

        try {

            const { id } = req.params;


            let {
                nome,
                descricao,
                categoria,
                preco,
                quantidade
            } = req.body;


            // =============================================
            // VALIDAÇÕES
            // =============================================

            if (
                !nome ||
                preco === undefined ||
                quantidade === undefined ||
                !categoria
            ) {

                return res.status(400).json({
                    erro: "Nome, categoria, preço e quantidade são obrigatórios."
                });

            }


            // =============================================
            // CATEGORIAS PERMITIDAS
            // =============================================

            const categoriasPermitidas = [

                "Tintas para Parede",

                "Tintas para Área Externa",

                "Tintas para Madeira",

                "Tintas para Metal",

                "Efeitos e Acabamentos",

                "Proteção e Segurança",

                "Pincéis e Acessórios",

                "Ferramentas",

                "Preparação de Superfície",

                "Complementos",

                "Outros"

            ];


            if (!categoriasPermitidas.includes(categoria)) {

                return res.status(400).json({
                    erro: "Categoria inválida."
                });

            }


            // =============================================
            // BUSCAR ITEM ATUAL
            // =============================================

            const [itemAtual] = await pool.query(
                `
                    SELECT
                        foto
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


            // =============================================
            // FOTO
            // =============================================

            const foto = req.file
                ? `uploads/${req.file.filename}`
                : itemAtual[0].foto;


            // =============================================
            // ATUALIZAR
            // =============================================

            const sql = `
                UPDATE itens
                SET
                    nome = ?,
                    descricao = ?,
                    categoria = ?,
                    preco = ?,
                    quantidade = ?,
                    status = CASE WHEN ? > 0 THEN 'Ativo' ELSE 'Inativo' END,
                    foto = ?
                WHERE id = ?
            `;


            const [resultado] = await pool.query(sql, [

                nome,

                descricao || null,

                categoria,

                Number(preco),

                Number(quantidade),

                Number(quantidade),

                foto,

                id

            ]);


            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    erro: "Item não encontrado."
                });

            }


            // =============================================
            // BUSCAR ITEM ATUALIZADO
            // =============================================

            const [itemAtualizado] = await pool.query(
                `
                    SELECT
                        id,
                        nome,
                        descricao,
                        categoria,
                        preco,
                        quantidade,
                        foto,
                        CASE WHEN quantidade > 0 THEN 'Ativo' ELSE 'Inativo' END AS status,
                        COALESCE((
                            SELECT COUNT(DISTINCT ip.pedido_id)
                            FROM itens_pedidos ip
                            WHERE ip.produto_id = itens.id
                        ), 0) AS quantidade_pedidos,
                        criado_em,
                        atualizado_em
                    FROM itens
                    WHERE id = ?
                `,
                [id]
            );


            return res.status(200).json(
                itemAtualizado[0]
            );

        } catch (error) {

            console.error(
                "========== ERRO AO ATUALIZAR ITEM =========="
            );

            console.error(error);

            console.error(
                "Mensagem:",
                error.message
            );

            console.error(
                "Código:",
                error.code
            );

            console.error(
                "SQL:",
                error.sql
            );


            return res.status(500).json({
                erro: error.message
            });

        }

    }
);


// =====================================================
// EXCLUIR ITEM
// =====================================================

router.delete(
    "/:id",
    autenticarToken,
    autorizarTipos("admin"),
    async (req, res) => {

        try {

            const { id } = req.params;


            const sql = `
                DELETE FROM itens
                WHERE id = ?
            `;


            const [resultado] =
                await pool.query(sql, [id]);


            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    erro: "Item não encontrado."
                });

            }


            return res.status(200).json({

                mensagem:
                    "Item excluído com sucesso!"

            });

        } catch (error) {

            console.error(error);


            return res.status(500).json({

                erro:
                    "Erro ao deletar item."

            });

        }

    }
);


export default router;