import express from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import { supabase } from '../config/supabase.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  },
});

const uploadsBasePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
if (!fs.existsSync(uploadsBasePath)) {
  fs.mkdirSync(uploadsBasePath, { recursive: true });
}

router.post('/:bucket', upload.single('file'), async (req, res) => {
  if (!req.file) return sendError(res, 400, 'File is required');

  const bucket = req.params.bucket;
  const extension = req.file.originalname.split('.').pop() || 'jpg';
  const fileName = `${randomUUID()}.${extension}`;

  try {
    if (supabase) {
      const { error } = await supabase.storage.from(bucket).upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

      if (error) {
        console.error('SUPABASE STORAGE ERROR:', error);
        return sendError(res, 400, error.message);
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return sendSuccess(res, 201, 'File uploaded successfully', { path: fileName, url: data.publicUrl });
    }

    if (config.nodeEnv === 'production') {
      return sendError(res, 500, 'Supabase storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }

    // Local fallback for development when Supabase is not configured.
    const bucketPath = path.join(uploadsBasePath, bucket);
    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath, { recursive: true });
    }

    const localFilePath = path.join(bucketPath, fileName);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const publicUrl = `/uploads/${bucket}/${fileName}`;
    return sendSuccess(res, 201, 'File uploaded successfully', { path: fileName, url: publicUrl });
  } catch (error) {
    console.error('UPLOAD ERROR:', error);
    return sendError(res, 500, String(error));
  }
});

export default router;
