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
      sendSuccess(res, 200, 'Products fetched successfully', result);
    } catch (error: any) {
      sendError(res, 500, 'Failed to fetch products');
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);
      sendSuccess(res, 200, 'Product fetched successfully', product);
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
      sendSuccess(res, 200, 'Featured products fetched successfully', products);
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

      const { name, description, categoryId, price, stock, organic, images } =
        req.body;

      if (!name || !categoryId || !price) {
        return sendError(res, 400, 'Missing required fields');
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

      sendSuccess(res, 201, 'Product created successfully', product);
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
