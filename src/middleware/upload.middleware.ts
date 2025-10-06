import multer from 'multer';
import { s3Config } from '../config/aws.config';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter to validate image types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (s3Config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${s3Config.allowedMimeTypes.join(', ')} are allowed.`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: s3Config.maxFileSize,
  },
});
