import express from "express";
import db from "../database.js";

import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";


const router = express.Router();


// =====================================================
// SOMENTE ADMIN
// =====================================================

router.use(
    autenticarToken,
    autorizarTipos("admin")
);


// =====================================================
// LISTAR TODOS OS FORNECEDORES
//
// GET /fornecedores
// =====================================================

router.get("/", async (_req, res) => {

    try {

        const [fornecedores] = await db.query(`
            SELECT
                f.id,
                f.nome,
                f.cnpj,
                f.contato_nome,
                f.email,
                f.telefone,

                f.cep,
                f.endereco,
                f.numero,
                f.complemento,
                f.bairro,
                f.cidade,
                f.estado,

                f.ativo,

                f.criado_em,
                f.atualizado_em

            FROM fornecedores f

            ORDER BY
                f.nome ASC
        `);


        // =================================================
        // BUSCAR MARCAS DE CADA FORNECEDOR
        // =================================================

        for (const fornecedor of fornecedores) {

            const [marcas] = await db.query(`
                SELECT
                    m.id,
                    m.nome

                FROM fornecedores_marcas fm

                INNER JOIN marcas m
                    ON m.id = fm.marca_id

                WHERE
                    fm.fornecedor_id = ?

                ORDER BY
                    m.nome ASC
            `, [
                fornecedor.id
            ]);


            fornecedor.marcas = marcas;

        }


        return res
            .status(200)
            .json(fornecedores);


    } catch (error) {

        console.error(
            "Erro ao listar fornecedores:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao listar fornecedores.",
                detalhe:
                    error.message
            });

    }

});


// =====================================================
// BUSCAR FORNECEDOR POR ID
//
// GET /fornecedores/:id
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const [fornecedores] = await db.query(`
            SELECT
                id,
                nome,
                cnpj,
                contato_nome,
                email,
                telefone,

                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,

                ativo,

                criado_em,
                atualizado_em

            FROM fornecedores

            WHERE
                id = ?

            LIMIT 1
        `, [
            id
        ]);


        if (fornecedores.length === 0) {

            return res
                .status(404)
                .json({
                    erro:
                        "Fornecedor não encontrado."
                });

        }


        const fornecedor =
            fornecedores[0];


        // =================================================
        // MARCAS
        // =================================================

        const [marcas] = await db.query(`
            SELECT
                m.id,
                m.nome

            FROM fornecedores_marcas fm

            INNER JOIN marcas m
                ON m.id = fm.marca_id

            WHERE
                fm.fornecedor_id = ?

            ORDER BY
                m.nome ASC
        `, [
            id
        ]);


        fornecedor.marcas =
            marcas;


        return res
            .status(200)
            .json(fornecedor);


    } catch (error) {

        console.error(
            "Erro ao buscar fornecedor:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao buscar fornecedor.",
                detalhe:
                    error.message
            });

    }

});


// =====================================================
// CADASTRAR FORNECEDOR
//
// POST /fornecedores
// =====================================================

