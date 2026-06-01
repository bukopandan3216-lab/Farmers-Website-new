# FarmDirect Application-Based Account Approval System

## Implementation Complete ✅

This document outlines the complete implementation of the application-based account approval system for FarmDirect, including the Prisma database fixes.

## Table of Contents
1. [Overview](#overview)
2. [Database Changes](#database-changes)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Email Configuration](#email-configuration)
6. [Setup Instructions](#setup-instructions)
7. [Testing Guide](#testing-guide)
8. [API Reference](#api-reference)

---

## Overview

The system replaces instant account registration with a unified application process where:

- **Users cannot directly sign up** - All account creation must go through the application system
- **Single application form** - One form serves both buyers and farmers
- **Admin approval required** - Users can only log in after admin approval
- **Email notifications** - Approval and rejection emails sent to applicants
- **Soft-delete products** - Fixed missing `archived` column in products table

---

## Database Changes

### Fixed Prisma Error

**Problem**: The schema included `archived` field on products, but migrations didn't add it to the database.

**Solution**: Created migration `20260529000000_add_archived_column` that adds the column:

```sql
ALTER TABLE "products" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
```

### New Application Model

**Migration**: `20260529000001_add_application_model`

**Models Created**:

```prisma
enum ApplicationStatus {
  PENDING      -- Application under review
  APPROVED     -- User account created, can login
  REJECTED     -- Application denied, reason provided
}

model Application {
  id                   String   @id @default(cuid())
  fullName             String
  email                String   @unique
  hashedPassword       String
  phone                String
  address              String
  role                 Role     -- BUYER or FARMER

  // Farmer-specific
  farmName             String?
  farmAddress          String?
  description          String?

  // File uploads
  validIdUrl           String?
  businessPermitUrl    String?
  profileImageUrl      String?

  status               ApplicationStatus @default(PENDING)
  rejectionReason      String?

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([email])
  @@index([status])
  @@map("applications")
}
```

---

## Backend Implementation

### 1. Email Service (`src/config/email.ts`)

Handles email notifications using Nodemailer.

**Features**:
- Approval email with login instructions
- Rejection email with reason
- HTML-templated emails with FarmDirect branding
- Non-blocking email sending (won't fail the application process)

**Configuration Required** (Environment Variables):
```env
SMTP_HOST=smtp.gmail.com        # Email provider
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@farmdirect.com
SMTP_SECURE=false
FRONTEND_URL=http://localhost:5173
```

**Usage**:
```typescript
// Send approval email
await emailService.sendApprovalEmail(
  "user@example.com",
  "John Doe",
  "FARMER"
);

// Send rejection email
await emailService.sendRejectionEmail(
  "user@example.com",
  "John Doe",
  "Missing required documents"
);
```

### 2. Application Service (`src/services/application.service.ts`)

Core business logic for managing applications.

**Methods**:

| Method | Purpose |
|--------|---------|
| `submitApplication(data)` | Create new application from form submission |
| `getApplicationById(id)` | Retrieve application details |
| `getAllApplications(status, skip, take)` | List applications with filtering |
| `approveApplication(id)` | Create user account and approve |
| `rejectApplication(id, reason)` | Mark as rejected with reason |

**Validation**:
- Unique email (no duplicates in applications or users)
- Password hashing with bcrypt
- All required fields present
- Farmer applications require farm information

### 3. Application Controller (`src/controllers/application.controller.ts`)

HTTP request handlers.

**Endpoints**:

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/applications` | None | Submit new application |
| GET | `/api/applications/:id` | None | Get application by ID |
| GET | `/api/applications` | Admin | List all applications |
| PATCH | `/api/applications/:id/approve` | Admin | Approve application |
| PATCH | `/api/applications/:id/reject` | Admin | Reject application |

**Validation**:
- Email format validation
- Password length (min 8 chars)
- Password confirmation match
- Farmer-specific field requirements

### 4. File Upload Service (`src/utils/upload.ts`)

Multer configuration for handling file uploads.

**Supported Files**:
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF

**Limits**:
- Max file size: 5MB
- Upload directories: `/uploads/profiles`, `/uploads/ids`, `/uploads/permits`

### 5. Updated Auth Service

**Changes**:
- `signup()` method now returns 403 Forbidden
- Error message directs users to `/apply` page
- Login functionality unchanged

---

## Frontend Implementation

### 1. ApplyPage Component (`src/app/pages/ApplyPage.tsx`)

**Three-step form**:

**Step 1: Role Selection**
- Choose Buyer or Farmer account
- Displays benefits of each role
- Visual card-based interface

**Step 2: Application Form**
- Common fields: Name, email, password, phone, address, profile photo
- Buyer: Basic fields only
- Farmer: Additional fields (farm name, address, description) + file uploads
- Real-time validation with error messages
- Loading states during submission

**Step 3: Success Confirmation**
- Displays application ID
- Explains next steps
- Links to login page and home

**Validation**:
- All fields required (except optional file uploads)
- Email format validation
- Password strength (8+ chars)
- Password confirmation match
- Farmer-specific validation

### 2. AdminApplicationsPage Component (`src/app/pages/AdminApplicationsPage.tsx`)

**Features**:
- Table view of all applications
- Filter by status (Pending, Approved, Rejected)
- Search by name or email
- Detailed application modal
- Approve/reject functionality
- Rejection reason input
- Application history with dates

**Status Colors**:
- Pending: Yellow
- Approved: Green
- Rejected: Red

### 3. Updated Pages

**SignupPage** → Redirects to `/apply`
- Prevents direct registration attempts
- Seamless redirect with loading message

**LoginPage** → Updated link text
- "Create one" → "Apply for an account"
- Links to `/apply` instead of `/signup`

---

## Email Configuration

### Gmail Setup (Recommended for Testing)

1. **Enable 2-Step Verification** on Google Account
2. **Generate App Password**:
   - Go to Google Account → Security
   - Create app password for "Mail"
   - Copy the 16-character password

3. **Environment Variables**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=noreply@farmdirect.com
SMTP_SECURE=false
```

### Alternative Providers

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| Gmail | smtp.gmail.com | 587 | Needs app password |
| SendGrid | smtp.sendgrid.net | 587 | API key as password |
| AWS SES | email-smtp.*.amazonaws.com | 587 | AWS credentials |
| Mailgun | smtp.mailgun.org | 587 | Mailgun credentials |

---

## Setup Instructions

### 1. Database Migrations

```bash
cd "Farmers Website new/backend"

# Run migrations
npm run prisma:migrate

# Or manually apply:
# - 20260529000000_add_archived_column/migration.sql
# - 20260529000001_add_application_model/migration.sql

# Regenerate Prisma client
npm run prisma:generate
```

### 2. Install Dependencies

```bash
# Backend
npm install nodemailer

# Or it's already in package.json, just run:
npm install
```

### 3. Environment Configuration

Create/update `.env` in backend root:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@farmdirect.com
SMTP_SECURE=false
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

### 4. Create Admin User

Current admin demo user (if exists):
```
Email: admin@farmdirect.com
Password: password
```

Ensure this account exists in the users table with role = 'ADMIN'

### 5. Seed Database (Optional)

```bash
npm run seed
```

Update `seed.ts` to include an admin user if needed.

### 6. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Testing Guide

### Happy Path: Buyer Application

1. **Visit** `/apply`
2. **Select** "Buyer Account"
3. **Fill Form**:
   - Full Name: John Buyer
   - Email: john@example.com
   - Password: SecurePass123
   - Phone: (555) 123-4567
   - Address: 123 Main St, City
4. **Submit** → See success confirmation
5. **Admin Approves** → User receives email
6. **User Logs In** → Access marketplace

### Happy Path: Farmer Application

1. **Visit** `/apply`
2. **Select** "Farmer/Seller Account"
3. **Fill Form**:
   - Common fields (same as buyer)
   - Farm Name: Green Valley Farm
   - Farm Address: 456 Rural Road
   - Description: Organic vegetables and fruits
   - Valid ID: Upload government ID
   - Business Permit: Upload (optional)
4. **Submit** → See success confirmation
5. **Admin Reviews** → Can download ID/permit
6. **Admin Approves** → Email sent, farmer profile created
7. **Farmer Logs In** → Can list products

### Admin Approval Flow

1. **Login** as admin (admin@farmdirect.com / password)
2. **Visit** `/admin/applications`
3. **View Pending** applications
4. **Click** "View Details"
5. **Review** application info
6. **Choose Action**:
   - ✅ Approve → User account created, email sent
   - ❌ Reject → Add reason, email sent
7. **Verify** approval/rejection emails

### Error Cases

**Test duplicate email**:
- Submit application with email: buyer1@example.com
- Try submitting again → Should get 409 Conflict

**Test weak password**:
- Submit with password "123" → Should get validation error

**Test missing farmer fields**:
- Select Farmer, skip farm name → Should get validation error

**Test signup endpoint**:
- POST to `/api/auth/signup` → Should get 403 Forbidden

---

## API Reference

### POST /api/applications

Submit new application.

**Request**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "phone": "(555) 123-4567",
  "address": "123 Main St, City",
  "role": "BUYER",
  "profileImageUrl": null,
  
  // Farmer only
  "farmName": "Green Valley Farm",
  "farmAddress": "456 Rural Road",
  "description": "Organic vegetables",
  "validIdUrl": null,
  "businessPermitUrl": null
}
```

**Response** (201):
```json
{
  "status": "success",
  "data": {
    "id": "clu...xyz",
    "email": "john@example.com",
    "status": "PENDING",
    "message": "Your application has been submitted successfully..."
  }
}
```

### GET /api/applications/:id

Get application details.

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "clu...xyz",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "address": "123 Main St",
    "role": "BUYER",
    "status": "PENDING",
    "createdAt": "2026-05-29T10:30:00Z"
  }
}
```

### GET /api/applications?status=PENDING&skip=0&take=20

List applications (admin only).

**Query Parameters**:
- `status`: PENDING | APPROVED | REJECTED (optional)
- `skip`: Pagination offset (default: 0)
- `take`: Pagination limit (default: 20)

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "applications": [...],
    "total": 15,
    "skip": 0,
    "take": 20,
    "pages": 1
  }
}
```

### PATCH /api/applications/:id/approve

Approve application (admin only).

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "application": {
      "id": "clu...xyz",
      "email": "john@example.com",
      "status": "APPROVED"
    },
    "user": {
      "id": "usr...abc",
      "email": "john@example.com",
      "role": "BUYER"
    }
  }
}
```

### PATCH /api/applications/:id/reject

Reject application (admin only).

**Request**:
```json
{
  "rejectionReason": "Missing required documents"
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "clu...xyz",
    "email": "john@example.com",
    "status": "REJECTED",
    "rejectionReason": "Missing required documents"
  }
}
```

---

## Files Modified/Created

### Backend
- ✅ `backend/prisma/schema.prisma` - Added Application model
- ✅ `backend/prisma/migrations/20260529000000_add_archived_column/migration.sql` - Archive column
- ✅ `backend/prisma/migrations/20260529000001_add_application_model/migration.sql` - Application table
- ✅ `backend/src/config/email.ts` - Email service (NEW)
- ✅ `backend/src/services/application.service.ts` - Application logic (NEW)
- ✅ `backend/src/controllers/application.controller.ts` - HTTP handlers (NEW)
- ✅ `backend/src/routes/applications.ts` - Route definitions (NEW)
- ✅ `backend/src/utils/upload.ts` - File upload config (NEW)
- ✅ `backend/src/services/auth.service.ts` - Disabled signup
- ✅ `backend/src/app.ts` - Registered routes
- ✅ `backend/package.json` - Added nodemailer

### Frontend
- ✅ `frontend/src/app/pages/ApplyPage.tsx` - Application form (NEW)
- ✅ `frontend/src/app/pages/AdminApplicationsPage.tsx` - Admin dashboard (NEW)
- ✅ `frontend/src/app/pages/SignupPage.tsx` - Redirect to apply
- ✅ `frontend/src/app/pages/LoginPage.tsx` - Updated link
- ✅ `frontend/src/app/services/api.ts` - Added applicationApi
- ✅ `frontend/src/app/App.tsx` - Updated routes

---

## Security Considerations

1. **Password Hashing**: Passwords hashed with bcrypt before storage
2. **Email Uniqueness**: Prevents duplicate applications and accounts
3. **Admin Authorization**: Approval endpoints require ADMIN role
4. **Input Validation**: All fields validated server-side
5. **File Uploads**: Mime type and size validation
6. **Email Verification**: Not implemented yet (can be added)

---

## Future Enhancements

1. **Email Verification**: Send verification link before approval
2. **Document Storage**: Upload to cloud storage (S3, Azure Blob)
3. **Two-Factor Authentication**: Enhanced security for sensitive accounts
4. **Application Status Page**: Users can check their application status
5. **Batch Operations**: Admin can approve/reject multiple at once
6. **Webhooks**: Notify external systems on approval
7. **Analytics**: Track application conversion metrics

---

## Troubleshooting

### Problem: Email not sending

**Solution**:
1. Check SMTP credentials in `.env`
2. Gmail: Verify app password (not account password)
3. Check network connectivity
4. Look for errors in backend logs

### Problem: "Column 'archived' does not exist"

**Solution**: Run migrations:
```bash
npm run prisma:migrate dev
```

### Problem: Admin can't access `/admin/applications`

**Solution**:
1. Ensure user has role = 'ADMIN' in database
2. Check JWT token is valid
3. Verify ProtectedRoute component checks roles correctly

### Problem: Applications not appearing

**Solution**:
1. Check database has applications table
2. Verify Prisma client regenerated: `npm run prisma:generate`
3. Check `/api/applications` returns data via API client

---

## Support

For issues or questions:
1. Check backend logs: `npm run dev`
2. Check browser console (frontend errors)
3. Test API endpoints directly with curl/Postman
4. Review error messages in application modal

---

**Last Updated**: May 29, 2026
**Status**: Ready for Production Testing
