import express from "express";
import db from "../database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios.",
      });
    }

    const usuarioExistente = await db.get(
      `
        SELECT id
        FROM usuarios
        WHERE email = ?
      `,
      [email]
    );

    if (usuarioExistente) {
      return res.status(400).json({
        erro: "Este e-mail já está cadastrado.",
      });
    }

    const resultado = await db.run(
      `
        INSERT INTO usuarios (nome, email, senha)
        VALUES (?, ?, ?)
      `,
      [nome, email, senha]
    );

    const usuarioCriado = await db.get(
      `
        SELECT 
          id,
          nome,
          email
        FROM usuarios
        WHERE id = ?
      `,
      [resultado.lastID]
    );

    return res.status(201).json({
      usuario: usuarioCriado,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao cadastrar usuário.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios.",
      });
    }

    const usuario = await db.get(
      `
        SELECT 
          id,
          nome,
          email
        FROM usuarios
        WHERE email = ?
        AND senha = ?
      `,
      [email, senha]
    );

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos.",
      });
    }

    return res.json({
      usuario,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao fazer login.",
    });
  }
});

export default router;