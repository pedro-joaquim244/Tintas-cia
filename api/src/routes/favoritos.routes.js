import express from "express";

import db from "../database.js";

import {
    autenticarToken
} from "../middlewares/autenticacao.js";


const router = express.Router();


// =====================================================
// TODAS AS ROTAS PRECISAM DE LOGIN
// =====================================================

router.use(
    autenticarToken
);


// =====================================================
// PEGAR ID DO USUÁRIO LOGADO
// =====================================================

function obterUsuarioId(req) {

    return (
        req.usuario?.id ||
        req.usuarioId ||
        req.user?.id
    );

}


// =====================================================
// LISTAR FAVORITOS DO USUÁRIO
//
// GET /favoritos
// =====================================================

router.get("/", async (req, res) => {

    try {

        const usuarioId =
            obterUsuarioId(req);


        if (!usuarioId) {

            return res
                .status(401)
                .json({
                    erro:
                        "Usuário não identificado."
                });

        }


        const [favoritos] =
            await db.query(`
                SELECT
                    f.id AS favorito_id,
                    f.criado_em,

                    i.id,
                    i.nome,
                    i.descricao,
                    i.preco,
                    i.quantidade,
                    i.foto,
                    i.status,
                    i.marca,
                    i.cor

                FROM favoritos f

                INNER JOIN itens i
                    ON i.id = f.item_id

                WHERE
                    f.usuario_id = ?

                ORDER BY
                    f.id DESC
            `, [
                usuarioId
            ]);


        return res
            .status(200)
            .json(favoritos);


    } catch (error) {

        console.error(
            "Erro ao listar favoritos:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao listar favoritos.",
                detalhe:
                    error.message
            });

    }

});


// =====================================================
// FAVORITAR ITEM
//
// POST /favoritos
//
// BODY:
// {
//     "item_id": 5
// }
// =====================================================

router.post("/", async (req, res) => {

    try {

        const usuarioId =
            obterUsuarioId(req);


        const itemId =
            Number(
                req.body?.item_id
            );


        if (!usuarioId) {

            return res
                .status(401)
                .json({
                    erro:
                        "Usuário não identificado."
                });

        }


        if (
            !Number.isInteger(itemId) ||
            itemId <= 0
        ) {

            return res
                .status(400)
                .json({
                    erro:
                        "Informe um item válido."
                });

        }


        // =================================================
        // VERIFICAR SE ITEM EXISTE
        // =================================================

        const [itens] =
            await db.query(`
                SELECT
                    id

                FROM itens

                WHERE
                    id = ?

                LIMIT 1
            `, [
                itemId
            ]);


        if (
            itens.length === 0
        ) {

            return res
                .status(404)
                .json({
                    erro:
                        "Item não encontrado."
                });

        }


        // =================================================
        // VERIFICAR SE JÁ ESTÁ FAVORITADO
        // =================================================

        const [existente] =
            await db.query(`
                SELECT
                    id

                FROM favoritos

                WHERE
                    usuario_id = ?
                    AND item_id = ?

                LIMIT 1
            `, [
                usuarioId,
                itemId
            ]);


        if (
            existente.length > 0
        ) {

            return res
                .status(200)
                .json({
                    mensagem:
                        "Este item já está nos favoritos."
                });

        }


        // =================================================
        // SALVAR FAVORITO
        // =================================================

        const [resultado] =
            await db.query(`
                INSERT INTO favoritos (
                    usuario_id,
                    item_id
                )

                VALUES (?, ?)
            `, [
                usuarioId,
                itemId
            ]);


        return res
            .status(201)
            .json({
                mensagem:
                    "Item adicionado aos favoritos.",

                favorito_id:
                    resultado.insertId
            });


    } catch (error) {

        console.error(
            "Erro ao adicionar favorito:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao adicionar favorito.",
                detalhe:
                    error.message
            });

    }

});


// =====================================================
// REMOVER DOS FAVORITOS
//
// DELETE /favoritos/:itemId
// =====================================================

router.delete(
    "/:itemId",
    async (req, res) => {

        try {

            const usuarioId =
                obterUsuarioId(req);


            const itemId =
                Number(
                    req.params.itemId
                );


            if (!usuarioId) {

                return res
                    .status(401)
                    .json({
                        erro:
                            "Usuário não identificado."
                    });

            }


            const [resultado] =
                await db.query(`
                    DELETE FROM favoritos

                    WHERE
                        usuario_id = ?
                        AND item_id = ?
                `, [
                    usuarioId,
                    itemId
                ]);


            if (
                resultado.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Este item não está nos favoritos."
                    });

            }


            return res
                .status(200)
                .json({
                    mensagem:
                        "Item removido dos favoritos."
                });


        } catch (error) {

            console.error(
                "Erro ao remover favorito:",
                error
            );


            return res
                .status(500)
                .json({
                    erro:
                        "Erro ao remover favorito.",
                    detalhe:
                        error.message
                });

        }

    }
);


// =====================================================
// VERIFICAR SE UM ITEM É FAVORITO
//
// GET /favoritos/verificar/:itemId
// =====================================================

router.get(
    "/verificar/:itemId",
    async (req, res) => {

        try {

            const usuarioId =
                obterUsuarioId(req);


            const itemId =
                Number(
                    req.params.itemId
                );


            const [favoritos] =
                await db.query(`
                    SELECT
                        id

                    FROM favoritos

                    WHERE
                        usuario_id = ?
                        AND item_id = ?

                    LIMIT 1
                `, [
                    usuarioId,
                    itemId
                ]);


            return res.json({
                favorito:
                    favoritos.length > 0
            });


        } catch (error) {

            console.error(
                "Erro ao verificar favorito:",
                error
            );


            return res
                .status(500)
                .json({
                    erro:
                        "Erro ao verificar favorito."
                });

        }

    }
);


export default router;