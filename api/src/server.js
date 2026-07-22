import express from "express";
import cors from "cors";
import path from "path";

import usuariosRoutes from "./routes/usuarios.routes.js";
import itensRoutes from "./routes/itens.routes.js";
import { config } from "./config.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));

app.use(express.json());

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/usuarios", usuariosRoutes);
app.use("/itens", itensRoutes);

app.listen(config.port, () => {
    console.log(`Servidor rodando na porta ${config.port}`);
});