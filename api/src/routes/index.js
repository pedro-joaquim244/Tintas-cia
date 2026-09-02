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

import mercadoPagoRoutes from "./mercadoPago.routes.js";


const routes =
    express.Router();


// =====================================================
// TESTE API
// =====================================================

routes.get("/", (req, res) => {

    return res.status(200).json({
        mensagem: "API funcionando!"
    });

});


// =====================================================
// ITENS
// =====================================================

routes.use(
    "/itens",
    itensRoutes
);


// =====================================================
// USUÁRIOS
// =====================================================

routes.use(
    "/usuarios",
    usuariosRoutes
);


// =====================================================
// CARRINHO
// =====================================================

routes.use(
    "/carrinho",
    carrinhoRoutes
);


// =====================================================
// PEDIDOS
// =====================================================

routes.use(
    "/pedidos",
    pedidosRoutes
);


// =====================================================
// ITENS PEDIDOS
// =====================================================

routes.use(
    "/itens_pedidos",
    itens_pedidosRoutes
);


// =====================================================
// CUPONS
// =====================================================

routes.use(
    "/cupons",
    cuponsRoutes
);


// =====================================================
// DASHBOARD
// =====================================================

routes.use(
    "/dashboard",
    dashboardRoutes
);


// =====================================================
// FEEDBACKS
// =====================================================

routes.use(
    "/feedbacks",
    feedbacksRoutes
);


// =====================================================
// FIDELIDADE
// =====================================================

routes.use(
    "/fidelidade",
    fidelidadeRoutes
);


// =====================================================
// CARTÕES
// =====================================================

routes.use(
    "/cartoes",
    cartoesRoutes
);


// =====================================================
// NOTIFICAÇÕES
// =====================================================

routes.use(
    "/notificacoes",
    notificacoesRoutes
);


// =====================================================
// ORÇAMENTO
// =====================================================

routes.use(
    "/orcamento",
    orcamentoRoutes
);


// =====================================================
// HISTÓRICO
// =====================================================

routes.use(
    "/historico",
    historicoRoutes
);


// =====================================================
// MERCADO PAGO
//
// URL FINAL:
// /api/mercado-pago/...
// =====================================================

routes.use(
    "/api/mercado-pago",
    mercadoPagoRoutes
);


export default routes;