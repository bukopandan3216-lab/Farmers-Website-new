import prisma from '../config/database.js';
import { createError } from '../utils/errors.js';

export const productService = {
  async getAll(skip = 0, take = 20, categoryId?: string, search?: string) {
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          farmer: {
            select: {
              id: true,
              fullName: true,
              farmerProfile: true,
            },
          },
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRatings = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      };
    });

    return {
      products: productsWithRatings,
      total,
      skip,
      take,
      pages: Math.ceil(total / take),
    };
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            id: true,
            fullName: true,
            farmerProfile: true,
          },
        },
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw createError(404, 'Product not found');
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : 0;

    return {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    };
  },

  async create(farmerId: string, data: any) {
    const product = await prisma.product.create({
      data: {
        farmerId,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        stock: data.stock,
        organic: data.organic || false,
        featured: data.featured || false,
        images: data.images || [],
      },
      include: {
        farmer: {
            select: {
              id: true,
              fullName: true,
              farmerProfile: true,
            },
        },
        category: true,
      },
    });

    return product;
  },

  async update(productId: string, farmerId: string, data: any) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw createError(404, 'Product not found');
    }

    if (product.farmerId !== farmerId) {
      throw createError(403, 'Unauthorized');
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.organic !== undefined && { organic: data.organic }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.images && { images: data.images }),
      },
      include: {
        farmer: {
            select: {
              id: true,
              fullName: true,
              farmerProfile: true,
            },
        },
        category: true,
      },
    });

    return updated;
  },

  async delete(productId: string, farmerId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw createError(404, 'Product not found');
    }

    if (product.farmerId !== farmerId) {
      throw createError(403, 'Unauthorized');
    }

    await prisma.product.delete({
      where: { id: productId },
    });
  },

  async getFeatured() {
    const products = await prisma.product.findMany({
      where: { featured: true },
      take: 8,
      include: {
        farmer: {
            select: {
              id: true,
              fullName: true,
              farmerProfile: true,
            },
        },
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    return products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      };
    });
  },
};
