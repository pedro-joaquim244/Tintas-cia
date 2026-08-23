import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import pool from "../database.js";
import { config } from "../config.js";

import {
    autenticarToken,
    autorizarTipos
} from "../middlewares/autenticacao.js";

const router = express.Router();

// =====================================================
// CAMINHOS
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastaUploads = path.join(
    __dirname,
    "..",
    "uploads"
);

const pastaUsuarios = path.join(
    pastaUploads,
    "usuarios"
);

// Criar pastas caso não existam
if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, {
        recursive: true
    });
}

if (!fs.existsSync(pastaUsuarios)) {
    fs.mkdirSync(pastaUsuarios, {
        recursive: true
    });
}

console.log(
    "Pasta de fotos dos usuários:",
    pastaUsuarios
);

// =====================================================
// MULTER
// =====================================================

const storage = multer.diskStorage({

    destination: (_req, _file, cb) => {
        cb(null, pastaUsuarios);
    },

    filename: (_req, file, cb) => {

        const extensao = path
            .extname(file.originalname)
            .toLowerCase();

        const nomeArquivo =
            `usuario-${Date.now()}-${Math.round(
                Math.random() * 1E9
            )}${extensao}`;

        cb(null, nomeArquivo);
    }

});

// =====================================================
// FILTRO DE IMAGEM
// =====================================================

const fileFilter = (_req, file, cb) => {

    const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
        return;
    }

    cb(
        new Error(
            "Formato de imagem inválido. Use JPG, JPEG, PNG ou WEBP."
        ),
        false
    );
};

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024
    }

});

// =====================================================
// CAMPOS PÚBLICOS
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
    foto,
    criado_em,
    atualizado_em
