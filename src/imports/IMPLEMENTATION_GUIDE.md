# FarmDirect HTML Separation & Enhanced Admin Panel

## Overview
This guide explains the HTML separation and enhanced admin panel features that have been added to the FarmDirect platform.

## New Files Created

### 1. **admin.html** - Comprehensive Admin Dashboard
**Location**: `Asset/admin.html`
**Features**:
- **Pending Verification Tab**: Review and approve/reject pending farmer and buyer applications
  - View applicant details in modal
  - See full verification info including ID photos
  - Count display for pending applications
  
- **All Users Tab**: User management system
  - Table view of all users
  - Filter by role (all, farmer, buyer, admin, rejected)
  - Filter by status (pending, active, rejected)
  - View user details
  
- **All Products Tab**: Inventory management
  - Grid view of all products
  - Statistics: Total products, low stock count, total revenue
  - Product cards with pricing and stock info
  
- **Orders & Sales Tab**: Order management
  - Complete order listing table
  - Sales statistics (total orders, pending orders, commission calculation)
  - Order status tracking
  
- **Reports Tab**: Platform analytics
  - Platform-wide statistics (active farmers, active buyers, categories, total sales)
  - Recent activity log
  - Commission tracking (5% of total revenue)

**User Details Modal**: 
- Shows comprehensive user information
- Displays ID photo and face/store photo
- Shows role-specific details (farm location for farmers, delivery address for buyers)
- Approve/Reject buttons for pending applicants

### 2. **buyer.html** - Enhanced Buyer Profile
**Location**: `Asset/buyer.html`
**Features**:
- **Personal Information**: Structured display of buyer profile
  - Full name, email, username
  - City, province, delivery address
  - Member since date
  
- **Order History**: Complete order tracking
  - All buyer's orders with status badges
  - Order dates and amounts
  - Order ID reference
  
- **Statistics Cards**:
  - Total Orders count
  - Total Amount Spent
  - Favorite Category
  - Days as Member

### 3. **farmer.html** - Farmer Dashboard & Store
**Location**: `Asset/farmer.html`
**Features**:

#### Farmer Dashboard (Page: farmer-dashboard)
- **Overview Tab**:
  - Store information display with photo
  - Sales statistics (products, orders, revenue, rating)
  - Recent orders table
  
- **Products Tab**:
  - Grid view of farmer's products
  - Edit product capabilities (coming soon)
  - Add new product button
  
- **Orders Tab**:
  - Order management by status filter
  - Order details with buyer info
  - Amount tracking
  
- **Analytics Tab**:
  - Monthly sales statistics
  - Customer satisfaction rating
  - Top-selling product
  - Sales trends visualization placeholder

#### Farmer Store (Page: farmer-store)
- **Public Store View**: Buyer-facing store page
  - Farmer store information
  - Store photo and details
  - Product listings
  - Location and contact info

## Updated JavaScript Files

### admin.js
**New Functions**:
- `switchAdminTab(tabName, evt)` - Switch between admin dashboard tabs
- `updateAdminDashboard()` - Load dashboard statistics
- `loadAllUsers(filter)` - Load users with filtering
- `filterUsers(filter, evt)` - Filter users by role/status
- `showUserDetailsModal(userId, action)` - Display user details modal
- `closeUserModal()` - Close user details modal
- `loadAllProducts()` - Load all products inventory
- `loadAllOrders()` - Load all orders
- `loadReports()` - Load platform activity and stats
- `showOrderDetails(orderId)` - Show order detail view

### buyer.js
**Enhanced Functions**:
- `renderBuyerProfile()` - Displays buyer profile with order history
- `handleCheckout(event)` - Improved checkout with validation
- New stats calculation for buyer dashboard

### farmer.js
**New Functions**:
- `renderFarmerDashboard()` - Load complete farmer dashboard
- `switchFarmerTab(tabName, evt)` - Switch farmer dashboard tabs
- `loadFarmerProducts()` - Load farmer's product inventory
- `loadFarmerOrders(status)` - Load farmer's orders with filtering
- `filterFarmerOrders(status, evt)` - Filter orders by status
- `showAddProductForm()` - Placeholder for product form
- `editFarmerStore()` - Placeholder for store editing

### admin.css
**New Styles**:
- `.admin-tab-btn` - Tab button styling
- `.admin-sub-tab-btn` - Sub-tab button styling
- `.admin-tab-content` - Tab content with fade animation
- `.modal`, `.modal-content`, `.modal-close` - Modal styling
- `.farmer-tab-content` - Farmer tab styling
- Responsive table styles

