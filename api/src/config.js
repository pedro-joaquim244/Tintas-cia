function obrigatoria(nome) {
    const valor = process.env[nome];

    if (!valor) {
        throw new Error(`Variavel de ambiente obrigatoria ausente: ${nome}`);
    }

    return valor;
}

export const config = {
    port: Number(process.env.PORT || 3333),
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    jwtSecret: obrigatoria("JWT_SECRET"),
    database: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "tintas",
        port: Number(process.env.DB_PORT || 3306),
    },
};
