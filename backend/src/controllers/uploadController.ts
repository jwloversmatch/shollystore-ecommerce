import { Request, Response } from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary'; 

const upload = multer({ storage: multer.memoryStorage() }).single('image');

export const uploadImage = (req: Request, res: Response): void => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce_products' },
      (error, result) => {
        if (error) return res.status(500).json({ message: error.message });
        res.status(201).json({ url: result?.secure_url });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};