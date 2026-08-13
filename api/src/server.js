
import express from "express";
import cors from "cors";
import path from "path";

import pedidosRoutes from "./routes/pedidos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import itensRoutes from "./routes/itens.routes.js";
import itens_pedidosRoutes from "./routes/itens_pedidos.routes.js";
import carrinhoRoutes from "./routes/carrinho.routes.js";
import cuponsRoutes from "./routes/cupons.routes.js";

import { config } from "./config.js";
import dashboardRoutes from "./routes/dashboard.routes.js"

const app = express();

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
// UPLOADS
// =====================================================

app.use(
    "/uploads",
    express.static(
        path.resolve("uploads")
    )
);

// =====================================================
// ROTAS
// =====================================================

app.use(
    "/usuarios",
    usuariosRoutes
);
app.use(
    "/dashboard",
    dashboardRoutes
);

app.use(
    "/itens",
    itensRoutes
);

app.use(
    "/carrinho",
    carrinhoRoutes
);

app.use(
    "/pedidos",
    pedidosRoutes
);

app.use(
    "/itens_pedidos",
    itens_pedidosRoutes
);

app.use(
    "/cupons",
    cuponsRoutes
)

// =====================================================
// TESTE
// =====================================================

app.get("/", (req, res) => {

    res.json({
        mensagem: "API funcionando!"
    });

});

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
            "======================================"
        );

    }
);
