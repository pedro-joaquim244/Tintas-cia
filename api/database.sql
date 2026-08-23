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
    preco DECIMAL(10, 2) NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
