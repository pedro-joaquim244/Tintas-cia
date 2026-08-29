CREATE DATABASE IF NOT EXISTS tintas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tintas;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    telefone VARCHAR(30) NULL,
    data_nascimento DATE NULL,
    endereco VARCHAR(255) NULL,
    numero VARCHAR(20) NULL,
    complemento VARCHAR(150) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NULL,
    estado VARCHAR(2) NULL,
    cep VARCHAR(10) NULL,
    foto VARCHAR(255) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_email (email)
);

-- Corrige registros antigos antes de restringir a coluna.
UPDATE usuarios
SET tipo = 'cliente'
WHERE tipo IS NULL
   OR TRIM(tipo) = ''
   OR tipo NOT IN ('admin', 'cliente');

-- Garante que todo novo usuario seja cliente por padrao.
-- Administradores devem ser promovidos apenas por uma operacao administrativa no banco.
ALTER TABLE usuarios
    MODIFY COLUMN tipo ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente';

CREATE TABLE IF NOT EXISTS feedbacks (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    nota TINYINT UNSIGNED NOT NULL,
    comentario VARCHAR(500) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_feedbacks_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS itens (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT NULL,
    categoria VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    foto VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

ALTER TABLE itens
    ADD COLUMN IF NOT EXISTS categoria VARCHAR(100) NOT NULL DEFAULT 'Geral',
    ADD COLUMN IF NOT EXISTS foto VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Ativo';

UPDATE itens
SET status = CASE
    WHEN quantidade > 0 THEN 'Ativo'
    ELSE 'Inativo'
END;

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS estoque_baixado TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS cupons_usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    cupom_id INT NOT NULL,
    salvo_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cupom_usuario (usuario_id, cupom_id),
    CONSTRAINT fk_cupons_usuarios_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cupons_usuarios_cupom
        FOREIGN KEY (cupom_id) REFERENCES cupons(id)
        ON DELETE CASCADE
);
