import express from "express";
import db from "../database.js";

import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";


const router = express.Router();


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function nomeEhSemCor(nome) {

    return String(nome || "")
        .trim()
        .toLowerCase() === "sem cor";

}


// =====================================================
// LISTAR TODAS AS OPÇÕES
//
// GET /catalogo-opcoes
// =====================================================

router.get(
    "/",
    async (_req, res) => {

        try {

            const [
                [categorias],
                [marcas],
                [cores]
            ] = await Promise.all([

                db.query(`
                    SELECT
                        id,
                        nome
                    FROM categorias
                    WHERE ativo = 1
                    ORDER BY nome ASC
                `),

                db.query(`
                    SELECT
                        id,
                        nome
                    FROM marcas
                    WHERE ativo = 1
                    ORDER BY nome ASC
                `),

                db.query(`
                    SELECT
                        id,
                        nome,
                        hexadecimal
                    FROM cores
                    WHERE ativo = 1
                    ORDER BY
                        CASE
                            WHEN LOWER(nome) = 'sem cor'
                            THEN 0
                            ELSE 1
                        END,
                        nome ASC
                `)

            ]);


            return res
                .status(200)
                .json({

                    categorias,
                    marcas,
                    cores

                });


        } catch (error) {

            console.error(
                "Erro ao carregar opções do catálogo:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível carregar as opções do catálogo.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// CADASTRAR CATEGORIA
//
// POST /catalogo-opcoes/categorias
// =====================================================

router.post(
    "/categorias",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const nome =
                String(
                    req.body?.nome || ""
                )
                    .trim();


            // =================================================
            // VALIDAR NOME
            // =================================================

            if (!nome) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe o nome da categoria."

                    });

            }


            if (
                nome.length >
                120
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O nome da categoria pode ter no máximo 120 caracteres."

                    });

            }


            // =================================================
            // VERIFICAR SE JÁ EXISTE
            // =================================================

            const [existente] =
                await db.query(
                    `
                    SELECT
                        id
                    FROM categorias
                    WHERE LOWER(nome) = LOWER(?)
                    LIMIT 1
                    `,
                    [
                        nome
                    ]
                );


            if (
                existente.length >
                0
            ) {

                return res
                    .status(409)
                    .json({

                        erro:
                            "Esta categoria já está cadastrada."

                    });

            }


            // =================================================
            // CADASTRAR
            // =================================================

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO categorias
                    (
                        nome,
                        ativo
                    )
                    VALUES
                    (
                        ?,
                        1
                    )
                    `,
                    [
                        nome
                    ]
                );


            return res
                .status(201)
                .json({

                    mensagem:
                        "Categoria cadastrada com sucesso.",

                    categoria: {

                        id:
                            resultado.insertId,

                        nome

                    }

                });


        } catch (error) {

            console.error(
                "Erro ao cadastrar categoria:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Erro ao cadastrar categoria.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// CADASTRAR MARCA
//
// POST /catalogo-opcoes/marcas
// =====================================================

router.post(
    "/marcas",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const nome =
                String(
                    req.body?.nome || ""
                )
                    .trim()
                    .toUpperCase();


            // =================================================
            // VALIDAR
            // =================================================

            if (!nome) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe o nome da marca."

                    });

            }


            if (
                nome.length >
                120
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O nome da marca pode ter no máximo 120 caracteres."

                    });

            }


            // =================================================
            // VERIFICAR SE JÁ EXISTE
            // =================================================

            const [existente] =
                await db.query(
                    `
                    SELECT
                        id
                    FROM marcas
                    WHERE LOWER(nome) = LOWER(?)
                    LIMIT 1
                    `,
                    [
                        nome
                    ]
                );


            if (
                existente.length >
                0
            ) {

                return res
                    .status(409)
                    .json({

                        erro:
                            "Esta marca já está cadastrada."

                    });

            }


            // =================================================
            // CADASTRAR
            // =================================================

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO marcas
                    (
                        nome,
                        ativo
                    )
                    VALUES
                    (
                        ?,
                        1
                    )
                    `,
                    [
                        nome
                    ]
                );


            return res
                .status(201)
                .json({

                    mensagem:
                        "Marca cadastrada com sucesso.",

                    marca: {

                        id:
                            resultado.insertId,

                        nome

                    }

                });


        } catch (error) {

            console.error(
                "Erro ao cadastrar marca:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Erro ao cadastrar marca.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// CADASTRAR COR
//
// POST /catalogo-opcoes/cores
//
// COR NORMAL:
// {
//     "nome": "Azul Oceano",
//     "hexadecimal": "#205BA8"
// }
//
// SEM COR:
// {
//     "nome": "Sem cor",
//     "hexadecimal": null
// }
// =====================================================

router.post(
    "/cores",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const nome =
                String(
                    req.body?.nome || ""
                )
                    .trim();


            // =================================================
            // VALIDAR NOME
            // =================================================

            if (!nome) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe o nome da cor."

                    });

            }


            if (
                nome.length >
                120
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O nome da cor pode ter no máximo 120 caracteres."

                    });

            }


            // =================================================
            // IDENTIFICAR "SEM COR"
            // =================================================

            const semCor =
                nomeEhSemCor(
                    nome
                );


            let hexadecimal =
                null;


            // =================================================
            // COR NORMAL
            //
            // Só exige hexadecimal quando NÃO for "Sem cor"
            // =================================================

            if (!semCor) {

                hexadecimal =
                    String(
                        req.body?.hexadecimal || ""
                    )
                        .trim()
                        .toUpperCase();


                if (!hexadecimal) {

                    return res
                        .status(400)
                        .json({

                            erro:
                                "Informe o código hexadecimal da cor."

                        });

                }


                const regexHex =
                    /^#[0-9A-F]{6}$/i;


                if (
                    !regexHex.test(
                        hexadecimal
                    )
                ) {

                    return res
                        .status(400)
                        .json({

                            erro:
                                "Informe uma cor hexadecimal válida. Ex.: #FFFFFF"

                        });

                }

            }


            // =================================================
            // VERIFICAR SE JÁ EXISTE
            // =================================================

            const [existente] =
                await db.query(
                    `
                    SELECT
                        id,
                        nome,
                        hexadecimal,
                        ativo
                    FROM cores
                    WHERE LOWER(nome) = LOWER(?)
                    LIMIT 1
                    `,
                    [
                        nome
                    ]
                );


            if (
                existente.length >
                0
            ) {

                return res
                    .status(409)
                    .json({

                        erro:
                            "Esta cor já está cadastrada."

                    });

            }


            // =================================================
            // CADASTRAR
            // =================================================

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO cores
                    (
                        nome,
                        hexadecimal,
                        ativo
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        1
                    )
                    `,
                    [
                        semCor
                            ? "Sem cor"
                            : nome,

                        hexadecimal
                    ]
                );


            return res
                .status(201)
                .json({

                    mensagem:
                        semCor
                            ? "Opção 'Sem cor' cadastrada com sucesso."
                            : "Cor cadastrada com sucesso.",

                    cor: {

                        id:
                            resultado.insertId,

                        nome:
                            semCor
                                ? "Sem cor"
                                : nome,

                        hexadecimal

                    }

                });


        } catch (error) {

            console.error(
                "Erro ao cadastrar cor:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Erro ao cadastrar cor.",

                    detalhe:
                        error.message

                });

        }

    }
);


export default router;