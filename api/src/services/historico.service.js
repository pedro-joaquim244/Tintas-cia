import db from "../database.js";

export async function garantirTabelaHistorico() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS historico_sistema (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            usuario_id INT UNSIGNED NULL,
            tipo VARCHAR(30) NOT NULL DEFAULT 'sistema',
            acao VARCHAR(50) NOT NULL,
            titulo VARCHAR(180) NOT NULL,
            descricao TEXT NULL,
            referencia_id INT UNSIGNED NULL,
            valor_anterior TEXT NULL,
            valor_novo TEXT NULL,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_historico_tipo_data (tipo, criado_em),
            KEY idx_historico_usuario (usuario_id),
            CONSTRAINT fk_historico_usuario
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
                ON DELETE SET NULL ON UPDATE CASCADE
        )
    `);
}

function serializar(valor) {
    if (valor === undefined || valor === null) return null;
    return typeof valor === "string" ? valor : JSON.stringify(valor);
}

export async function registrarAtividade(connection, atividade) {
    const executor = connection || db;

    await executor.query(
        `
        INSERT INTO historico_sistema
            (usuario_id, tipo, acao, titulo, descricao,
             referencia_id, valor_anterior, valor_novo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            atividade.usuario_id || null,
            atividade.tipo || "sistema",
            atividade.acao,
            atividade.titulo,
            atividade.descricao || null,
            atividade.referencia_id || null,
            serializar(atividade.valor_anterior),
            serializar(atividade.valor_novo)
        ]
    );
}
