import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Create upload directories if they don't exist
const uploadDirs = ['uploads', 'uploads/profiles', 'uploads/ids', 'uploads/permits'];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads';
    
    // Determine upload directory based on field name
    if (file.fieldname === 'profileImage') {
      uploadPath = 'uploads/profiles';
    } else if (file.fieldname === 'validId') {
      uploadPath = 'uploads/ids';
    } else if (file.fieldname === 'businessPermit') {
      uploadPath = 'uploads/permits';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    cb(null, `${name}-${timestamp}-${random}${ext}`);
  },
});

// File filter to accept only images and PDFs
const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }

  cb(null, true);
};

// Create multer instance
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Utility function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/api/uploads/${filename}`;
};

// Utility function to delete file
export const deleteFile = (filepath: string): void => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
