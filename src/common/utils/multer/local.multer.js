// import multer from "multer";
// import { randomUUID } from "node:crypto";
// import { resolve } from 'node:path';
// import { fileFilter } from "./validation.multer.js";

// export const localFileUpload = (
//   {
//     customPath = "general",
//     validation =[]
//   }={}) =>{
//   const storage = multer.diskStorage({
//     destination:function (req,file,cb){
//       cb(null , resolve("../upload"))
//     },
//     filename:function (req,file,cb){
//       const uniqueFileName = randomUUID()+" "+file.originalname
//       cb(null, uniqueFileName)
//     }
//   })
//   // return multer({dest:"./temp"})
//   return multer({fileFilter:fileFilter(validation),storage})
// }

import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve, join } from 'node:path';
import fs from 'node:fs'; 
import { fileFilter } from "./validation.multer.js";

export const localFileUpload = ({
    customPath = "general",
    validation = []
} = {}) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const folderPath = resolve(`uploads/${customPath}`);
            
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            file.finalPath = join("uploads", customPath); 
            
            cb(null, folderPath);
        },
        filename: function (req, file, cb) {
            const uniqueFileName = randomUUID() + "-" + file.originalname;
            
            file.finalPath = join(file.finalPath, uniqueFileName);
            
            cb(null, uniqueFileName);
        }
    });

    return multer({ fileFilter: fileFilter(validation), storage });
}