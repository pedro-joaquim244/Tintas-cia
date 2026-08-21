import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastaUploads = path.resolve(__dirname, "..", "..", "uploads", "usuarios");

if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, pastaUploads);

    },

    filename: (req, file, cb) => {

        const extensao = path.extname(file.originalname);

        const nomeArquivo =
            `usuario-${Date.now()}${extensao}`;

        cb(null, nomeArquivo);

    }

});

const fileFilter = (req, file, cb) => {

    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (tiposPermitidos.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Apenas imagens JPG, PNG ou WEBP são permitidas."
            )
        );

    }

};

const uploadUsuario = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024
    }

});

export default uploadUsuario;