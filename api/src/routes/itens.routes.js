import express from "express";
import pool from "../database.js";

import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";

import upload from "../middlewares/upload.js";


const router = express.Router();


// =====================================================
// CATEGORIAS PERMITIDAS
// =====================================================

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


// =====================================================
// LISTAR TODOS OS ITENS
// =====================================================

router.get(
    "/",
    autenticarToken,
    async (req, res) => {

        try {

            const sql = `
                SELECT
                    id,
                    nome,
                    descricao,
                    categoria,
                    marca,
                    cor,
                    preco,
                    quantidade,
                    foto,

                    CASE
                        WHEN quantidade > 0
                        THEN 'Ativo'
                        ELSE 'Inativo'
                    END AS status,

                    COALESCE(
                        (
                            SELECT
                                COUNT(
                                    DISTINCT ip.pedido_id
                                )

                            FROM itens_pedidos ip

                            WHERE
                                ip.produto_id = itens.id
                        ),
                        0
                    ) AS quantidade_pedidos,

                    criado_em,
                    atualizado_em

                FROM itens

                ORDER BY id DESC
            `;


            const [itens] =
                await pool.query(sql);


            return res.status(200).json(
                itens
            );


        } catch (error) {

            console.error(
                "Erro ao listar itens:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao listar itens.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// BUSCAR ITEM POR ID
// =====================================================

router.get(
    "/:id",
    autenticarToken,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const sql = `
                SELECT
                    id,
                    nome,
                    descricao,
                    categoria,
                    marca,
                    cor,
                    preco,
                    quantidade,
                    foto,

                    CASE
                        WHEN quantidade > 0
                        THEN 'Ativo'
                        ELSE 'Inativo'
                    END AS status,

                    criado_em,
                    atualizado_em

                FROM itens

                WHERE id = ?
            `;


            const [resultado] =
                await pool.query(
                    sql,
                    [id]
                );


            if (
                resultado.length === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Item não encontrado."

                });

            }


            return res.status(200).json(
                resultado[0]
            );


        } catch (error) {

            console.error(
                "Erro ao buscar item:",
                error
            );


            return res.status(500).json({

                erro:
                    "Erro ao buscar item.",

                detalhe:
                    error.message

            });

        }

    }
);


// =====================================================
// CRIAR ITEM
// =====================================================

