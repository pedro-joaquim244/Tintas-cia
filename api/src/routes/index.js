import express from "express";
import itensRoutes from "./itens.routes.js";
import usuariosRoutes from "./usuarios.routes.js"

const routes = express.Router();

routes.get("/", (req, res) => {
    return res.json({
        mensagem: "API funcionando!"
    });
});

routes.use("/itens", itensRoutes);
routes.use("/usuarios", usuariosRoutes);

export default routes;