import express from "express";
import cors from "cors";
import routes from "./routes/index.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);


app.listen(3333, () => {
    console.log("servidor rodando na porta 3333")
})