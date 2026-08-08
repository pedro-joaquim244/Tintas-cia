
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../database.js";
import { config } from "../config.js";
import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";

const router = express.Router();

// =====================================================
// CAMPOS PÚBLICOS DO USUÁRIO
// =====================================================

const camposPublicos = `
    id,
    nome,
    email,
    tipo,
    telefone,
    data_nascimento,
    endereco,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
    criado_em,
    atualizado_em
`;

// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;

        if (!email || !senha) {

            return res.status(400).json({
                erro: "Email e senha sao obrigatorios."
            });

        }

        const emailNormalizado =
            email.trim().toLowerCase();

        const [resultado] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [emailNormalizado]
        );

        const usuario = resultado[0];

        if (
            !usuario ||
            !(await bcrypt.compare(
                senha,
                usuario.senha
            ))
        ) {

            return res.status(401).json({
                erro: "Email ou senha invalidos."
            });

        }

        if (
            !["admin", "cliente"]
                .includes(usuario.tipo)
        ) {

            return res.status(403).json({
                erro: "Tipo de usuario invalido."
            });

        }

        // =============================================
        // DADOS DO USUÁRIO
        // =============================================

        const dadosUsuario = {

            id: usuario.id,

            nome: usuario.nome,

            email: usuario.email,

            tipo: usuario.tipo,

            telefone:
                usuario.telefone || "",

            data_nascimento:
                usuario.data_nascimento || null,

            endereco:
                usuario.endereco || "",

            numero:
                usuario.numero || "",

            complemento:
                usuario.complemento || "",

            bairro:
                usuario.bairro || "",

            cidade:
                usuario.cidade || "",

            estado:
                usuario.estado || "",

            cep:
                usuario.cep || "",

            criado_em:
                usuario.criado_em,

            atualizado_em:
                usuario.atualizado_em

        };

        // =============================================
        // TOKEN
        // =============================================

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            },
            config.jwtSecret,
            {
                expiresIn: "1d"
            }
        );

        return res.json({

            mensagem:
                "Login realizado com sucesso.",

            token,

            usuario:
                dadosUsuario

        });

    } catch (error) {

        console.error(
            "ERRO AO FAZER LOGIN:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao fazer login."
        });

    }

});

// =====================================================
// CADASTRAR USUÁRIO
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            nome,
            email,
            senha,

            telefone,
            data_nascimento,

            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            cep

        } = req.body;

        // =============================================
        // VALIDAÇÃO
        // =============================================

        if (
            !nome ||
            !email ||
            !senha
        ) {

            return res.status(400).json({
                erro:
                    "Nome, email e senha sao obrigatorios."
            });

        }

        // =============================================
        // NORMALIZAR EMAIL
        // =============================================

        const emailNormalizado =
            email.trim().toLowerCase();

        // =============================================
        // VERIFICAR EMAIL
        // =============================================

        const [existentes] =
            await pool.query(
                "SELECT id FROM usuarios WHERE email = ?",
                [emailNormalizado]
            );

        if (existentes.length > 0) {

            return res.status(409).json({
                erro:
                    "Este email ja esta cadastrado."
            });

        }

        // =============================================
        // CRIPTOGRAFAR SENHA
        // =============================================

        const senhaCriptografada =
            await bcrypt.hash(
                senha,
                10
            );

        // =============================================
        // INSERIR USUÁRIO
        // =============================================

        const [resultado] =
            await pool.query(
                `
                INSERT INTO usuarios (
                    nome,
                    email,
                    senha,
                    tipo,
                    telefone,
                    data_nascimento,
                    endereco,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,
                    cep
                )
                VALUES (?, ?, ?, 'cliente', ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [

                    nome.trim(),

                    emailNormalizado,

                    senhaCriptografada,

                    telefone || null,

                    data_nascimento || null,

                    endereco || null,

                    numero || null,

                    complemento || null,

                    bairro || null,

                    cidade || null,

                    estado || null,

                    cep || null

                ]
            );

        // =============================================
        // BUSCAR USUÁRIO CRIADO
        // =============================================

        const [criados] =
            await pool.query(
                `
                SELECT ${camposPublicos}
                FROM usuarios
                WHERE id = ?
                `,
                [resultado.insertId]
            );

        return res.status(201).json(
            criados[0]
        );

    } catch (error) {

        console.error(
            "ERRO AO CADASTRAR USUARIO:",
            error
        );

        return res.status(500).json({
            erro:
                "Erro ao cadastrar usuario.",
            detalhes:
                error.message
        });

    }

});

// =====================================================
// BUSCAR USUÁRIO LOGADO
// =====================================================

router.get(
    "/me",
    autenticarToken,
    async (req, res) => {

        try {

            const [resultado] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    WHERE id = ?
                    `,
                    [req.usuario.id]
                );

            if (
                resultado.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Usuario nao encontrado."
                });

            }

            return res.json(
                resultado[0]
            );

        } catch (error) {

            console.error(
                "ERRO AO BUSCAR USUARIO:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao buscar usuario."
            });

        }

    }
);

// =====================================================
// LISTAR TODOS OS USUÁRIOS
// SOMENTE ADMIN
// =====================================================