`;

// =====================================================
// FUNÇÃO AUXILIAR
// =====================================================

function montarUsuario(usuario) {

    if (!usuario) {
        return null;
    }

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,

        telefone: usuario.telefone || "",

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

        foto:
            usuario.foto || null,

        criado_em:
            usuario.criado_em || null,

        atualizado_em:
            usuario.atualizado_em || null
    };
}

// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                senha
            } = req.body;

            if (!email || !senha) {

                return res.status(400).json({
                    erro: "Email e senha são obrigatórios."
                });
            }

            const emailNormalizado = String(email)
                .trim()
                .toLowerCase();

            const [resultado] = await pool.query(
                `
                SELECT *
                FROM usuarios
                WHERE email = ?
                LIMIT 1
                `,
                [emailNormalizado]
            );

            const usuario = resultado[0];

            if (!usuario) {

                return res.status(401).json({
                    erro: "Email ou senha inválidos."
                });
            }

            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );

            if (!senhaCorreta) {

                return res.status(401).json({
                    erro: "Email ou senha inválidos."
                });
            }

            if (
                !["admin", "cliente"].includes(
                    usuario.tipo
                )
            ) {

                return res.status(403).json({
                    erro: "Tipo de usuário inválido."
                });
            }

            const dadosUsuario =
                montarUsuario(usuario);

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
                "======================================"
            );

            console.error(
                "ERRO AO FAZER LOGIN:"
            );

            console.error(error);

            console.error(
                "======================================"
            );

            return res.status(500).json({

                erro:
                    "Erro ao fazer login.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// CADASTRAR USUÁRIO
// =====================================================

router.post(
    "/",
    upload.single("foto"),
    async (req, res) => {

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

            if (!nome || !email || !senha) {

                if (req.file) {

                    try {
                        fs.unlinkSync(
                            req.file.path
                        );
                    } catch {}
                }

                return res.status(400).json({
                    erro:
                        "Nome, email e senha são obrigatórios."
                });
            }

            const emailNormalizado =
                String(email)
                    .trim()
                    .toLowerCase();

            const [existentes] =
                await pool.query(
                    `
                    SELECT id
                    FROM usuarios
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [emailNormalizado]
                );

            if (existentes.length > 0) {

                if (req.file) {

                    try {
                        fs.unlinkSync(
                            req.file.path
                        );
                    } catch {}
                }

                return res.status(409).json({
                    erro:
                        "Este email já está cadastrado."
                });
            }

            const senhaCriptografada =
                await bcrypt.hash(
                    senha,
                    10
                );

            const foto =
                req.file
                    ? `usuarios/${req.file.filename}`
                    : null;

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
                        cep,
                        foto
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        'cliente',
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
                    `,
                    [
                        String(nome).trim(),
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
                        foto
                    ]
                );

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
                montarUsuario(criados[0])
            );

        } catch (error) {

            if (req.file) {

                try {
                    if (
                        fs.existsSync(
                            req.file.path
                        )
                    ) {
                        fs.unlinkSync(
                            req.file.path
                        );
                    }
                } catch {}
            }

            console.error(
                "======================================"
            );

            console.error(
                "ERRO AO CADASTRAR USUARIO:"
            );

            console.error(error);

            console.error(
                "======================================"
            );

            return res.status(500).json({

                erro:
                    "Erro ao cadastrar usuário.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// USUÁRIO LOGADO
// =====================================================

router.get(
    "/me",
    autenticarToken,
    async (req, res) => {

        try {

            if (!req.usuario?.id) {

                return res.status(401).json({
                    erro:
                        "Usuário não autenticado."
                });
            }

            const id =
                Number(req.usuario.id);

            if (!Number.isInteger(id)) {

                return res.status(401).json({
                    erro:
                        "Token inválido."
                });
            }

            const [resultado] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (resultado.length === 0) {

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });
            }

            return res.json(
                montarUsuario(resultado[0])
            );

        } catch (error) {

            console.error(
                "======================================"
            );

            console.error(
                "ERRO AO BUSCAR USUARIO LOGADO:"
            );

            console.error(error);

            console.error(
                "======================================"
            );

            return res.status(500).json({

                erro:
                    "Erro ao restaurar sessão.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// LISTAR TODOS OS USUÁRIOS
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
                usuarios.map(
                    (usuario) =>
                        montarUsuario(usuario)
                )
            );

        } catch (error) {

            console.error(
                "======================================"
            );

            console.error(
                "ERRO AO LISTAR USUARIOS:"
            );

            console.error(error);

            console.error(
                "======================================"
            );

            return res.status(500).json({

                erro:
                    "Erro ao listar usuários.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// BUSCAR USUÁRIO POR ID
// =====================================================

router.get(
    "/:id",
    autenticarToken,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            if (!Number.isInteger(id)) {

                return res.status(400).json({
                    erro:
                        "ID de usuário inválido."
                });
            }

            if (
                req.usuario.tipo !== "admin" &&
                Number(req.usuario.id) !== id
            ) {

                return res.status(403).json({
                    erro:
                        "Você só pode acessar seu próprio perfil."
                });
            }

            const [resultado] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (resultado.length === 0) {

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });
            }

            return res.json(
                montarUsuario(resultado[0])
            );

        } catch (error) {

            console.error(
                "ERRO AO BUSCAR USUARIO:",
                error
            );

            return res.status(500).json({

                erro:
                    "Erro ao buscar usuário.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// ALTERAR FOTO
// =====================================================

router.put(
    "/:id/foto",
    autenticarToken,
    upload.single("foto"),
    async (req, res) => {

        let arquivoNovo = null;

        try {

            const id =
                Number(req.params.id);

            if (!Number.isInteger(id)) {

                if (req.file) {

                    try {
                        fs.unlinkSync(
                            req.file.path
                        );
                    } catch {}
                }

                return res.status(400).json({
                    erro:
                        "ID de usuário inválido."
                });
            }

            if (
                req.usuario.tipo !== "admin" &&
                Number(req.usuario.id) !== id
            ) {

                if (req.file) {

                    try {
                        fs.unlinkSync(
                            req.file.path
                        );
                    } catch {}
                }

                return res.status(403).json({
                    erro:
                        "Você só pode alterar sua própria foto."
                });
            }

            if (!req.file) {

                return res.status(400).json({
                    erro:
                        "Nenhuma foto foi enviada."
                });
            }

            arquivoNovo =
                req.file.path;

            const [usuarios] =
                await pool.query(
                    `
                    SELECT
                        id,
                        foto
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (usuarios.length === 0) {

                if (
                    fs.existsSync(
                        req.file.path
                    )
                ) {
                    fs.unlinkSync(
                        req.file.path
                    );
                }

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });
            }

            const fotoAntiga =
                usuarios[0].foto;

            const novaFoto =
                `usuarios/${req.file.filename}`;

            await pool.query(
                `
                UPDATE usuarios
                SET foto = ?
                WHERE id = ?
                `,
                [
                    novaFoto,
                    id
                ]
            );

            const [atualizado] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            // Apagar foto antiga
            if (
                fotoAntiga &&
                fotoAntiga !== novaFoto
            ) {

                const caminhoAntigo =
                    path.join(
                        pastaUploads,
                        fotoAntiga
                    );

                if (
                    fs.existsSync(
                        caminhoAntigo
                    )
                ) {

                    try {
                        fs.unlinkSync(
                            caminhoAntigo
                        );
                    } catch (erro) {

                        console.warn(
                            "Não foi possível apagar foto antiga:",
                            erro.message
                        );
                    }
                }
            }

            arquivoNovo = null;

            return res.json({

                mensagem:
                    "Foto atualizada com sucesso.",

                usuario:
                    montarUsuario(
                        atualizado[0]
                    )

            });

        } catch (error) {

            console.error(
                "ERRO AO ALTERAR FOTO:",
                error
            );

            if (
                arquivoNovo &&
                fs.existsSync(arquivoNovo)
            ) {

                try {
                    fs.unlinkSync(
                        arquivoNovo
                    );
                } catch {}
            }

            return res.status(500).json({

                erro:
                    "Erro ao alterar foto.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// REMOVER FOTO
// =====================================================

router.delete(
    "/:id/foto",
    autenticarToken,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            if (!Number.isInteger(id)) {

                return res.status(400).json({
                    erro:
                        "ID de usuário inválido."
                });
            }

            if (
                req.usuario.tipo !== "admin" &&
                Number(req.usuario.id) !== id
            ) {

                return res.status(403).json({
                    erro:
                        "Você só pode remover sua própria foto."
                });
            }

            const [usuarios] =
                await pool.query(
                    `
                    SELECT foto
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (usuarios.length === 0) {

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });
            }

            const foto =
                usuarios[0].foto;

            await pool.query(
                `
                UPDATE usuarios
                SET foto = NULL
                WHERE id = ?
                `,
                [id]
            );

            if (foto) {

                const caminho =
                    path.join(
                        pastaUploads,
                        foto
                    );

                if (
                    fs.existsSync(
                        caminho
                    )
                ) {

                    try {
                        fs.unlinkSync(
                            caminho
                        );
                    } catch {}
                }
            }

            return res.json({
                mensagem:
                    "Foto removida com sucesso."
            });

        } catch (error) {

            console.error(
                "ERRO AO REMOVER FOTO:",
                error
            );

            return res.status(500).json({

                erro:
                    "Erro ao remover foto.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// ATUALIZAR PERFIL
// =====================================================

router.put(
    "/:id",
    autenticarToken,
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            if (!Number.isInteger(id)) {

                return res.status(400).json({
                    erro:
                        "ID de usuário inválido."
                });
            }

            if (
                req.usuario.tipo !== "admin" &&
                Number(req.usuario.id) !== id
            ) {

                return res.status(403).json({
                    erro:
                        "Você só pode atualizar o próprio perfil."
                });
            }

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

            if (!nome || !email) {

                return res.status(400).json({
                    erro:
                        "Nome e email são obrigatórios."
                });
            }

            const emailNormalizado =
                String(email)
                    .trim()
                    .toLowerCase();

            const [usuarioExistente] =
                await pool.query(
                    `
                    SELECT id
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (
                usuarioExistente.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });
            }

            const [emailExistente] =
                await pool.query(
                    `
                    SELECT id
                    FROM usuarios
                    WHERE email = ?
                    AND id != ?
                    LIMIT 1
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
                        "Este email já está sendo usado."
                });
            }

            if (senha && String(senha).trim()) {

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
                        String(nome).trim(),
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
                        String(nome).trim(),
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

            const [atualizados] =
                await pool.query(
                    `
                    SELECT ${camposPublicos}
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            return res.json(
                montarUsuario(
                    atualizados[0]
                )
            );

        } catch (error) {

            console.error(
                "ERRO AO ATUALIZAR USUARIO:",
                error
            );

            return res.status(500).json({

                erro:
                    "Erro ao atualizar usuário.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// EXCLUIR USUÁRIO
// =====================================================

router.delete(
    "/:id",
    autenticarToken,
    autorizarTipos("admin"),
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            if (!Number.isInteger(id)) {

                return res.status(400).json({
                    erro:
                        "ID de usuário inválido."
                });
            }

            if (
                id === Number(req.usuario.id)
            ) {

                return res.status(400).json({
                    erro:
                        "O administrador não pode excluir a própria conta."
                });
            }

            const [usuarios] =
                await pool.query(
                    `
                    SELECT foto
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (usuarios.length === 0) {

                return res.status(404).json({
                    erro:
                        "Usuário não encontrado."
                });
            }

            const foto =
                usuarios[0].foto;

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
                        "Usuário não encontrado."
                });
            }

            if (foto) {

                const caminho =
                    path.join(
                        pastaUploads,
                        foto
                    );

                if (
                    fs.existsSync(
                        caminho
                    )
                ) {

                    try {
                        fs.unlinkSync(
                            caminho
                        );
                    } catch {}
                }
            }

            return res.json({
                mensagem:
                    "Usuário excluído com sucesso."
            });

        } catch (error) {

            console.error(
                "ERRO AO EXCLUIR USUARIO:",
                error
            );

            return res.status(500).json({

                erro:
                    "Erro ao excluir usuário.",

                detalhes:
                    error.message

            });
        }
    }
);

// =====================================================
// ERROS DO MULTER
// =====================================================

router.use(
    (error, _req, res, _next) => {

        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code === "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({
                    erro:
                        "A imagem deve ter no máximo 2MB."
                });
            }

            return res.status(400).json({
                erro:
                    "Erro ao enviar imagem.",
                detalhes:
                    error.message
            });
        }

        if (error) {

            console.error(
                "ERRO NO UPLOAD:",
                error
            );

            return res.status(400).json({
                erro:
                    error.message ||
                    "Erro ao enviar imagem."
            });
        }

        return res.status(500).json({
            erro:
                "Erro interno do servidor."
        });
    }
);

export default router;