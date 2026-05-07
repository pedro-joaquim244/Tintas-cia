import sqlite3 from "sqlite3";
import { open } from "sqlite";

const db = await open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

await db.exec(`
    CREATE TABLE IF NOT EXISTS itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco REAL NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

export default db;
