import express, { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router: Router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────
// IMPORTANT: /create-account (static path) must be declared BEFORE /:applicationId
// routes, otherwise Express will try to match the literal string "create-account"
// as an applicationId parameter and route it to the wrong handler.

router.post('/', applicationController.submitApplication);

router.get('/verify-token', applicationController.verifyToken);
// from claude

// Token-based account creation (new flow — email link with ?token=...)
router.post('/create-account', applicationController.createAccountWithToken);

// Legacy flow — create account via applicationId path param
router.post('/:applicationId/create-account', applicationController.createAccountAfterApproval);

// Public: fetch a single application by id
router.get('/:id', applicationController.getApplication);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), applicationController.getAllApplications);
router.patch('/:id/approve', authMiddleware, roleMiddleware(['ADMIN']), applicationController.approveApplication);
router.patch('/:id/reject', authMiddleware, roleMiddleware(['ADMIN']), applicationController.rejectApplication);
router.post('/:id/resend-approval', authMiddleware, roleMiddleware(['ADMIN']), applicationController.resendApproval);

export default router;
