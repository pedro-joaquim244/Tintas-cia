import express from "express";

import itensRoutes from "./itens.routes.js";

const routes = express.Router();

routes.get("/", (req, res) => {
    return res.json({
        mensagem: "API funcionando!",
    });
});

routes.use("/itens", itensRoutes);

export default routes;