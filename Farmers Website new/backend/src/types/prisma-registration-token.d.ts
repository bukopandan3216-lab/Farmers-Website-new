import { PrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  // Extend PrismaClient to include the registrationToken model if generated
  interface PrismaClient {
    registrationToken: any;
  }
}
