# Quick Start: Get Application System Running

## Prerequisites ✅
- Node.js 18+
- PostgreSQL running
- Backend and frontend installed

## Step-by-Step Setup (5 minutes)

### 1. Database Migrations

```bash
cd "Farmers Website new/backend"

# Run Prisma migrations
npm run prisma:migrate dev

# When prompted, name the migrations:
# - "add_archived_column"
# - "add_application_model"

# Regenerate Prisma client
npm run prisma:generate
```

**What this does**:
- Adds `archived` column to products table (fixes the Prisma error)
- Creates applications table for storing applications
- Creates ApplicationStatus enum

### 2. Install New Dependencies

```bash
cd "Farmers Website new/backend"
npm install
```

**What's new**: `nodemailer` for sending emails

### 3. Configure Email (Optional but Recommended)

Create/edit `.env` in backend root:

```env
# Existing variables (keep these)
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:5173

# Add these for email notifications:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@farmdirect.com
SMTP_SECURE=false
FRONTEND_URL=http://localhost:5173
```

**Gmail Setup** (easiest):
1. Go to myaccount.google.com
2. Security → 2-Step Verification (enable if not already)
3. Create App Password for Mail
4. Copy the 16-character password as SMTP_PASSWORD

**Without email** (testing only):
- Leave email fields blank
- Email sending will be skipped (won't block applications)

### 4. Start Backend

```bash
cd "Farmers Website new/backend"
npm run dev
```

✅ Should see: `Server running on http://localhost:5000`

### 5. Start Frontend

In a new terminal:

```bash
cd "Farmers Website new/frontend"
npm run dev
```

✅ Should see: `Local: http://localhost:5173`

---

## What Changed 🔄

### Users Can NO LONGER:
- ❌ Sign up directly via `/signup`
- ❌ Create accounts instantly
- ❌ Access marketplace without approval

### Users MUST NOW:
- ✅ Apply via `/apply` form
- ✅ Wait for admin approval
- ✅ Get approval email before logging in

### Admin Can:
- ✅ View all applications at `/admin/applications`
- ✅ Approve applications (creates user account)
- ✅ Reject applications (with reason)
- ✅ Send approval/rejection emails

---

## Testing the System

### 1. Test Application Form

1. Open http://localhost:5173/apply
2. Select "Buyer Account"
3. Fill in the form:
   - Name: John Test
   - Email: john-test@example.com
   - Password: TestPass123
   - Phone: (555) 123-4567
   - Address: 123 Test St
4. Click "Submit Application"
5. ✅ Should see success page

### 2. Admin Approval

1. Login as admin:
   - Email: admin@farmdirect.com
   - Password: password
2. Go to http://localhost:5173/admin/applications
3. Click "View Details" on pending application
4. Click "Approve Application"
5. ✅ User account created in database
6. ✅ Approval email sent (if SMTP configured)

### 3. Test Login

1. Go to http://localhost:5173/login
2. Enter email: john-test@example.com
3. Enter password: TestPass123
4. ✅ Should log in successfully

### 4. Test Farmer Application

1. Go to http://localhost:5173/apply
2. Select "Farmer/Seller Account"
3. Fill all fields including farm info
4. Upload a file for "Valid ID" (required for farmers)
5. Business permit is optional
6. Submit
7. Admin approves
8. ✅ Farmer profile automatically created

---

## Key Files (What Was Created/Modified)

### Backend (NEW)
```
backend/src/
├── config/
│   └── email.ts (NEW) - Email notifications
├── services/
│   ├── application.service.ts (NEW) - Application logic
│   └── auth.service.ts (MODIFIED) - Signup disabled
├── controllers/
│   └── application.controller.ts (NEW) - HTTP handlers
├── routes/
│   └── applications.ts (NEW) - API endpoints
└── utils/
    └── upload.ts (NEW) - File upload config

backend/prisma/
├── schema.prisma (MODIFIED) - Added Application model
└── migrations/
    ├── 20260529000000_add_archived_column/ (NEW)
    └── 20260529000001_add_application_model/ (NEW)

backend/package.json (MODIFIED) - Added nodemailer
backend/src/app.ts (MODIFIED) - Registered routes
```

### Frontend (NEW/MODIFIED)
```
frontend/src/app/
├── pages/
│   ├── ApplyPage.tsx (NEW) - Application form
│   ├── AdminApplicationsPage.tsx (NEW) - Admin dashboard
│   ├── SignupPage.tsx (MODIFIED) - Redirects to /apply
│   └── LoginPage.tsx (MODIFIED) - Updated link text
├── services/
│   └── api.ts (MODIFIED) - Added applicationApi
└── App.tsx (MODIFIED) - Updated routes
```

---

## Verify Everything Works

### Checklist
- [ ] Migrations ran successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can visit http://localhost:5173/apply
- [ ] Can fill out and submit application
- [ ] Admin can view applications at `/admin/applications`
- [ ] Admin can approve/reject applications
- [ ] Approved user can log in
- [ ] Emails send (if configured)

### If Something Doesn't Work

**Backend won't start**:
```bash
# Check Prisma is regenerated
npm run prisma:generate

# Check database is running
# Check DATABASE_URL is correct
```

**ApplyPage shows 404**:
```bash
# Verify you're using the new ApplyPage component
# Check App.tsx imports ApplyPage (not ApplicationPage)
```

**Admin can't see applications**:
```bash
# Ensure user has role = 'ADMIN' in database
# Check JWT token is valid
```

**Emails not sending**:
- Emails are optional - system works without them
- Check SMTP credentials in `.env`
- Gmail: Use app password, not account password

---

## Next Steps (After Testing)

1. **Create more test accounts** via `/apply`
2. **Test farmer workflow** with file uploads
3. **Test email functionality** if configured
4. **Review admin dashboard** features
5. **Test role-based access** (buyer vs farmer vs admin)

---

## Summary of Key Changes

| What | Before | After |
|------|--------|-------|
| Account Creation | Instant signup | Admin approval needed |
| Registration | `/signup` form | `/apply` form |
| Form Fields | Basic (name, email, password) | Role-based (common + farmer fields) |
| Farmer Info | Added later | Submitted at application |
| Login Access | Immediate | Only after approval |
| Admin Approval | N/A | `/admin/applications` dashboard |

---

## Support

**All documentation**: See `IMPLEMENTATION_GUIDE.md` in project root

**Need to check database**:
```bash
npm run prisma:studio
```

**Need to reset everything**:
```bash
# ⚠️ WARNING: Deletes all data
npm run prisma:migrate reset

# Then re-seed:
npm run seed
```

---

**Status**: Ready to test! 🚀
