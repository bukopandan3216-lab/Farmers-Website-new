# TheFarmersWebsite - Setup & Connection Guide

## Project Structure

```
TheFarmersWebsite/
├── index.php                 # Main frontend (PHP template with HTML)
├── auth.php                  # Authentication API (login/register/logout)
├── products.php              # Products API (CRUD operations)
├── config.php                # Database config & helper functions
├── database.sql              # Database schema
└── Asset/
    ├── script.js             # Frontend JavaScript (API calls)
    ├── styles.css            # Styling
    └── index - Copy.html     # Old file (can be deleted)
```

## How Files Are Connected

### 1. **Database Layer** (config.php)
- `config.php`: Contains database connection settings
- `database.sql`: Schema for users, products, orders, etc.

**Setup:**
1. Create a MySQL database named `farmdirect`
2. Import `database.sql` to create tables
3. Update `config.php` with your database credentials

### 2. **Backend APIs** (auth.php & products.php)
- `auth.php`: Handles login/register/logout
  - `POST /auth.php?action=login` - User login
  - `POST /auth.php?action=register` - User registration
  - `GET /auth.php?action=logout` - User logout

- `products.php`: Manages products
  - `GET /products.php?action=get_products` - Fetch all products
  - `GET /products.php?action=get_product?id=1` - Fetch single product
  - `POST /products.php?action=add_product` - Add new product (farmers only)

### 3. **Frontend** (index.php + Asset/script.js)
- `index.php`: Main HTML page with PHP session management
- `script.js`: Fetches data from APIs and handles UI interactions
- `styles.css`: Complete responsive styling

## Feature Connections

### Login Flow
1. User fills form on index.php
2. JavaScript calls `auth.php?action=login`
3. PHP validates credentials and creates session
4. User is redirected based on role (buyer/farmer/admin)

### Product Display
1. Page loads, JavaScript calls `products.php?action=get_products`
2. API fetches from database and returns JSON
3. JavaScript renders product cards dynamically

### Shopping Cart
1. Products have "Add to Cart" buttons
2. JavaScript stores cart in `localStorage`
3. Cart persists across page refreshes
4. Total updates in real-time

### Search & Filter
1. Search input triggers `handleSearch()`
2. Category dropdown calls `filterByCategory()`
3. Both call API with parameters
4. Results update without page reload

## Database Tables

### users
- Base table for all user types
- Fields: username, email, password, role, full_name, status

### farmer_profiles
- Extended farmer data
- Fields: store_name, store_photo, farm_location, gcash_number, etc.

### buyer_profiles
- Extended buyer data
- Fields: delivery_address, city, province, etc.

### products
- Product listings by farmers
- Fields: name, description, category, price, stock_qty, harvest_date

### orders
- Order records between buyers and farmers
- Tracks payment and delivery

## Installation Steps

### 1. Database Setup
```bash
# Create database and import schema
mysql -u root -p farmdirect < database.sql
```

### 2. Update config.php
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'farmdirect');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
define('SITE_URL', 'http://localhost/farmdirect');
```

### 3. File Permissions
```bash
# Create uploads directory
mkdir uploads/
chmod 755 uploads/
```

### 4. Access Application
- Open: `http://localhost/farmdirect/index.php`
- Or: `http://localhost/farmdirect/` (if .htaccess configured)

## API Response Format

All APIs return JSON in this format:
```json
{
  "success": true,
  "message": "Operation message",
  "products": [...],  // or other data fields
  "data": {
    "redirect": "index.php"
  }
}
```

## Frontend-Backend Communication

### Example: Fetching Products
```javascript
// Frontend (script.js)
fetch('products.php?action=get_products?category=Vegetables')
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      // Render products from data.products
    }
  });

// Backend (products.php)
case 'get_products':
  $stmt = db()->prepare("SELECT * FROM products WHERE category=?");
  $stmt->execute(['Vegetables']);
  jsonResponse(true, 'OK', ['products' => $stmt->fetchAll()]);
```

## Key Functions

### config.php
- `db()`: Get PDO database connection
- `isLoggedIn()`: Check if user is authenticated
- `currentUser()`: Get current user data
- `sanitize()`: Clean user input
- `uploadFile()`: Handle file uploads
- `jsonResponse()`: Send JSON API responses

### script.js
- `fetchProducts()`: Get products from API
- `handleLogin()`: Submit login form
- `handleRegister()`: Submit registration form
- `addToCart()`: Add item to cart
- `showPage()`: Switch between pages
- `showToast()`: Display notifications

## Testing

### Test Login
1. Register new user: username=test, password=Test@1234
2. Login with same credentials
3. Verify session is created

### Test Products
1. Ensure products exist in database
2. Navigate to Shop page
3. Test search and filter functionality

### Test Cart
1. Add products to cart
2. Verify cart count increases
3. Refresh page - cart should persist (localStorage)

## Common Issues

### Database Connection Failed
- Check database server is running
- Verify credentials in config.php
- Ensure database exists: `farmdirect`

### Products Not Loading
- Check farmer_profiles table has related farmer
- Verify product is_active = 1 and stock_qty > 0

### Login Not Working
- Confirm user exists in database
- Check password hashing matches PASSWORD_DEFAULT

### Images Not Displaying
- Verify uploads/ directory exists and is writable
- Check file permissions (755)

## Next Steps

1. **Add farmer dashboard** - Allow farmers to list products
2. **Add order management** - Process orders and payments
3. **Add admin panel** - Approve users, manage site
4. **Add reviews/ratings** - Customer feedback
5. **Add notifications** - Real-time updates
6. **Mobile optimization** - Improve responsive design

## Security Notes

- Always use prepared statements (done ✓)
- Always sanitize user input (done ✓)
- Hash passwords with bcrypt (done ✓)
- Use HTTPS in production
- Never commit database credentials
- Validate file uploads server-side

---

Last Updated: May 2, 2026
