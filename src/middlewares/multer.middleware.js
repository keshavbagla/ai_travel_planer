import multer from "multer";
import fs from "fs";
import path from "path";


const uploadPath = "./public/temp";

if(!fs.existsSync(uploadPath)){
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const extension = path.extname(file.originalname);

    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${extension}`
    );
  },
});


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];

  if(allowedMimeTypes.includes(file.mimetype)){
    cb(null, true);
  }
  else{
    cb(new Error("Invalid file"), false);
  }
};


export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});