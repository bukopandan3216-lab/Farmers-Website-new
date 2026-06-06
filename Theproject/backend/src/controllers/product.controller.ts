import { Response } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { AuthRequest } from '../middleware/auth.js';
import { productService } from '../services/product.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const productController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 20;
      const categoryId = req.query.categoryId as string;
      const search = req.query.search as string;
      const farmerId = req.query.farmerId as string;

      const result = await productService.getAll(skip, take, categoryId, search, farmerId);

      // Ensure image URLs are absolute so frontend doesn't need to rewrite them.
      const apiOrigin = `${req.protocol}://${req.get('host')}`;
      const products = result.products.map((p: any) => ({
        ...p,
        images: (p.images || []).map((img: string) => (typeof img === 'string' && img.startsWith('/uploads') ? `${apiOrigin}${img}` : img)),
      }));

      sendSuccess(res, 200, 'Products fetched successfully', { ...result, products });
    } catch (error: any) {
      sendError(res, 500, 'Failed to fetch products');
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);
      const apiOrigin = `${req.protocol}://${req.get('host')}`;
      const mapped = {
        ...product,
        images: (product.images || []).map((img: string) => (typeof img === 'string' && img.startsWith('/uploads') ? `${apiOrigin}${img}` : img)),
      };

      sendSuccess(res, 200, 'Product fetched successfully', mapped);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to fetch product');
      }
    }
  },

  async getFeatured(req: AuthRequest, res: Response) {
    try {
      const products = await productService.getFeatured();
      const apiOrigin = `${req.protocol}://${req.get('host')}`;
      const mapped = products.map((p: any) => ({
        ...p,
        images: (p.images || []).map((img: string) => (typeof img === 'string' && img.startsWith('/uploads') ? `${apiOrigin}${img}` : img)),
      }));

      sendSuccess(res, 200, 'Featured products fetched successfully', mapped);
    } catch (error: any) {
      console.error('getFeatured error:', error); // ADD THIS LINE
      sendError(res, 500, 'Failed to fetch featured products');
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !['FARMER', 'ADMIN'].includes(req.user.role)) {
        return sendError(res, 403, 'Only farmers can create products');
      }

     // const { name, description, categoryId, price, stock, organic, images } =
       // req.body;

       const {
  name,
  description,
  categoryId,
  price,
  stock,
  organic,
} = req.body;


      if (!name || !categoryId || !price) {
        return sendError(res, 400, 'Missing required fields');
      }

      let images: string[] = [];

if (req.file) {
  images = [
    `/uploads/products/${req.file.filename}`
  ];
}

      const product = await productService.create(req.user.userId, {
        name,
        description,
        categoryId,
        price,
        stock: stock || 0,
        organic: organic || false,
        images: images || [],
      });

      const apiOrigin = `${req.protocol}://${req.get('host')}`;
      const mapped = {
        ...product,
        images: (product.images || []).map((img: string) => (typeof img === 'string' && img.startsWith('/uploads') ? `${apiOrigin}${img}` : img)),
      };

      sendSuccess(res, 201, 'Product created successfully', mapped);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to create product');
      }
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !['FARMER', 'ADMIN'].includes(req.user.role)) {
        return sendError(res, 403, 'Only farmers can update products');
      }

      const { id } = req.params;
      const product = await productService.update(id, req.user.userId, req.body);

      sendSuccess(res, 200, 'Product updated successfully', product);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to update product');
      }
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !['FARMER', 'ADMIN'].includes(req.user.role)) {
        return sendError(res, 403, 'Only farmers can delete products');
      }

      const { id } = req.params;
      await productService.delete(id, req.user.userId);

      sendSuccess(res, 200, 'Product deleted successfully');
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to delete product');
      }
    }
  },
};
