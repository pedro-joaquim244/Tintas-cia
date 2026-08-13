import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import pedidosRoutes from "./routes/pedidos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import itensRoutes from "./routes/itens.routes.js";
import itens_pedidosRoutes from "./routes/itens_pedidos.routes.js";
import carrinhoRoutes from "./routes/carrinho.routes.js";
import cuponsRoutes from "./routes/cupons.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import feedbacksRoutes from "./routes/feedbacks.routes.js";      
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

app.use(
    express.json()
);


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
//
// Estrutura esperada:
//
// backend/
// ├── server.js
// ├── routes/
// └── uploads/
//     └── usuarios/
//         └── usuario-xxxx.webp
//
// A URL:
//
// http://localhost:3333/uploads/usuarios/foto.webp
//
// aponta para:
//
// backend/uploads/usuarios/foto.webp
//
// =====================================================

const pastaUploads =
    path.join(
        __dirname,
        "uploads"
    );


app.use(
    "/uploads",
    express.static(
        pastaUploads
    )
);


// =====================================================
// LOG PARA CONFERIR A PASTA DE UPLOADS
// =====================================================

console.log(
    "Pasta de uploads:",
    pastaUploads
);


// =====================================================
// ROTAS - USUÁRIOS
// =====================================================

app.use(
    "/usuarios",
    usuariosRoutes
);


// =====================================================
// ROTAS - DASHBOARD
// =====================================================

app.use(
    "/dashboard",
    dashboardRoutes
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

app.listen(
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
            "======================================"
        );

    }
);