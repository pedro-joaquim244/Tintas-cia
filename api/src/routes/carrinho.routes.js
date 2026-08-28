import express from "express";
import pool from "../database.js";

const router = express.Router();


// ==========================
// LISTAR CARRINHO
// ==========================

router.get("/:usuario_id", async (req, res) => {

    try {

        const { usuario_id } = req.params;


        const sql = `
            SELECT
                c.id,
                c.quantidade,
                i.id AS produto_id,
                i.nome,
                i.descricao,
                i.preco,
                i.foto,
                i.quantidade AS estoque_disponivel,
                (c.quantidade * i.preco) AS subtotal
            FROM carrinho c
            INNER JOIN itens i
                ON c.produto_id = i.id
            WHERE c.usuario_id = ?
            ORDER BY c.criado_em DESC
        `;


        const [resultado] = await pool.query(
            sql,
            [usuario_id]
        );


        return res.json(resultado);



    } catch (error) {

        console.log(error);


        return res.status(500).json({
            erro: "Erro ao buscar carrinho"
        });

    }

});





// ==========================
// ADICIONAR PRODUTO
// ==========================

router.post("/", async (req, res) => {

    try {


        const {
            usuario_id,
            produto_id,
            quantidade
        } = req.body;

        const quantidadeSolicitada = Number(quantidade || 1);

        if (!Number.isInteger(quantidadeSolicitada) || quantidadeSolicitada <= 0) {
            return res.status(400).json({
                erro: "Quantidade inválida"
            });
        }



        if (!usuario_id || !produto_id) {

            return res.status(400).json({
                erro: "Usuário e produto são obrigatórios"
            });

        }




        // verifica se produto existe

        const [produto] = await pool.query(
            `
            SELECT id, quantidade
            FROM itens
            WHERE id = ?
            `,
            [
                produto_id
            ]
        );



        if (produto.length === 0) {

            return res.status(404).json({
                erro: "Produto não encontrado"
            });

        }

        if (produto[0].quantidade < quantidadeSolicitada) {
            return res.status(409).json({
                erro: `Estoque insuficiente. Disponível: ${produto[0].quantidade} unidade(s).`
            });
        }





        // verifica se já existe no carrinho

        const [existe] = await pool.query(
            `
            SELECT *
            FROM carrinho
            WHERE usuario_id = ?
            AND produto_id = ?
            `,
            [
                usuario_id,
                produto_id
            ]
        );






        const quantidadeAtual = existe.length > 0
            ? Number(existe[0].quantidade)
            : 0;

        if (quantidadeAtual + quantidadeSolicitada > produto[0].quantidade) {
            return res.status(409).json({
                erro: `Estoque insuficiente. Disponível para adicionar: ${Math.max(produto[0].quantidade - quantidadeAtual, 0)} unidade(s).`
            });
        }

        if (existe.length > 0) {


            await pool.query(
                `
                UPDATE carrinho
                SET quantidade = quantidade + ?
                WHERE id = ?
                `,
                [
                    quantidadeSolicitada,
                    existe[0].id
                ]
            );



            return res.json({

                mensagem: "Quantidade atualizada"

            });



        }





        // inserir novo produto

        await pool.query(
            `
            INSERT INTO carrinho
            (
                usuario_id,
                produto_id,
                quantidade
            )
            VALUES
            (?,?,?)
            `,
            [
                usuario_id,
                produto_id,
                quantidadeSolicitada
            ]
        );




        return res.status(201).json({

            mensagem: "Produto adicionado ao carrinho"

        });




    } catch (error) {


        console.log(error);


        return res.status(500).json({

            erro: error.message

        });


    }


});







// ==========================
// ALTERAR QUANTIDADE
// ==========================

router.put("/:id", async (req, res) => {


    try {


        const { id } = req.params;

        const { quantidade } = req.body;

        const quantidadeSolicitada = Number(quantidade);



        if (!Number.isInteger(quantidadeSolicitada) || quantidadeSolicitada <= 0) {

            return res.status(400).json({

                erro: "Quantidade inválida"

            });

        }

        const [item] = await pool.query(
            `
            SELECT c.id, i.quantidade AS estoque_disponivel
            FROM carrinho c
            INNER JOIN itens i ON i.id = c.produto_id
            WHERE c.id = ?
            `,
            [id]
        );

        if (item.length === 0) {
            return res.status(404).json({
                erro: "Item do carrinho não encontrado"
            });
        }

        if (quantidadeSolicitada > item[0].estoque_disponivel) {
            return res.status(409).json({
                erro: `Estoque insuficiente. Disponível: ${item[0].estoque_disponivel} unidade(s).`
            });
        }




        await pool.query(
            `
            UPDATE carrinho
            SET quantidade = ?
            WHERE id = ?
            `,
            [
                quantidadeSolicitada,
                id
            ]
        );



        return res.json({

            mensagem: "Quantidade alterada"

        });



    } catch (error) {


        console.log(error);


        return res.status(500).json({

            erro: error.message

        });


    }


});







// ==========================
// REMOVER ITEM
// ==========================

router.delete("/:id", async (req, res) => {


    try {


        const { id } = req.params;



        await pool.query(
            `
            DELETE FROM carrinho
            WHERE id = ?
            `,
            [
                id
            ]
        );



        return res.json({

            mensagem: "Produto removido"

        });



    } catch (error) {


        console.log(error);


        return res.status(500).json({

            erro: error.message

        });


    }


});







// ==========================
// LIMPAR CARRINHO
// ==========================

router.delete("/usuario/:usuario_id", async (req, res) => {


    try {


        const { usuario_id } = req.params;



        await pool.query(
            `
            DELETE FROM carrinho
            WHERE usuario_id = ?
            `,
            [
                usuario_id
            ]
        );



        return res.json({

            mensagem: "Carrinho limpo"

        });



    } catch (error) {


        console.log(error);


        return res.status(500).json({

            erro: error.message

        });


    }


});



export default router;