router.post(
    "/",

    autenticarToken,

    autorizarTipos(
        "admin"
    ),

    upload.single(
        "foto"
    ),

    async (req, res) => {

        try {

            const {

                nome,

                descricao,

                categoria,

                marca,

                cor,

                preco,

                quantidade

            } = req.body;


            // =================================================
            // FOTO
            // =================================================

            const foto =
                req.file
                    ? `uploads/${req.file.filename}`
                    : null;


            // =================================================
            // VALIDAR CAMPOS OBRIGATÓRIOS
            // =================================================

            if (
                !nome?.trim() ||
                !categoria?.trim() ||
                !marca?.trim() ||
                !cor?.trim() ||
                preco === undefined ||
                preco === "" ||
                quantidade === undefined ||
                quantidade === ""
            ) {

                return res.status(400).json({

                    erro:
                        "Nome, categoria, marca, cor, preço e quantidade são obrigatórios."

                });

            }


            // =================================================
            // VALIDAR CATEGORIA
            // =================================================

            if (
                !categoriasPermitidas.includes(
                    categoria.trim()
                )
            ) {

                return res.status(400).json({

                    erro:
                        "Categoria inválida."

                });

            }


            // =================================================
            // CONVERTER VALORES
            // =================================================

            const precoNumero =
                Number(preco);


            const quantidadeNumero =
                Number(quantidade);


            // =================================================
            // VALIDAR PREÇO
            // =================================================

            if (
                Number.isNaN(precoNumero) ||
                precoNumero < 0
            ) {

                return res.status(400).json({

                    erro:
                        "Preço inválido."

                });

            }


            // =================================================
            // VALIDAR QUANTIDADE
            // =================================================

            if (
                Number.isNaN(
                    quantidadeNumero
                ) ||
                quantidadeNumero < 0
            ) {

                return res.status(400).json({

                    erro:
                        "Quantidade inválida."

                });

            }


            // =================================================
            // VALIDAR QUANTIDADE INTEIRA
            // =================================================

            if (
                !Number.isInteger(
                    quantidadeNumero
                )
            ) {

                return res.status(400).json({

                    erro:
                        "A quantidade deve ser um número inteiro."

                });

            }


            // =================================================
            // STATUS AUTOMÁTICO
            // =================================================

            const status =
                quantidadeNumero > 0
                    ? "Ativo"
                    : "Inativo";


            // =================================================
            // INSERIR ITEM
            // =================================================

            const sql = `
                INSERT INTO itens
                (
                    nome,
                    descricao,
                    categoria,
                    marca,
                    cor,
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
                    ?,
                    ?,
                    ?
                )
            `;


            const [resultado] =
                await pool.query(
                    sql,
                    [

                        nome.trim(),

                        descricao?.trim()
                            || null,

                        categoria.trim(),

                        marca.trim(),

                        cor.trim(),

                        precoNumero,

                        quantidadeNumero,

                        status,

                        foto

                    ]
                );


            // =================================================
            // BUSCAR ITEM CRIADO
            // =================================================

            const [itemCriado] =
                await pool.query(
                    `
                        SELECT
                            id,
                            nome,
                            descricao,
                            categoria,
                            marca,
                            cor,
                            preco,
                            quantidade,
                            foto,

                            CASE
                                WHEN quantidade > 0
                                THEN 'Ativo'
                                ELSE 'Inativo'
                            END AS status,

                            criado_em,
                            atualizado_em

                        FROM itens

                        WHERE id = ?
                    `,
                    [
                        resultado.insertId
                    ]
                );


            return res.status(201).json({

                mensagem:
                    "Item cadastrado com sucesso!",

                item:
                    itemCriado[0]

            });


        } catch (error) {

            console.error(
                "========== ERRO AO CRIAR ITEM =========="
            );

            console.error(
                error
            );

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

                erro:
                    "Erro ao criar item.",

                detalhe:
                    error.message

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

    autorizarTipos(
        "admin"
    ),

    upload.single(
        "foto"
    ),

    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {

                nome,

                descricao,

                categoria,

                marca,

                cor,

                preco,

                quantidade

            } = req.body;


            // =================================================
            // VALIDAR CAMPOS OBRIGATÓRIOS
            // =================================================

            if (
                !nome?.trim() ||
                !categoria?.trim() ||
                !marca?.trim() ||
                !cor?.trim() ||
                preco === undefined ||
                preco === "" ||
                quantidade === undefined ||
                quantidade === ""
            ) {

                return res.status(400).json({

                    erro:
                        "Nome, categoria, marca, cor, preço e quantidade são obrigatórios."

                });

            }


            // =================================================
            // VALIDAR CATEGORIA
            // =================================================

            if (
                !categoriasPermitidas.includes(
                    categoria.trim()
                )
            ) {

                return res.status(400).json({

                    erro:
                        "Categoria inválida."

                });

            }


            // =================================================
            // CONVERTER VALORES
            // =================================================

            const precoNumero =
                Number(preco);


            const quantidadeNumero =
                Number(quantidade);


            // =================================================
            // VALIDAR PREÇO
            // =================================================

            if (
                Number.isNaN(
                    precoNumero
                ) ||
                precoNumero < 0
            ) {

                return res.status(400).json({

                    erro:
                        "Preço inválido."

                });

            }


            // =================================================
            // VALIDAR QUANTIDADE
            // =================================================

            if (
                Number.isNaN(
                    quantidadeNumero
                ) ||
                quantidadeNumero < 0
            ) {

                return res.status(400).json({

                    erro:
                        "Quantidade inválida."

                });

            }


            // =================================================
            // VALIDAR QUANTIDADE INTEIRA
            // =================================================

            if (
                !Number.isInteger(
                    quantidadeNumero
                )
            ) {

                return res.status(400).json({

                    erro:
                        "A quantidade deve ser um número inteiro."

                });

            }


            // =================================================
            // BUSCAR ITEM ATUAL
            // =================================================

            const [itemAtual] =
                await pool.query(
                    `
                        SELECT
                            id,
                            foto

                        FROM itens

                        WHERE id = ?
                    `,
                    [
                        id
                    ]
                );


            if (
                itemAtual.length === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Item não encontrado."

                });

            }


            // =================================================
            // FOTO
            // =================================================

            const foto =
                req.file
                    ? `uploads/${req.file.filename}`
                    : itemAtual[0].foto;


            // =================================================
            // STATUS AUTOMÁTICO
            // =================================================

            const status =
                quantidadeNumero > 0
                    ? "Ativo"
                    : "Inativo";


            // =================================================
            // ATUALIZAR ITEM
            // =================================================

            const sql = `
                UPDATE itens

                SET
                    nome = ?,

                    descricao = ?,

                    categoria = ?,

                    marca = ?,

                    cor = ?,

                    preco = ?,

                    quantidade = ?,

                    status = ?,

                    foto = ?

                WHERE id = ?
            `;


            const [resultado] =
                await pool.query(
                    sql,
                    [

                        nome.trim(),

                        descricao?.trim()
                            || null,

                        categoria.trim(),

                        marca.trim(),

                        cor.trim(),

                        precoNumero,

                        quantidadeNumero,

                        status,

                        foto,

                        id

                    ]
                );


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Item não encontrado."

                });

            }


            // =================================================
            // BUSCAR ITEM ATUALIZADO
            // =================================================

            const [itemAtualizado] =
                await pool.query(
                    `
                        SELECT
                            id,
                            nome,
                            descricao,
                            categoria,
                            marca,
                            cor,
                            preco,
                            quantidade,
                            foto,

                            CASE
                                WHEN quantidade > 0
                                THEN 'Ativo'
                                ELSE 'Inativo'
                            END AS status,

                            COALESCE(
                                (
                                    SELECT
                                        COUNT(
                                            DISTINCT ip.pedido_id
                                        )

                                    FROM itens_pedidos ip

                                    WHERE
                                        ip.produto_id = itens.id
                                ),
                                0
                            ) AS quantidade_pedidos,

                            criado_em,
                            atualizado_em

                        FROM itens

                        WHERE id = ?
                    `,
                    [
                        id
                    ]
                );


            return res.status(200).json({

                mensagem:
                    "Item atualizado com sucesso!",

                item:
                    itemAtualizado[0]

            });


        } catch (error) {

            console.error(
                "========== ERRO AO ATUALIZAR ITEM =========="
            );

            console.error(
                error
            );

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

                erro:
                    "Erro ao atualizar item.",

                detalhe:
                    error.message

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

    autorizarTipos(
        "admin"
    ),

    async (req, res) => {

        try {

            const { id } =
                req.params;


            // =================================================
            // VERIFICAR SE ITEM EXISTE
            // =================================================

            const [item] =
                await pool.query(
                    `
                        SELECT id

                        FROM itens

                        WHERE id = ?
                    `,
                    [
                        id
                    ]
                );


            if (
                item.length === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Item não encontrado."

                });

            }


            // =================================================
            // EXCLUIR
            // =================================================

            const sql = `
                DELETE FROM itens
                WHERE id = ?
            `;


            await pool.query(
                sql,
                [
                    id
                ]
            );


            return res.status(200).json({

                mensagem:
                    "Item excluído com sucesso!"

            });


        } catch (error) {

            console.error(
                "Erro ao excluir item:",
                error
            );


            // =================================================
            // ITEM POSSUI RELACIONAMENTOS
            // =================================================

            if (
                error.code ===
                "ER_ROW_IS_REFERENCED_2"
            ) {

                return res.status(409).json({

                    erro:
                        "Não é possível excluir este item porque ele está relacionado a pedidos existentes."

                });

            }


            return res.status(500).json({

                erro:
                    "Erro ao deletar item.",

                detalhe:
                    error.message

            });

        }

    }
);


export default router;