## Required Backend API Endpoints

All endpoints should be added to `products.php` with corresponding `action` parameters:

### Admin Dashboard Endpoints
1. **get_admin_dashboard_stats**
   - Returns: pending_farmers, pending_buyers, total_products, low_stock, total_revenue, total_orders, pending_orders, active_farmers, active_buyers, total_categories

2. **get_all_users** (filter: all, farmer, buyer, admin, rejected)
   - Returns: Array of users with id, full_name, email, role, status, created_at

3. **get_user_details** (user_id)
   - Returns: Complete user information including photos and role-specific data

4. **get_all_products**
   - Returns: Array of products with name, price, stock, image, seller info

5. **get_all_orders**
   - Returns: Array of orders with id, buyer_name, total_amount, status, created_at

6. **get_admin_reports**
   - Returns: Activity log with recent platform activities

### Buyer Endpoints
1. **get_buyer_profile** (user_id)
   - Returns: buyer details, orders array, member_days

### Farmer Endpoints
1. **get_farmer_dashboard** (farmer_id)
   - Returns: total_products, total_orders, total_revenue, rating, recent_orders

2. **get_farmer_products** (farmer_id)
   - Returns: Array of farmer's products

3. **get_farmer_orders** (farmer_id, status)
   - Returns: Array of orders with buyer info and totals

## How to Integrate

### Step 1: Load New HTML Files
In your main `index.php`, include the new HTML files:

```php
<?php
// Load the separate HTML files
$adminHTML = file_get_contents(__DIR__ . '/Asset/admin.html');
$buyerHTML = file_get_contents(__DIR__ . '/Asset/buyer.html');
$farmerHTML = file_get_contents(__DIR__ . '/Asset/farmer.html');
?>

<!-- In your body section, include these files -->
<?php echo $adminHTML; ?>
<?php echo $buyerHTML; ?>
<?php echo $farmerHTML; ?>
```

### Step 2: Load New JavaScript Files
Make sure these are included in your main HTML file:

```html
<script src="Asset/admin.js"></script>
<script src="Asset/buyer.js"></script>
<script src="Asset/farmer.js"></script>
```

### Step 3: Implement Backend API Endpoints
Add all the required endpoints listed above to `products.php`

Example template:
```php
if ($_GET['action'] === 'get_admin_dashboard_stats') {
    // Query database for stats
    // Return JSON with all required data
    echo json_encode(['success' => true, 'data' => $stats]);
}
```

### Step 4: Add Database Schema Updates (if needed)
Ensure your users table has:
- `id_photo` (varchar for photo path)
- `face_photo` or `store_photo` (varchar for profile photos)
- `role` (enum: admin, farmer, buyer)
- `status` (enum: pending, active, rejected, suspended)
- `created_at` (timestamp)
- Role-specific fields (farm_location, province, city, bio, store_name, etc.)

## Benefits of HTML Separation

✅ **Better Organization**: Each role has its own dedicated HTML file
✅ **Easy Debugging**: Easier to find and fix specific components
✅ **Maintainability**: Changes to admin panel don't affect buyer/farmer code
✅ **Scalability**: Easy to add new features to specific sections
✅ **Cleaner Code**: Separate concerns for better code structure
✅ **Team Collaboration**: Developers can work on different sections independently

## Admin Panel Highlights

The new admin panel is a complete platform management tool:

1. **Verification**: Approve/reject pending farmer and buyer applications with full details
2. **User Management**: See all platform users, filter by role and status
3. **Inventory**: Monitor all products, track low stock items
4. **Sales Tracking**: View all orders, calculate commission (5%)
5. **Analytics**: Platform-wide statistics and activity monitoring

## Testing Checklist

- [ ] Admin can access dashboard with 5 tabs
- [ ] Pending verification tab shows applicants
- [ ] User details modal displays correctly
- [ ] All users table loads with filters
- [ ] Products inventory displays stats
- [ ] Orders tab shows commission calculation
- [ ] Reports tab displays activity log
- [ ] Buyer profile page loads with orders
- [ ] Farmer dashboard shows all tabs
- [ ] Farmer orders filter by status works
- [ ] All modals close properly
- [ ] Responsive design on mobile

## Next Steps

1. Implement all required backend API endpoints
2. Test each endpoint with sample data
3. Verify all navigation between tabs works
4. Implement product add/edit forms
5. Add data export features (reports)
6. Implement real-time notifications
7. Add advanced search/filtering capabilities
