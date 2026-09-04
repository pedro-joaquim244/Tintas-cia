import jwt from "jsonwebtoken";

import db from "./src/database.js";

const [usuarios] = await db.query(`
    SELECT id
    FROM usuarios
    WHERE tipo = 'cliente'
      AND email IS NOT NULL
      AND TRIM(email) != ''
    ORDER BY id ASC
    LIMIT 1
`);

if (!usuarios.length) {
    console.log("SEM_CLIENTE");
    await db.end();
    process.exit(2);
}

const token = jwt.sign(
    { id: 999999, tipo: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "2m" }
);

const resposta = await fetch(
    "http://localhost:3333/api/admin/emails/enviar",
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            assunto: "Teste do painel de e-mails - Pixel Color",
            mensagem:
                "Esta é uma mensagem de teste para confirmar o funcionamento do painel administrativo de e-mails.",
            todos: false,
            destinatarios: [usuarios[0].id]
        })
    }
);

console.log(`STATUS=${resposta.status}`);
console.log(await resposta.text());
await db.end();

if (!resposta.ok) {
    process.exit(1);
}
