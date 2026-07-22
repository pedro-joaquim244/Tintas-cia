import multer from "multer";
import path from "path";
import fs from "fs";


const pastaUploads = "uploads";


// cria a pasta se não existir
if(!fs.existsSync(pastaUploads)){
    fs.mkdirSync(pastaUploads);
}



const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,pastaUploads);

    },


    filename:(req,file,cb)=>{

        const nome =
        Date.now() +
        path.extname(file.originalname);


        cb(null,nome);

    }

});



const upload = multer({

    storage,

    limits:{
        fileSize:5 * 1024 * 1024
    }

});


export default upload;