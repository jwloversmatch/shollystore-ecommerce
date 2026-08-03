import { Request, Response } from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
}).single('image');

export const uploadImage = (req: Request, res: Response): void => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum size is 5 MB.'
        : err.message;
      res.status(400).json({ success: false, message });
      return;
    }
    if (err) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'ecommerce_products',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
      (error, result) => {
        if (error) {
          res.status(500).json({ success: false, message: 'Upload failed' });
          return;
        }
        res.status(201).json({ success: true, url: result?.secure_url });
      },
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};
