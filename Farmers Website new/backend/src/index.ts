import { config, validateConfig } from './config/index.js';
import { createApp } from './app.js';
import prisma from './config/database.js';
import { ensureDemoUsers, seedDatabase } from './scripts/seed.js';

validateConfig();

const app = createApp();
const PORT = config.port;

async function startServer() {
  if (config.nodeEnv === 'development') {
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log('Development database is empty. Seeding demo data...');
      await seedDatabase();
    } else {
      await ensureDemoUsers();
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
  });
}

startServer().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
