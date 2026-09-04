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
import newsletterRoutes from "./newsletter.routes.js";
import emailsRoutes from "./adminEmails.routes.js";
import catalogoRoutes from "./catalogo.routes.js";
import freteRoutes from "./frete.routes.js";
import fornecedoresRoutes from "./fornecedores.routes.js";
import favoritosRoutes from "./favoritos.routes.js";
import mercadoPagoRoutes from "./mercadoPago.routes.js";


const routes = express.Router();


// =====================================================
// TESTE API
// =====================================================

routes.get("/", (_req, res) => {

    return res
        .status(200)
        .json({
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
// FORNECEDORES
// =====================================================

routes.use(
    "/fornecedores",
    fornecedoresRoutes
);


// =====================================================
// FAVORITOS
// =====================================================

routes.use(
    "/favoritos",
    favoritosRoutes
);


// =====================================================
// NEWSLETTER
// =====================================================

routes.use(
    "/newsletter",
    newsletterRoutes
);


// =====================================================
// FRETE
// =====================================================

routes.use(
    "/frete",
    freteRoutes
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
// CATÁLOGO
//
// GET  /catalogo-opcoes
//
// POST /catalogo-opcoes/categorias
// POST /catalogo-opcoes/marcas
// POST /catalogo-opcoes/cores
// =====================================================

routes.use(
    "/catalogo-opcoes",
    catalogoRoutes
);


// =====================================================
// ADMIN - E-MAILS
//
// GET  /admin/emails/status
// GET  /admin/emails/destinatarios
// GET  /admin/emails/resumo
// POST /admin/emails/enviar
// =====================================================

routes.use(
    "/admin/emails",
    emailsRoutes
);


// =====================================================
// MERCADO PAGO
//
// /api/mercado-pago/...
// =====================================================

routes.use(
    "/api/mercado-pago",
    mercadoPagoRoutes
);


export default routes;