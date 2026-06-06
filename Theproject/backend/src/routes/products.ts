import express from 'express';
import { productController } from '../controllers/product.controller.js';
//import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { uploadProductImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/featured', productController.getFeatured);
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
//router.post('/', authMiddleware, roleMiddleware(['FARMER', 'ADMIN']), productController.create);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['FARMER', 'ADMIN']),
  uploadProductImage.single('image'),
  productController.create
);
//router.put('/:id', authMiddleware, roleMiddleware(['FARMER', 'ADMIN']), productController.update);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['FARMER', 'ADMIN']),
  uploadProductImage.single('image'),
  productController.update
);
router.delete('/:id', authMiddleware, roleMiddleware(['FARMER', 'ADMIN']), productController.delete);

export default router;
