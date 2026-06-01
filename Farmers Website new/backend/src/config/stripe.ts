import Stripe from 'stripe';
import { config } from './index.js';

export const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' })
  : null;
