import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastaUploads = path.resolve(__dirname, "..", "..", "uploads");

if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, {
        recursive: true
    });
}

console.log("Pasta onde os uploads serão salvos:", pastaUploads);

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, pastaUploads);

    },

    filename: (req, file, cb) => {

        const nome =
            Date.now() +
            path.extname(file.originalname);

        cb(null, nome);

    }

});

const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});

export default upload;