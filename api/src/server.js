import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import pedidosRoutes from "./routes/pedidos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import itensRoutes from "./routes/itens.routes.js";
import itens_pedidosRoutes from "./routes/itens_pedidos.routes.js";
import carrinhoRoutes from "./routes/carrinho.routes.js";
import cuponsRoutes from "./routes/cupons.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import feedbacksRoutes from "./routes/feedbacks.routes.js";
import fidelidadeRoutes from "./routes/fidelidade.routes.js";
import cartoesRoutes from "./routes/cartoes.routes.js";
import notificacoesRoutes from "./routes/notificacoes.routes.js";
import orcamentoRoutes from "./routes/orcamento.routes.js";
import historicoRoutes from "./routes/hsitorico.routes.js";
import { garantirTabelaHistorico } from "./services/historico.service.js";

import { config } from "./config.js";

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CAMINHO ABSOLUTO DO PROJETO
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin: config.corsOrigin
    })
);

// =====================================================
// JSON
// =====================================================

app.use(express.json());

// =====================================================
// URLENCODED
// =====================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

// =====================================================
// UPLOADS
// =====================================================

const pastaUploads = path.join(
    __dirname,
    "uploads"
);

// Criar pasta caso não exista
if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, {
        recursive: true
    });
}

console.log("======================================");
console.log("CAMINHO DOS UPLOADS:");
console.log(pastaUploads);

console.log(
    "A pasta uploads existe?",
    fs.existsSync(pastaUploads)
);

console.log("======================================");

// =====================================================
// SERVIR IMAGENS
// =====================================================

app.use(
    "/uploads",
    express.static(pastaUploads)
);

// =====================================================
// ROTAS - USUÁRIOS
// =====================================================

app.use(
    "/usuarios",
    usuariosRoutes
);
app.use(
    "/historico",
    historicoRoutes
);

// =====================================================
// ROTAS - DASHBOARD
// =====================================================

app.use(
    "/dashboard",
    dashboardRoutes
);

app.use(
    "/notificacoes",
    notificacoesRoutes
);
app.use(
    "/orcamento",
    orcamentoRoutes
);

// =====================================================
// ROTAS - ITENS
// =====================================================

app.use(
    "/itens",
    itensRoutes
);

// =====================================================
// ROTAS - CARRINHO
// =====================================================

app.use(
    "/carrinho",
    carrinhoRoutes
);

// =====================================================
// ROTAS - PEDIDOS
// =====================================================

app.use(
    "/pedidos",
    pedidosRoutes
);

// =====================================================
// ROTAS - ITENS DOS PEDIDOS
// =====================================================

app.use(
    "/itens_pedidos",
    itens_pedidosRoutes
);

// =====================================================
// ROTAS - FEEDBACKS
// =====================================================

app.use(
    "/feedbacks",
    feedbacksRoutes
);

// =====================================================
// ROTAS - CUPONS
// =====================================================

app.use(
    "/cupons",
    cuponsRoutes
);

app.use(
    "/fidelidade",
    fidelidadeRoutes
);
app.use(
    "/cartoes",
    cartoesRoutes
);

// =====================================================
// ROTA PRINCIPAL
// =====================================================

app.get(
    "/",
    (req, res) => {
        res.json({
            mensagem: "API funcionando!"
        });
    }
);

// =====================================================
// TRATAMENTO DE 404
// =====================================================

app.use(
    (req, res) => {
        res.status(404).json({
            erro: "Rota não encontrada.",
            rota: req.originalUrl
        });
    }
);

// =====================================================
// SERVIDOR
// =====================================================

garantirTabelaHistorico()
    .then(() => app.listen(
        config.port,
        () => {

        console.log(
            "======================================"
        );

        console.log(
            `Servidor rodando na porta ${config.port}`
        );

        console.log(
            `http://localhost:${config.port}`
        );

        console.log(
            `Uploads disponíveis em: http://localhost:${config.port}/uploads`
        );

        console.log(
            "Pasta real dos uploads:"
        );

        console.log(
            pastaUploads
        );

        console.log(
            "======================================"
        );
        }
    ))
    .catch((error) => {
        console.error("Erro ao preparar o historico do sistema:", error);
        process.exitCode = 1;
    });
