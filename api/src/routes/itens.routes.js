import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sql = `
            SELECT 
                id,
                nome,
                descricao,
                preco,
                quantidade,
                criado_em,
                atualizado_em
            FROM itens
            ORDER BY id DESC
        `;

    const itens = await db.all(sql);

    return res.json(itens);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao listar itens.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
            SELECT 
                id,
                nome,
                descricao,
                preco,
                quantidade,
                criado_em,
                atualizado_em
            FROM itens
            WHERE id = ?
        `;

    const item = await db.get(sql, [id]);

    if (!item) {
      return res.status(404).json({
        erro: "Item não encontrado.",
      });
    }

    return res.json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao buscar item.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, descricao, preco, quantidade } = req.body;

    if (!nome || preco === undefined) {
      return res.status(400).json({
        erro: "Nome e preço são obrigatórios.",
      });
    }

    const sql = `
            INSERT INTO itens 
                (nome, descricao, preco, quantidade)
            VALUES 
                (?, ?, ?, ?)
        `;

    const resultado = await db.run(sql, [
      nome,
      descricao || null,
      preco,
      quantidade || 0,
    ]);

    const itemCriado = await db.get(
      `
                SELECT 
                    id,
                    nome,
                    descricao,
                    preco,
                    quantidade,
                    criado_em,
                    atualizado_em
                FROM itens
                WHERE id = ?
            `,
      [resultado.lastID],
    );

    return res.status(201).json(itemCriado);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao criar item.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, quantidade } = req.body;

    if (!nome || preco === undefined || quantidade === undefined) {
      return res.status(400).json({
        erro: "Nome, preço e quantidade são obrigatórios.",
      });
    }

    const sql = `
            UPDATE itens
            SET 
                nome = ?,
                descricao = ?,
                preco = ?,
                quantidade = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

    const resultado = await db.run(sql, [
      nome,
      descricao || null,
      preco,
      quantidade,
      id,
    ]);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Item não encontrado.",
      });
    }

    const itemAtualizado = await db.get(
      `
                SELECT 
                    id,
                    nome,
                    descricao,
                    preco,
                    quantidade,
                    criado_em,
                    atualizado_em
                FROM itens
                WHERE id = ?
            `,
      [id],
    );

    return res.json(itemAtualizado);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao atualizar item.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
            DELETE FROM itens
            WHERE id = ?
        `;

    const resultado = await db.run(sql, [id]);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Item não encontrado.",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao deletar item.",
    });
  }
});

export default router;
