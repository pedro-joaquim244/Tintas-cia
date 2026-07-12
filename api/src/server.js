import express from "express";
import cors from "cors";

import usuariosRoutes from "./routes/usuarios.routes.js";
import itensRoutes from "./routes/itens.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/usuarios", usuariosRoutes);

app.use("/itens", itensRoutes);

app.listen(3333, () => {
    console.log(
        "Servidor rodando em http://localhost:3333"
    );
});