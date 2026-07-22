import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../database.js";
import { config } from "../config.js";
import { autenticarToken, autorizarTipos } from "../middlewares/autenticacao.js";

const router = express.Router();

const camposPublicos = "id, nome, email, tipo, criado_em, atualizado_em";

router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: "Email e senha sao obrigatorios." });
        }

        const [resultado] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email.trim().toLowerCase()]
        );
        const usuario = resultado[0];

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ erro: "Email ou senha invalidos." });
        }

        if (!["admin", "cliente"].includes(usuario.tipo)) {
            return res.status(403).json({ erro: "Tipo de usuario invalido." });
        }

        const dadosUsuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
        };
        const token = jwt.sign(dadosUsuario, config.jwtSecret, { expiresIn: "1d" });

        return res.json({
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: dadosUsuario,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao fazer login." });
    }
});

router.post("/", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Nome, email e senha sao obrigatorios." });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const [existentes] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [emailNormalizado]
        );

        if (existentes.length > 0) {
            return res.status(409).json({ erro: "Este email ja esta cadastrado." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'cliente')",
            [nome.trim(), emailNormalizado, senhaCriptografada]
        );
        const [criados] = await pool.query(
            `SELECT ${camposPublicos} FROM usuarios WHERE id = ?`,
            [resultado.insertId]
        );

        return res.status(201).json(criados[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao cadastrar usuario." });
    }
});

router.get("/me", autenticarToken, async (req, res) => {
    try {
        const [resultado] = await pool.query(
            `SELECT ${camposPublicos} FROM usuarios WHERE id = ?`,
            [req.usuario.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ erro: "Usuario nao encontrado." });
        }

        return res.json(resultado[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao buscar usuario." });
    }
});

router.get("/", autenticarToken, autorizarTipos("admin"), async (_req, res) => {
    try {
        const [usuarios] = await pool.query(
            `SELECT ${camposPublicos} FROM usuarios ORDER BY id DESC`
        );
        return res.json(usuarios);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao listar usuarios." });
    }
});

router.get("/:id", autenticarToken, autorizarTipos("admin"), async (req, res) => {
    try {
        const [resultado] = await pool.query(
            `SELECT ${camposPublicos} FROM usuarios WHERE id = ?`,
            [req.params.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ erro: "Usuario nao encontrado." });
        }

        return res.json(resultado[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao buscar usuario." });
    }
});

router.put("/:id", autenticarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (req.usuario.tipo !== "admin" && id !== Number(req.usuario.id)) {
            return res.status(403).json({ erro: "Voce so pode atualizar o proprio perfil." });
        }

        const { nome, email, senha } = req.body;
        if (!nome || !email) {
            return res.status(400).json({ erro: "Nome e email sao obrigatorios." });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const [usuarioExistente] = await pool.query("SELECT id FROM usuarios WHERE id = ?", [id]);
        if (usuarioExistente.length === 0) {
            return res.status(404).json({ erro: "Usuario nao encontrado." });
        }

        const [emailExistente] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ? AND id != ?",
            [emailNormalizado, id]
        );
        if (emailExistente.length > 0) {
            return res.status(409).json({ erro: "Este email ja esta sendo usado." });
        }

        if (senha) {
            const senhaCriptografada = await bcrypt.hash(senha, 10);
            await pool.query(
                "UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?",
                [nome.trim(), emailNormalizado, senhaCriptografada, id]
            );
        } else {
            await pool.query(
                "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
                [nome.trim(), emailNormalizado, id]
            );
        }

        const [atualizados] = await pool.query(
            `SELECT ${camposPublicos} FROM usuarios WHERE id = ?`,
            [id]
        );
        return res.json(atualizados[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao atualizar usuario." });
    }
});

router.delete("/:id", autenticarToken, autorizarTipos("admin"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (id === Number(req.usuario.id)) {
            return res.status(400).json({ erro: "O administrador nao pode excluir a propria conta." });
        }

        const [resultado] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Usuario nao encontrado." });
        }

        return res.json({ mensagem: "Usuario excluido com sucesso." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao excluir usuario." });
    }
});

export default router;