router.post("/", async (req, res) => {

    let conexao;


    try {

        const {
            nome,
            cnpj,

            contato_nome,
            email,
            telefone,

            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,

            ativo = true,

            marcas = []

        } = req.body;


        // =================================================
        // VALIDAR NOME
        // =================================================

        if (!nome?.trim()) {

            return res
                .status(400)
                .json({
                    erro:
                        "Informe o nome do fornecedor."
                });

        }


        // =================================================
        // VALIDAR MARCAS
        // =================================================

        if (!Array.isArray(marcas)) {

            return res
                .status(400)
                .json({
                    erro:
                        "O campo marcas deve ser uma lista."
                });

        }


        const marcasIds = [
            ...new Set(
                marcas
                    .map(Number)
                    .filter(
                        id =>
                            Number.isInteger(id) &&
                            id > 0
                    )
            )
        ];


        // =================================================
        // CONEXÃO / TRANSAÇÃO
        // =================================================

        conexao =
            await db.getConnection();


        await conexao.beginTransaction();


        // =================================================
        // VERIFICAR CNPJ DUPLICADO
        // =================================================

        if (cnpj?.trim()) {

            const [existente] =
                await conexao.query(`
                    SELECT
                        id

                    FROM fornecedores

                    WHERE
                        cnpj = ?

                    LIMIT 1
                `, [
                    cnpj.trim()
                ]);


            if (existente.length > 0) {

                await conexao.rollback();


                return res
                    .status(409)
                    .json({
                        erro:
                            "Já existe um fornecedor com este CNPJ."
                    });

            }

        }


        // =================================================
        // VALIDAR SE AS MARCAS EXISTEM
        // =================================================

        if (marcasIds.length > 0) {

            const placeholders =
                marcasIds
                    .map(() => "?")
                    .join(", ");


            const [marcasExistentes] =
                await conexao.query(`
                    SELECT
                        id

                    FROM marcas

                    WHERE
                        id IN (${placeholders})
                `, marcasIds);


            if (
                marcasExistentes.length !==
                marcasIds.length
            ) {

                await conexao.rollback();


                return res
                    .status(400)
                    .json({
                        erro:
                            "Uma ou mais marcas informadas não existem."
                    });

            }

        }


        // =================================================
        // CADASTRAR FORNECEDOR
        // =================================================

        const [resultado] =
            await conexao.query(`
                INSERT INTO fornecedores (
                    nome,
                    cnpj,

                    contato_nome,
                    email,
                    telefone,

                    cep,
                    endereco,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,

                    ativo
                )

                VALUES (
                    ?,
                    ?,

                    ?,
                    ?,
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
            `, [

                nome.trim(),

                cnpj?.trim() ||
                null,

                contato_nome?.trim() ||
                null,

                email?.trim()
                    ?.toLowerCase() ||
                null,

                telefone?.trim() ||
                null,

                cep?.trim() ||
                null,

                endereco?.trim() ||
                null,

                numero?.trim() ||
                null,

                complemento?.trim() ||
                null,

                bairro?.trim() ||
                null,

                cidade?.trim() ||
                null,

                estado?.trim()
                    ?.toUpperCase() ||
                null,

                ativo
                    ? 1
                    : 0

            ]);


        const fornecedorId =
            resultado.insertId;


        // =================================================
        // VINCULAR MARCAS
        // =================================================

        for (const marcaId of marcasIds) {

            await conexao.query(`
                INSERT INTO fornecedores_marcas (
                    fornecedor_id,
                    marca_id
                )

                VALUES (?, ?)
            `, [
                fornecedorId,
                marcaId
            ]);

        }


        await conexao.commit();


        return res
            .status(201)
            .json({
                mensagem:
                    "Fornecedor cadastrado com sucesso.",

                id:
                    fornecedorId
            });


    } catch (error) {

        if (conexao) {

            await conexao.rollback();

        }


        console.error(
            "Erro ao cadastrar fornecedor:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao cadastrar fornecedor.",
                detalhe:
                    error.message
            });


    } finally {

        if (conexao) {

            conexao.release();

        }

    }

});


// =====================================================
// EDITAR FORNECEDOR
//
// PUT /fornecedores/:id
// =====================================================

router.put("/:id", async (req, res) => {

    let conexao;


    try {

        const {
            id
        } = req.params;


        const {
            nome,
            cnpj,

            contato_nome,
            email,
            telefone,

            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,

            ativo = true,

            marcas = []

        } = req.body;


        // =================================================
        // VALIDAR
        // =================================================

        if (!nome?.trim()) {

            return res
                .status(400)
                .json({
                    erro:
                        "Informe o nome do fornecedor."
                });

        }


        if (!Array.isArray(marcas)) {

            return res
                .status(400)
                .json({
                    erro:
                        "O campo marcas deve ser uma lista."
                });

        }


        const marcasIds = [
            ...new Set(
                marcas
                    .map(Number)
                    .filter(
                        marcaId =>
                            Number.isInteger(marcaId) &&
                            marcaId > 0
                    )
            )
        ];


        conexao =
            await db.getConnection();


        await conexao.beginTransaction();


        // =================================================
        // VERIFICAR SE EXISTE
        // =================================================

        const [fornecedorExiste] =
            await conexao.query(`
                SELECT
                    id

                FROM fornecedores

                WHERE
                    id = ?

                LIMIT 1
            `, [
                id
            ]);


        if (
            fornecedorExiste.length === 0
        ) {

            await conexao.rollback();


            return res
                .status(404)
                .json({
                    erro:
                        "Fornecedor não encontrado."
                });

        }


        // =================================================
        // CNPJ DUPLICADO
        // =================================================

        if (cnpj?.trim()) {

            const [cnpjExistente] =
                await conexao.query(`
                    SELECT
                        id

                    FROM fornecedores

                    WHERE
                        cnpj = ?
                        AND id <> ?

                    LIMIT 1
                `, [
                    cnpj.trim(),
                    id
                ]);


            if (
                cnpjExistente.length > 0
            ) {

                await conexao.rollback();


                return res
                    .status(409)
                    .json({
                        erro:
                            "Já existe outro fornecedor com este CNPJ."
                    });

            }

        }


        // =================================================
        // VALIDAR MARCAS
        // =================================================

        if (marcasIds.length > 0) {

            const placeholders =
                marcasIds
                    .map(() => "?")
                    .join(", ");


            const [marcasExistentes] =
                await conexao.query(`
                    SELECT
                        id

                    FROM marcas

                    WHERE
                        id IN (${placeholders})
                `, marcasIds);


            if (
                marcasExistentes.length !==
                marcasIds.length
            ) {

                await conexao.rollback();


                return res
                    .status(400)
                    .json({
                        erro:
                            "Uma ou mais marcas informadas não existem."
                    });

            }

        }


        // =================================================
        // ATUALIZAR FORNECEDOR
        // =================================================

        await conexao.query(`
            UPDATE fornecedores

            SET
                nome = ?,
                cnpj = ?,

                contato_nome = ?,
                email = ?,
                telefone = ?,

                cep = ?,
                endereco = ?,
                numero = ?,
                complemento = ?,
                bairro = ?,
                cidade = ?,
                estado = ?,

                ativo = ?

            WHERE
                id = ?
        `, [

            nome.trim(),

            cnpj?.trim() ||
            null,

            contato_nome?.trim() ||
            null,

            email?.trim()
                ?.toLowerCase() ||
            null,

            telefone?.trim() ||
            null,

            cep?.trim() ||
            null,

            endereco?.trim() ||
            null,

            numero?.trim() ||
            null,

            complemento?.trim() ||
            null,

            bairro?.trim() ||
            null,

            cidade?.trim() ||
            null,

            estado?.trim()
                ?.toUpperCase() ||
            null,

            ativo
                ? 1
                : 0,

            id

        ]);


        // =================================================
        // APAGAR VÍNCULOS ANTIGOS
        // =================================================

        await conexao.query(`
            DELETE FROM fornecedores_marcas

            WHERE
                fornecedor_id = ?
        `, [
            id
        ]);


        // =================================================
        // SALVAR NOVAS MARCAS
        // =================================================

        for (const marcaId of marcasIds) {

            await conexao.query(`
                INSERT INTO fornecedores_marcas (
                    fornecedor_id,
                    marca_id
                )

                VALUES (?, ?)
            `, [
                id,
                marcaId
            ]);

        }


        await conexao.commit();


        return res
            .status(200)
            .json({
                mensagem:
                    "Fornecedor atualizado com sucesso."
            });


    } catch (error) {

        if (conexao) {

            await conexao.rollback();

        }


        console.error(
            "Erro ao atualizar fornecedor:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao atualizar fornecedor.",
                detalhe:
                    error.message
            });


    } finally {

        if (conexao) {

            conexao.release();

        }

    }

});


