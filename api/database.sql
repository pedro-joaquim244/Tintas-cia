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
