// ── ADD THIS METHOD inside the applicationController object ──────────────────
//
// Place it just before or after createAccountWithToken in
// backend/src/controllers/application.controller.ts
//
// Also add the route in applications.ts (see applications.ts patch below):
//   router.get('/verify-token', applicationController.verifyToken);
//
// CODE SNIPPET (documentation only - not compiled):
/*
  async verifyToken(req: AuthRequest, res: Response) {
    try {
      const { token } = req.query as { token?: string };
      if (!token) return sendError(res, 400, 'Token is required');

      const reg = await (prisma as any).registrationToken.findUnique({ where: { token } });
      if (!reg) return sendError(res, 404, 'Invalid token');
      if (reg.used) return sendError(res, 400, 'This link has already been used');
      if (reg.expiresAt < new Date()) return sendError(res, 400, 'This link has expired');

      // Return just enough info for the frontend to personalise the form
      const user = await prisma.user.findUnique({ where: { id: reg.userId }, select: { fullName: true, role: true } });
      return sendSuccess(res, 200, 'Token is valid', { role: user?.role, fullName: user?.fullName });
    } catch (error: any) {
      console.error('Verify token error:', error);
      return sendError(res, 500, 'Failed to verify token');
    }
  },
*/
