import express from "express";

import itensRoutes from "./itens.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import carrinhoRoutes from "./carrinho.routes.js";
import pedidosRoutes from "./pedidos.routes.js";
import itens_pedidosRoutes from "./itens_pedidos.routes.js";
import cuponsRoutes from "./cupons.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import feedbacksRoutes from "./feedbacks.routes.js";
import fidelidadeRoutes from "./fidelidade.routes.js";
import cartoesRoutes from "./cartoes.routes.js";
import notificacoesRoutes from "./notificacoes.routes.js";
import orcamentoRoutes from "./orcamento.routes.js";
import historicoRoutes from "./hsitorico.routes.js";

const routes = express.Router();

// =====================================================
// TESTE DA API
// =====================================================

routes.get("/", (req, res) => {
    return res.json({
        mensagem: "API funcionando!"
    });
});

// =====================================================
// ROTAS
// =====================================================

routes.use(
    "/itens",
    itensRoutes
);

routes.use(
    "/historico",
    historicoRoutes
);

routes.use(
    "/usuarios",
    usuariosRoutes
);
routes.use(
    "/notificacoes",
    notificacoesRoutes
);

routes.use(
    "/carrinho",
    carrinhoRoutes
);
routes.use(
    "/orcamento",
    orcamentoRoutes
);

routes.use(
    "/pedidos",
    pedidosRoutes
);

routes.use(
    "/feedbacks",
    feedbacksRoutes
);

routes.use(
    "/fidelidade",
    fidelidadeRoutes
);
routes.use(
    "/cartoes",
    cartoesRoutes
);
routes.use(
    "/itens_pedidos",
    itens_pedidosRoutes
);
routes.use(
    "/dashboard",
    dashboardRoutes
);

// =====================================================
// CUPONS
// =====================================================

routes.use(
    "/cupons",
    cuponsRoutes
);

export default routes;
