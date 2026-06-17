import express from "express";
import bcrypt from "bcrypt";
import pool from "../database.js";
import jwt from 'jsonwebtoken';
import { autenticarToken } from "../middlewares/autenticacao.js"; 


const router = express.Router();


// LISTAR TODOS OS USUÁRIOS
router.get("/", autenticarToken, async (req, res) => {
    try {
        const sql = `
      SELECT id, nome, email, criado_em, atualizado_em
      FROM usuarios
      ORDER BY id DESC
    `;


        const [usuarios] = await pool.query(sql);


        return res.json(usuarios);


    } catch (error) {
        console.error(error);


        return res.status(500).json({
            erro: "Erro ao listar usuários."
        });
    }
});


// BUSCAR USUÁRIO POR ID
router.get("/:id",autenticarToken, async (req, res) => {
    try {
        const { id } = req.params;


        const sql = `
      SELECT id, nome, email, criado_em, atualizado_em
      FROM usuarios
      WHERE id = ?
    `;


        const [resultado] = await pool.query(sql, [id]);


        if (resultado.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }


        return res.json(resultado[0]);


    } catch (error) {
        console.error(error);


        return res.status(500).json({
            erro: "Erro ao buscar usuário."
        });
    }
});


// CADASTRAR USUÁRIO
router.post("/", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;


        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: "Nome, email e senha são obrigatórios."
            });
        }


        const [usuarioExistente] = await pool.query(
            `
      SELECT id
      FROM usuarios
      WHERE email = ?
      `,
            [email]
        );


        if (usuarioExistente.length > 0) {
            return res.status(400).json({
                erro: "Este email já está cadastrado."
            });
        }


        const senhaCriptografada = await bcrypt.hash(senha, 10);


        const sql = `
      INSERT INTO usuarios
      (nome, email, senha)
      VALUES (?, ?, ?)
    `;


        const [resultado] = await pool.query(sql, [
            nome,
            email,
            senhaCriptografada
        ]);


        const [usuarioCriado] = await pool.query(
            `
      SELECT id, nome, email, criado_em, atualizado_em
      FROM usuarios
      WHERE id = ?
      `,
            [resultado.insertId]
        );


        return res.status(201).json(usuarioCriado[0]);


    } catch (error) {
        console.error(error);


        return res.status(500).json({
            erro: "Erro ao cadastrar usuário."
        });
    }
});


// ATUALIZAR USUÁRIO
router.put("/:id",autenticarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body;


        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email são obrigatórios."
            });
        }


        const [usuarioExistente] = await pool.query(
            `
      SELECT *
      FROM usuarios
      WHERE id = ?
      `,
            [id]
        );


        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }


        const [emailExistente] = await pool.query(
            `
      SELECT id
      FROM usuarios
      WHERE email = ? AND id != ?
      `,
            [email, id]
        );


        if (emailExistente.length > 0) {
            return res.status(400).json({
                erro: "Este email já está sendo usado por outro usuário."
            });
        }


        if (senha) {
            const senhaCriptografada = await bcrypt.hash(senha, 10);


            await pool.query(
                `
        UPDATE usuarios
        SET nome = ?,
            email = ?,
            senha = ?
        WHERE id = ?
        `,
                [nome, email, senhaCriptografada, id]
            );


        } else {
            await pool.query(
                `
        UPDATE usuarios
        SET nome = ?,
            email = ?
        WHERE id = ?
        `,
                [nome, email, id]
            );
        }


        const [usuarioAtualizado] = await pool.query(
            `
      SELECT id, nome, email, criado_em, atualizado_em
      FROM usuarios
      WHERE id = ?
      `,
            [id]
        );


        return res.json(usuarioAtualizado[0]);


    } catch (error) {
        console.error(error);


        return res.status(500).json({
            erro: "Erro ao atualizar usuário."
        });
    }
});


// DELETAR USUÁRIO
router.delete("/:id",autenticarToken, async (req, res) => {
    try {
        const { id } = req.params;


        const [usuarioExistente] = await pool.query(
            `
      SELECT id
      FROM usuarios
      WHERE id = ?
      `,
            [id]
        );


        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }


        await pool.query(
            `
      DELETE FROM usuarios
      WHERE id = ?
      `,
            [id]
        );


        return res.json({
            mensagem: "Usuário deletado com sucesso."
        });


    } catch (error) {
        console.error(error);


        return res.status(500).json({
            erro: "Erro ao deletar usuário."
        });
    }
});

//LOGIN

router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Email e senha são obrigatórios."
            });
        }

        const [resultado] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        const usuario = resultado[0];

        if (!usuario) {
            return res.status(401).json({
                erro: "Email ou senha inválidos."
            });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({
                erro: "Email ou senha inválidos."
            });
        }

        const { id, nome } = usuario;

        const token = jwt.sign(
            { id, nome, email },
            "pedro",
            { expiresIn: "1d" }
        );

        return res.json({
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: {
                id,
                nome,
                email
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao fazer login."
        });
    }
});


export default router;