// =====================================================
// ALTERAR STATUS
//
// PATCH /fornecedores/:id/status
// =====================================================

router.patch(
    "/:id/status",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                ativo
            } = req.body;


            if (
                typeof ativo !==
                "boolean"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe um status válido."
                    });

            }


            const [resultado] =
                await db.query(`
                    UPDATE fornecedores

                    SET
                        ativo = ?

                    WHERE
                        id = ?
                `, [
                    ativo
                        ? 1
                        : 0,

                    id
                ]);


            if (
                resultado.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Fornecedor não encontrado."
                    });

            }


            return res
                .status(200)
                .json({
                    mensagem:
                        ativo
                            ? "Fornecedor ativado com sucesso."
                            : "Fornecedor desativado com sucesso."
                });


        } catch (error) {

            console.error(
                "Erro ao alterar status do fornecedor:",
                error
            );


            return res
                .status(500)
                .json({
                    erro:
                        "Erro ao alterar status do fornecedor.",
                    detalhe:
                        error.message
                });

        }

    }
);


// =====================================================
// EXCLUIR FORNECEDOR
//
// DELETE /fornecedores/:id
// =====================================================

router.delete("/:id", async (req, res) => {

    let conexao;


    try {

        const {
            id
        } = req.params;


        conexao =
            await db.getConnection();


        await conexao.beginTransaction();


        // =================================================
        // VERIFICAR
        // =================================================

        const [fornecedor] =
            await conexao.query(`
                SELECT
                    id

                FROM fornecedores

                WHERE
                    id = ?

                LIMIT 1
            `, [
                id
            ]);


        if (fornecedor.length === 0) {

            await conexao.rollback();


            return res
                .status(404)
                .json({
                    erro:
                        "Fornecedor não encontrado."
                });

        }


        // =================================================
        // APAGAR RELAÇÕES
        // =================================================

        await conexao.query(`
            DELETE FROM fornecedores_marcas

            WHERE
                fornecedor_id = ?
        `, [
            id
        ]);


        // =================================================
        // APAGAR FORNECEDOR
        // =================================================

        await conexao.query(`
            DELETE FROM fornecedores

            WHERE
                id = ?
        `, [
            id
        ]);


        await conexao.commit();


        return res
            .status(200)
            .json({
                mensagem:
                    "Fornecedor excluído com sucesso."
            });


    } catch (error) {

        if (conexao) {

            await conexao.rollback();

        }


        console.error(
            "Erro ao excluir fornecedor:",
            error
        );


        return res
            .status(500)
            .json({
                erro:
                    "Erro ao excluir fornecedor.",
                detalhe:
                    error.message
            });


    } finally {

        if (conexao) {

            conexao.release();

        }

    }

});


export default router;