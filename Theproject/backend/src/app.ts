import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

// Routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import farmerRoutes from './routes/farmers.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import cartRoutes from './routes/cart.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';
import favoriteRoutes from './routes/favorites.js';
import uploadRoutes from './routes/uploads.js';
import paymentRoutes from './routes/payments.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';
import applicationRoutes from './routes/applications.js';
import debugRoutes from './routes/debug.js';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  // Configure helmet to allow cross-origin resource loading for static uploads
  app.use(
    helmet({
      // Allow images and other resources to be fetched from this origin by browsers
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Disable embedder policy which can block cross-origin fetching in some setups
      crossOriginEmbedderPolicy: false,
      // Keep opener policy default; fine for development
    })
  );
  app.use(morgan('combined'));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
  
  // CORS configuration - allow localhost on any port in development
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or server-to-server)
      if (!origin) return callback(null, true);
      
      // In development, allow any localhost origin
      if (config.nodeEnv === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      // In production, allow configured CLIENT_URL
      if (origin === config.clientUrl) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const uploadsStaticPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
  if (!fs.existsSync(uploadsStaticPath)) {
    fs.mkdirSync(uploadsStaticPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsStaticPath));

  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'FarmDirect API', version: '1.0.0' },
      servers: [{ url: '/api' }],
      components: {
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      },
    },
    apis: ['./src/routes/*.ts'],
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/farmers', farmerRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/debug', debugRoutes);

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
