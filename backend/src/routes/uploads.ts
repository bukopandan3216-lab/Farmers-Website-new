import express from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
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

router.post('/:bucket', authMiddleware, upload.single('file'), async (req, res) => {
  if (!supabase) return sendError(res, 500, 'Supabase storage is not configured');
  if (!req.file) return sendError(res, 400, 'File is required');
  const bucket = req.params.bucket;
  const extension = req.file.originalname.split('.').pop() || 'jpg';
  const path = `${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false,
  });
  if (error) return sendError(res, 400, error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  sendSuccess(res, 201, 'File uploaded successfully', { path, url: data.publicUrl });
});

export default router;
