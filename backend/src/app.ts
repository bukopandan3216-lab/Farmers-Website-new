import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
  app.use(cors({
    origin: config.clientUrl,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
