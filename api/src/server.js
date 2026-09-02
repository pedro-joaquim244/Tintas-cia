import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";

import {
    garantirTabelaHistorico
} from "./services/historico.service.js";

import {
    config
} from "./config.js";


// =====================================================
// APP
// =====================================================

const app =
    express();


// =====================================================
// CAMINHO ABSOLUTO
// =====================================================

const __filename =
    fileURLToPath(
        import.meta.url
    );


const __dirname =
    path.dirname(
        __filename
    );


// =====================================================
// CORS
// =====================================================

app.use(

    cors({

        origin:
            config.corsOrigin

    })

);


// =====================================================
// JSON
// =====================================================

app.use(

    express.json({

        limit: "10mb"

    })

);


// =====================================================
// URL ENCODED
// =====================================================

app.use(

    express.urlencoded({

        extended: true,

        limit: "10mb"

    })

);


// =====================================================
// UPLOADS
// =====================================================

const pastaUploads =
    path.join(
        __dirname,
        "uploads"
    );


if (
    !fs.existsSync(
        pastaUploads
    )
) {

    fs.mkdirSync(
        pastaUploads,
        {
            recursive: true
        }
    );

}


console.log(
    "======================================"
);

console.log(
    "CAMINHO DOS UPLOADS:"
);

console.log(
    pastaUploads
);

console.log(
    "A pasta uploads existe?",
    fs.existsSync(
        pastaUploads
    )
);

console.log(
    "======================================"
);


// =====================================================
// SERVIR UPLOADS
// =====================================================

app.use(

    "/uploads",

    express.static(
        pastaUploads
    )

);


// =====================================================
// ROTAS
//
// Não coloque /api aqui porque somente Mercado Pago
// usa /api/mercado-pago neste momento.
// =====================================================

app.use(
    routes
);


// =====================================================
// 404
// =====================================================

app.use(

    (req, res) => {

        return res
            .status(404)
            .json({

                erro:
                    "Rota não encontrada.",

                rota:
                    req.originalUrl

            });

    }

);


// =====================================================
// PREPARAR BANCO E INICIAR SERVIDOR
// =====================================================

garantirTabelaHistorico()

    .then(() => {

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
                    "Mercado Pago:"
                );

                console.log(
                    `http://localhost:${config.port}/api/mercado-pago/teste`
                );

                console.log(
                    "Access Token configurado:",
                    Boolean(
                        process.env
                            .MERCADO_PAGO_ACCESS_TOKEN
                    )
                );

                console.log(
                    "======================================"
                );

            }

        );

    })

    .catch((error) => {

        console.error(
            "Erro ao preparar o histórico do sistema:",
            error
        );

        process.exitCode = 1;

    });


export default app;