router.get(
    "/",
    autenticarToken,
    autorizarTipos("admin"),
    async (_req, res) => {

        try {

            const [usuarios] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    ORDER BY id DESC
                    `
                );

            return res.json(
                usuarios
            );

        } catch (error) {

            console.error(
                "ERRO AO LISTAR USUARIOS:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao listar usuarios."
            });

        }

    }
);

// =====================================================
// BUSCAR USUÁRIO POR ID
// SOMENTE ADMIN
// =====================================================

router.get(
    "/:id",
    autenticarToken,
    autorizarTipos("admin"),
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            if (isNaN(id)) {

                return res.status(400).json({
                    erro:
                        "ID de usuario invalido."
                });

            }

            const [resultado] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    WHERE id = ?
                    `,
                    [id]
                );

            if (
                resultado.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Usuario nao encontrado."
                });

            }

            return res.json(
                resultado[0]
            );

        } catch (error) {

            console.error(
                "ERRO AO BUSCAR USUARIO:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao buscar usuario."
            });

        }

    }
);

// =====================================================
// ATUALIZAR PERFIL
// ADMIN OU PRÓPRIO USUÁRIO
// =====================================================

router.put(
    "/:id",
    autenticarToken,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            if (isNaN(id)) {

                return res.status(400).json({
                    erro:
                        "ID de usuario invalido."
                });

            }

            // =========================================
            // PERMISSÃO
            // =========================================

            if (
                req.usuario.tipo !== "admin" &&
                id !== Number(req.usuario.id)
            ) {

                return res.status(403).json({
                    erro:
                        "Voce so pode atualizar o proprio perfil."
                });

            }

            // =========================================
            // DADOS
            // =========================================

            const {
                nome,
                email,
                senha,

                telefone,
                data_nascimento,

                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                cep

            } = req.body;

            // =========================================
            // CAMPOS OBRIGATÓRIOS
            // =========================================

            if (
                !nome ||
                !email
            ) {

                return res.status(400).json({
                    erro:
                        "Nome e email sao obrigatorios."
                });

            }

            // =========================================
            // NORMALIZAR
            // =========================================

            const emailNormalizado =
                email.trim().toLowerCase();

            // =========================================
            // VERIFICAR USUÁRIO
            // =========================================

            const [usuarioExistente] =
                await pool.query(
                    `
                    SELECT id
                    FROM usuarios
                    WHERE id = ?
                    `,
                    [id]
                );

            if (
                usuarioExistente.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Usuario nao encontrado."
                });

            }

            // =========================================
            // VERIFICAR EMAIL
            // =========================================

            const [emailExistente] =
                await pool.query(
                    `
                    SELECT id
                    FROM usuarios
                    WHERE email = ?
                    AND id != ?
                    `,
                    [
                        emailNormalizado,
                        id
                    ]
                );

            if (
                emailExistente.length > 0
            ) {

                return res.status(409).json({
                    erro:
                        "Este email ja esta sendo usado."
                });

            }

            // =========================================
            // ATUALIZAR COM SENHA
            // =========================================

            if (senha) {

                const senhaCriptografada =
                    await bcrypt.hash(
                        senha,
                        10
                    );

                await pool.query(
                    `
                    UPDATE usuarios
                    SET
                        nome = ?,
                        email = ?,
                        senha = ?,
                        telefone = ?,
                        data_nascimento = ?,
                        endereco = ?,
                        numero = ?,
                        complemento = ?,
                        bairro = ?,
                        cidade = ?,
                        estado = ?,
                        cep = ?
                    WHERE id = ?
                    `,
                    [

                        nome.trim(),

                        emailNormalizado,

                        senhaCriptografada,

                        telefone || null,

                        data_nascimento || null,

                        endereco || null,

                        numero || null,

                        complemento || null,

                        bairro || null,

                        cidade || null,

                        estado || null,

                        cep || null,

                        id

                    ]
                );

            } else {

                // =====================================
                // ATUALIZAR SEM ALTERAR SENHA
                // =====================================

                await pool.query(
                    `
                    UPDATE usuarios
                    SET
                        nome = ?,
                        email = ?,
                        telefone = ?,
                        data_nascimento = ?,
                        endereco = ?,
                        numero = ?,
                        complemento = ?,
                        bairro = ?,
                        cidade = ?,
                        estado = ?,
                        cep = ?
                    WHERE id = ?
                    `,
                    [

                        nome.trim(),

                        emailNormalizado,

                        telefone || null,

                        data_nascimento || null,

                        endereco || null,

                        numero || null,

                        complemento || null,

                        bairro || null,

                        cidade || null,

                        estado || null,

                        cep || null,

                        id

                    ]
                );

            }

            // =========================================
            // RETORNAR USUÁRIO ATUALIZADO
            // =========================================

            const [atualizados] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    WHERE id = ?
                    `,
                    [id]
                );

            return res.json(
                atualizados[0]
            );

        } catch (error) {

            console.error(
                "ERRO AO ATUALIZAR USUARIO:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao atualizar usuario.",
                detalhes:
                    error.message
            });

        }

    }
);

// =====================================================
// EXCLUIR USUÁRIO
// SOMENTE ADMIN
// =====================================================

router.delete(
    "/:id",
    autenticarToken,
    autorizarTipos("admin"),
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            if (isNaN(id)) {

                return res.status(400).json({
                    erro:
                        "ID de usuario invalido."
                });

            }

            // =========================================
            // NÃO DEIXAR ADMIN EXCLUIR A SI MESMO
            // =========================================

            if (
                id === Number(req.usuario.id)
            ) {

                return res.status(400).json({
                    erro:
                        "O administrador nao pode excluir a propria conta."
                });

            }

            // =========================================
            // EXCLUIR
            // =========================================

            const [resultado] =
                await pool.query(
                    `
                    DELETE FROM usuarios
                    WHERE id = ?
                    `,
                    [id]
                );

            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Usuario nao encontrado."
                });

            }

            return res.json({
                mensagem:
                    "Usuario excluido com sucesso."
            });

        } catch (error) {

            console.error(
                "ERRO AO EXCLUIR USUARIO:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao excluir usuario."
            });

        }

    }
);

export default router;
