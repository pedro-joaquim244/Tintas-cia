import express from "express";
import db from "../database.js";
import { calcularFrete } from "../services/frete.service.js";

import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";


const router = express.Router();


// =====================================================
// FUNÇÕES AUXILIARES DO CRUD ADMINISTRATIVO
// =====================================================

function texto(valor) {

    return String(
        valor ?? ""
    ).trim();

}


function estadoFormatado(valor) {

    return texto(valor)
        .toUpperCase();

}


function numero(valor) {

    const convertido =
        Number(valor);

    return Number.isFinite(
        convertido
    )
        ? convertido
        : null;

}


// =====================================================
// CALCULAR FRETE
//
// POST /frete/calcular
//
// BODY:
// {
//     "cidade": "Jaboticabal",
//     "estado": "SP",
//     "subtotal": 250,
//     "tipo_entrega": "ENTREGA"
// }
//
// RETIRADA:
// {
//     "tipo_entrega": "RETIRADA",
//     "subtotal": 250
// }
// =====================================================

router.post(
    "/calcular",

    async (req, res) => {

        try {

            const resultado =
                await calcularFrete({
                    tipo_entrega:
                        req.body?.tipo_entrega,
                    cidade:
                        req.body?.cidade,
                    estado:
                        req.body?.estado,
                    subtotal:
                        req.body?.subtotal,
                    executor:
                        db
                });


            return res
                .status(
                    resultado.status
                )
                .json(
                    resultado.dados
                );


        } catch (error) {

            console.error(
                "Erro ao calcular frete:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível calcular o frete.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// LISTAR FRETES
//
// GET /frete
//
// SOMENTE ADMIN
// =====================================================

router.get(
    "/",

    autenticarToken,
    autorizarTipos("admin"),

    async (_req, res) => {

        try {

            const [fretes] =
                await db.query(
                    `
                    SELECT
                        id,
                        cidade,
                        estado,
                        valor,
                        prazo_min,
                        prazo_max,
                        frete_gratis_acima,
                        ativo,
                        criado_em

                    FROM configuracoes_frete

                    ORDER BY
                        estado ASC,
                        cidade ASC
                    `
                );


            return res
                .status(200)
                .json(
                    fretes
                );


        } catch (error) {

            console.error(
                "Erro ao listar fretes:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível listar as configurações de frete.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// BUSCAR FRETE POR ID
//
// GET /frete/:id
//
// SOMENTE ADMIN
// =====================================================

router.get(
    "/:id",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "ID de frete inválido."

                    });

            }


            const [fretes] =
                await db.query(
                    `
                    SELECT
                        id,
                        cidade,
                        estado,
                        valor,
                        prazo_min,
                        prazo_max,
                        frete_gratis_acima,
                        ativo,
                        criado_em

                    FROM configuracoes_frete

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                fretes.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({

                        erro:
                            "Configuração de frete não encontrada."

                    });

            }


            return res
                .status(200)
                .json(
                    fretes[0]
                );


        } catch (error) {

            console.error(
                "Erro ao buscar frete:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível buscar a configuração de frete.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// CADASTRAR FRETE
//
// POST /frete
//
// SOMENTE ADMIN
// =====================================================

router.post(
    "/",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const cidade =
                texto(
                    req.body?.cidade
                );


            const estado =
                estadoFormatado(
                    req.body?.estado
                );


            const valor =
                numero(
                    req.body?.valor
                );


            const prazoMin =
                numero(
                    req.body?.prazo_min
                );


            const prazoMax =
                numero(
                    req.body?.prazo_max
                );


            const freteGratisAcima =

                req.body?.frete_gratis_acima ===
                    null ||

                req.body?.frete_gratis_acima ===
                    "" ||

                req.body?.frete_gratis_acima ===
                    undefined

                    ? null

                    : numero(
                        req.body
                            ?.frete_gratis_acima
                    );


            const ativo =
                req.body?.ativo ===
                undefined

                    ? 1

                    : req.body.ativo
                        ? 1
                        : 0;


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!cidade) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe a cidade."

                    });

            }


            if (
                estado.length !==
                2
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe um estado válido. Ex.: SP."

                    });

            }


            if (
                valor ===
                null ||
                valor < 0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe um valor de frete válido."

                    });

            }


            if (
                prazoMin ===
                null ||
                prazoMin < 0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe um prazo mínimo válido."

                    });

            }


            if (
                prazoMax ===
                null ||
                prazoMax <
                prazoMin
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O prazo máximo deve ser igual ou maior que o prazo mínimo."

                    });

            }


            if (
                freteGratisAcima !==
                null &&
                freteGratisAcima <
                0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "O valor mínimo para frete grátis é inválido."

                    });

            }


            // =================================================
            // VERIFICAR DUPLICADO
            // =================================================

            const [existente] =
                await db.query(
                    `
                    SELECT
                        id

                    FROM configuracoes_frete

                    WHERE
                        LOWER(TRIM(cidade)) =
                        LOWER(TRIM(?))

                        AND UPPER(TRIM(estado)) =
                        UPPER(TRIM(?))

                    LIMIT 1
                    `,
                    [
                        cidade,
                        estado
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
                            "Já existe uma configuração de frete para esta cidade."

                    });

            }


            // =================================================
            // CADASTRAR
            // =================================================

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO configuracoes_frete
                    (
                        cidade,
                        estado,
                        valor,
                        prazo_min,
                        prazo_max,
                        frete_gratis_acima,
                        ativo
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
                    `,
                    [
                        cidade,
                        estado,
                        valor,
                        prazoMin,
                        prazoMax,
                        freteGratisAcima,
                        ativo
                    ]
                );


            return res
                .status(201)
                .json({

                    mensagem:
                        "Configuração de frete cadastrada com sucesso.",

                    frete: {

                        id:
                            resultado.insertId,

                        cidade,

                        estado,

                        valor,

                        prazo_min:
                            prazoMin,

                        prazo_max:
                            prazoMax,

                        frete_gratis_acima:
                            freteGratisAcima,

                        ativo

                    }

                });


        } catch (error) {

            console.error(
                "Erro ao cadastrar frete:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível cadastrar o frete.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// EDITAR FRETE
//
// PUT /frete/:id
//
// SOMENTE ADMIN
// =====================================================

router.put(
    "/:id",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "ID inválido."

                    });

            }


            const cidade =
                texto(
                    req.body?.cidade
                );


            const estado =
                estadoFormatado(
                    req.body?.estado
                );


            const valor =
                numero(
                    req.body?.valor
                );


            const prazoMin =
                numero(
                    req.body?.prazo_min
                );


            const prazoMax =
                numero(
                    req.body?.prazo_max
                );


            const freteGratisAcima =

                req.body?.frete_gratis_acima ===
                    null ||

                req.body?.frete_gratis_acima ===
                    "" ||

                req.body?.frete_gratis_acima ===
                    undefined

                    ? null

                    : numero(
                        req.body
                            ?.frete_gratis_acima
                    );


            // =================================================
            // VALIDAR
            // =================================================

            if (
                !cidade ||
                estado.length !== 2
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Informe uma cidade e um estado válidos."

                    });

            }


            if (
                valor === null ||
                valor < 0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Valor de frete inválido."

                    });

            }


            if (
                prazoMin === null ||
                prazoMin < 0 ||
                prazoMax === null ||
                prazoMax < prazoMin
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Prazo de entrega inválido."

                    });

            }


            // =================================================
            // VERIFICAR EXISTÊNCIA
            // =================================================

            const [atual] =
                await db.query(
                    `
                    SELECT
                        id

                    FROM configuracoes_frete

                    WHERE id = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                atual.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({

                        erro:
                            "Configuração de frete não encontrada."

                    });

            }


            // =================================================
            // VERIFICAR OUTRA CIDADE IGUAL
            // =================================================

            const [duplicado] =
                await db.query(
                    `
                    SELECT
                        id

                    FROM configuracoes_frete

                    WHERE
                        LOWER(TRIM(cidade)) =
                        LOWER(TRIM(?))

                        AND UPPER(TRIM(estado)) =
                        UPPER(TRIM(?))

                        AND id <> ?

                    LIMIT 1
                    `,
                    [
                        cidade,
                        estado,
                        id
                    ]
                );


            if (
                duplicado.length >
                0
            ) {

                return res
                    .status(409)
                    .json({

                        erro:
                            "Já existe outra configuração para esta cidade."

                    });

            }


            // =================================================
            // ATUALIZAR
            // =================================================

            await db.query(
                `
                UPDATE configuracoes_frete

                SET
                    cidade = ?,
                    estado = ?,
                    valor = ?,
                    prazo_min = ?,
                    prazo_max = ?,
                    frete_gratis_acima = ?

                WHERE id = ?
                `,
                [
                    cidade,
                    estado,
                    valor,
                    prazoMin,
                    prazoMax,
                    freteGratisAcima,
                    id
                ]
            );


            return res
                .status(200)
                .json({

                    mensagem:
                        "Configuração de frete atualizada com sucesso."

                });


        } catch (error) {

            console.error(
                "Erro ao editar frete:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível atualizar o frete.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// ATIVAR / DESATIVAR FRETE
//
// PATCH /frete/:id/status
//
// BODY:
// {
//     "ativo": true
// }
//
// SOMENTE ADMIN
// =====================================================

router.patch(
    "/:id/status",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const ativo =
                req.body?.ativo
                    ? 1
                    : 0;


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "ID inválido."

                    });

            }


            const [resultado] =
                await db.query(
                    `
                    UPDATE configuracoes_frete

                    SET ativo = ?

                    WHERE id = ?
                    `,
                    [
                        ativo,
                        id
                    ]
                );


            if (
                resultado.affectedRows ===
                0
            ) {

                return res
                    .status(404)
                    .json({

                        erro:
                            "Configuração de frete não encontrada."

                    });

            }


            return res
                .status(200)
                .json({

                    mensagem:
                        ativo
                            ? "Frete ativado com sucesso."
                            : "Frete desativado com sucesso.",

                    ativo:
                        Boolean(
                            ativo
                        )

                });


        } catch (error) {

            console.error(
                "Erro ao alterar status do frete:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível alterar o status do frete.",

                    detalhe:
                        error.message

                });

        }

    }
);


// =====================================================
// EXCLUIR FRETE
//
// DELETE /frete/:id
//
// SOMENTE ADMIN
// =====================================================

router.delete(
    "/:id",

    autenticarToken,
    autorizarTipos("admin"),

    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "ID inválido."

                    });

            }


            const [resultado] =
                await db.query(
                    `
                    DELETE FROM configuracoes_frete

                    WHERE id = ?
                    `,
                    [
                        id
                    ]
                );


            if (
                resultado.affectedRows ===
                0
            ) {

                return res
                    .status(404)
                    .json({

                        erro:
                            "Configuração de frete não encontrada."

                    });

            }


            return res
                .status(200)
                .json({

                    mensagem:
                        "Configuração de frete excluída com sucesso."

                });


        } catch (error) {

            console.error(
                "Erro ao excluir frete:",
                error
            );


            return res
                .status(500)
                .json({

                    erro:
                        "Não foi possível excluir o frete.",

                    detalhe:
                        error.message

                });

        }

    }
);


export default router;
