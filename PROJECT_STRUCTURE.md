# E-Commerce Platform - Complete Folder and File Structure

## Project Overview
This is a full-stack e-commerce platform with **NestJS** backend and **React** frontend, featuring role-based access control for Admin, Seller, and Customer users.

---

## Root Directory Structure

```
E-commerce/
├── backend/                          # NestJS backend application
├── frontend/                         # React frontend application
├── ADVANCED_ENHANCEMENTS_PLAN.md     # Advanced features planning document
├── ADVANCED_FEATURES_GUIDE.md        # Guide for advanced features
├── CATEGORY_VALIDATION_IMPLEMENTATION.md
├── HOW_TO_ADD_PRODUCTS.md           # Product creation guide
├── IMAGE_UPLOAD_GUIDE.md            # Image upload documentation
├── IMPLEMENTATION_GUIDE.md          # General implementation guide
├── IMPLEMENTATION_SUMMARY.md        # Implementation summary
├── ORDER_MANAGEMENT_GUIDE.md        # ✨ NEW: Order management documentation
├── QUICK_START.md                   # Quick start guide
└── TESTING_GUIDE_CATEGORY_VALIDATION.md
```

---

## Backend Structure (`/backend`)

### Main Configuration Files
```
backend/
├── package.json                     # Dependencies and scripts
├── package-lock.json
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.build.json
├── nest-cli.json                    # NestJS CLI configuration
├── eslint.config.mjs                # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── .env                             # Environment variables
├── .env.example                     # Environment variables template
├── .gitignore
├── README.md
├── create-user.js                   # User creation script
├── dist/                            # Compiled output
├── node_modules/                    # Dependencies
├── test/                            # Test files
└── uploads/                         # Uploaded files storage
```

### Source Code (`/backend/src`)
```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── app.controller.ts                # Root controller
├── app.service.ts                   # Root service
├── app.controller.spec.ts           # Root controller tests
├── common/                          # Shared utilities
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   └── interfaces/
│       └── user.interface.ts
├── config/                          # Configuration modules
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── mail.config.ts
├── utils/                           # Utility functions
│   └── helpers.ts
└── modules/                         # Feature modules
```

### Backend Modules (`/backend/src/modules`)

#### 1. **Address Module**
```
modules/address/
├── address.controller.ts
├── address.service.ts
├── address.module.ts
├── dto/
│   ├── create-address.dto.ts
│   └── update-address.dto.ts
└── schemas/
    └── address.schema.ts
```

#### 2. **Admin Module**
```
modules/admin/
├── admin.controller.ts
├── admin.service.ts
├── admin.module.ts
└── dto/
    └── admin-stats.dto.ts
```

#### 3. **Analytics Module**
```
modules/analytics/
├── analytics.controller.ts
├── analytics.service.ts
└── analytics.module.ts
```

#### 4. **Auth Module**
```
modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── update-profile.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── local-auth.guard.ts
│   └── roles.guard.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
└── schemas/
    └── user.schema.ts
```

#### 5. **Cart Module**
```
modules/cart/
├── cart.controller.ts
├── cart.service.ts
├── cart.module.ts
├── dto/
│   ├── add-to-cart.dto.ts
│   └── update-cart-item.dto.ts
└── schemas/
    └── cart.schema.ts
```

#### 6. **Categories Module**
```
modules/categories/
├── categories.controller.ts
├── categories.service.ts
├── categories.module.ts
├── dto/
│   ├── create-category.dto.ts
│   └── update-category.dto.ts
└── schemas/
    └── category.schema.ts
```

#### 7. **Coupons Module** ✨ NEW
```
modules/coupons/
├── coupons.controller.ts
├── coupons.service.ts
├── coupons.module.ts
├── dto/
│   ├── create-coupon.dto.ts
│   ├── update-coupon.dto.ts
│   └── validate-coupon.dto.ts
└── schemas/
    └── coupon.schema.ts
```

#### 8. **Mail Module**
```
modules/mail/
├── mail.service.ts
├── mail.module.ts
└── templates/
    ├── order-confirmation.hbs
    └── welcome.hbs
```

#### 9. **Notifications Module**
```
modules/notifications/
├── notification.gateway.ts
├── notifications.controller.ts
├── notifications.service.ts
├── notifications.module.ts
├── dto/
│   └── create-notification.dto.ts
└── schemas/
    └── notification.schema.ts
```

#### 10. **Orders Module** ✨ ENHANCED
```
modules/orders/
├── orders.controller.ts             # ✅ Admin & Seller endpoints
├── orders.service.ts                # ✅ Order management logic
├── orders.module.ts
├── orders.listener.ts               # Event listeners
├── dto/
│   ├── create-order.dto.ts
│   └── update-order-status.dto.ts
├── listeners/
│   └── order-created.listener.ts
└── schemas/
    └── order.schema.ts              # ✅ Customer info fields
```

#### 11. **Payments Module**
```
modules/payments/
├── payments.controller.ts
├── payments.service.ts
├── payments.module.ts
├── dto/
│   ├── initiate-payment.dto.ts
│   └── verify-payment.dto.ts
└── schemas/
    └── payment.schema.ts
```

#### 12. **Products Module**
```
modules/products/
├── products.controller.ts
├── products.service.ts
├── products.module.ts
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
└── schemas/
    └── product.schema.ts            # ✅ sellerId field
```

#### 13. **Reviews Module**
```
modules/reviews/
├── reviews.controller.ts
├── reviews.service.ts
├── reviews.module.ts
├── dto/
│   └── create-review.dto.ts
└── schemas/
    └── review.schema.ts
```

#### 14. **Upload Module**
```
modules/upload/
├── upload.controller.ts
├── upload.service.ts
└── upload.module.ts
```

#### 15. **Users Module**
```
modules/users/
├── users.controller.ts
├── users.service.ts
├── users.module.ts
└── dto/
    └── update-user.dto.ts
```

#### 16. **Wishlist Module**
```
modules/wishlist/
├── wishlist.controller.ts
├── wishlist.service.ts
├── wishlist.module.ts
└── schemas/
    └── wishlist.schema.ts
```

---

## Frontend Structure (`/frontend`)

### Main Configuration Files
```
frontend/
├── package.json                     # Dependencies and scripts
├── package-lock.json
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── .env                             # Environment variables
├── .env.example                     # Environment variables template
├── .gitignore
├── README.md
├── node_modules/                    # Dependencies
└── public/                          # Static assets
```

### Source Code (`/frontend/src`)
```
src/
├── main.jsx                         # Application entry point
├── App.jsx                          # ✅ Route configuration with role-based routes
├── App.css                          # Application styles
├── index.css                        # Global styles
├── assets/                          # Static assets
│   └── react.svg
├── components/                      # React components
├── contexts/                        # React contexts
├── hooks/                           # Custom hooks
├── pages/                           # Page components
├── redux/                           # Redux setup (alternative)
├── store/                           # Redux store and slices
└── utils/                           # Utility functions
```

### Components (`/frontend/src/components`)
```
components/
├── ProtectedRoute.jsx               # Route protection component
├── AddressCard/
│   └── AddressCard.jsx
├── AnalyticsDashboard/              # ✨ NEW
│   ├── AnalyticsDashboard.jsx
│   └── AnalyticsDashboard.css
├── CartItem/
│   └── CartItem.jsx
├── CouponManagement/                # ✨ NEW
│   ├── CouponManagement.jsx
│   └── CouponManagement.css
├── DarkModeToggle/                  # ✨ NEW
│   ├── DarkModeToggle.jsx
│   └── DarkModeToggle.css
├── ImageUpload/
│   └── ImageUpload.jsx
├── Layout/
│   └── Layout.jsx                   # ✅ Navigation with role-based links
├── NotificationItem/
│   └── NotificationItem.jsx
├── OrderCard/
│   └── OrderCard.jsx
├── ProductCard/
│   └── ProductCard.jsx
├── ProductForm/
│   └── ProductForm.jsx
├── ProductList/
│   └── ProductList.jsx
├── ReviewCard/
│   └── ReviewCard.jsx
├── account/
│   ├── OrderHistory.jsx
│   ├── ProfileSettings.jsx
│   └── WishlistView.jsx
├── admin/
│   ├── Dashboard.jsx
│   ├── OrdersGrid.jsx
│   └── ProductsGrid.jsx
├── auth/
│   ├── LoginForm.jsx
│   └── RegisterForm.jsx
└── common/
    ├── Button.jsx
    └── Input.jsx
```

### Pages (`/frontend/src/pages`)
```
pages/
├── Account.jsx
├── Addresses.jsx
├── Admin.jsx
├── AdminDashboard.jsx               # Admin dashboard
├── Cart.jsx
├── Checkout.jsx
├── Home.jsx
├── Login.jsx
├── Notifications.jsx
├── OrderManagement.jsx              # ✨ NEW: Admin order management
├── Orders.jsx                       # Customer orders
├── ProductDetail.jsx
├── ProductManagement.jsx            # Admin/Seller product management
├── Products.jsx
├── Profile.jsx
├── Register.jsx
├── SellerOrders.jsx                 # ✨ NEW: Seller order management
└── Wishlist.jsx
```

### Redux Store (`/frontend/src/store`)
```
store/
├── index.js                         # Store configuration
├── api/
│   └── api.js                       # Axios instance
└── slices/
    ├── adminSlice.js
    ├── authSlice.js
    ├── cartSlice.js
    ├── categoriesSlice.js
    ├── notificationsSlice.js
    ├── ordersSlice.js               # ✅ Admin & Seller order actions
    ├── paymentsSlice.js
    ├── productsSlice.js
    ├── reviewsSlice.js
    ├── usersSlice.js
    └── wishlistSlice.js
```

---

## Key Files for Order Management System

### Backend Files:
1. **`/backend/src/modules/orders/orders.controller.ts`**
   - Admin: `GET /orders` - Get all orders
   - Seller: `GET /orders/seller` - Get seller's orders
   - Seller: `PATCH /orders/:id/accept` - Accept order
   - Admin: `PATCH /orders/:id/status` - Update order status

2. **`/backend/src/modules/orders/orders.service.ts`**
   - `findAll()` - Get all orders with user info
   - `findBySeller(sellerId)` - Get orders by seller
   - `acceptBySeller(orderId, sellerId)` - Seller accepts order
   - `updateStatus(orderId, status)` - Update order status

3. **`/backend/src/modules/orders/schemas/order.schema.ts`**
   - Customer information fields
   - Order items with product references
   - Payment and order status

### Frontend Files:
1. **`/frontend/src/pages/OrderManagement.jsx`** ✨ NEW
   - Admin order management interface
   - Customer information display
   - Search and filter functionality
   - Order status updates

2. **`/frontend/src/pages/SellerOrders.jsx`** ✨ NEW
   - Seller order management interface
   - Highlights seller's products
   - Order acceptance functionality
   - Customer information display

3. **`/frontend/src/App.jsx`** ✅ UPDATED
   - Route: `/admin/orders` for admin
   - Route: `/seller/orders` for seller

4. **`/frontend/src/components/Layout/Layout.jsx`** ✅ UPDATED
   - Navigation links for admin and seller
   - Role-based menu items

5. **`/frontend/src/store/slices/ordersSlice.js`** ✅ EXISTING
   - `findAllOrders()` - Admin action
   - `findSellerOrders()` - Seller action
   - `updateOrderStatus()` - Admin action

---

## User Roles and Access

### Admin (`role: 'admin'`)
**Access to:**
- `/admin/dashboard` - Admin dashboard
- `/admin/orders` - Order management ✨ NEW
- `/products/manage` - Product management
- All customer features

**Capabilities:**
- View all orders with customer information
- Update order status
- Manage all products
- View analytics
- Manage users

### Seller (`role: 'seller'`)
**Access to:**
- `/seller/orders` - Seller orders ✨ NEW
- `/products/manage` - Own product management
- All customer features

**Capabilities:**
- View orders containing their products
- Accept pending orders
- Manage own products
- View customer information for orders

### Customer (`role: 'customer'` or no role)
**Access to:**
- `/` - Home
- `/products` - Product listing
- `/products/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/orders` - Own orders
- `/profile` - Profile management
- `/wishlist` - Wishlist
- `/notifications` - Notifications

---

## Environment Variables

### Backend (`.env`)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
DATABASE_NAME=ecommerce

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@ecommerce.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Database Collections

1. **users** - User accounts (admin, seller, customer)
2. **products** - Product catalog with sellerId
3. **categories** - Product categories
4. **orders** - Orders with customer information ✅
5. **carts** - Shopping carts
6. **wishlists** - User wishlists
7. **reviews** - Product reviews
8. **addresses** - User addresses
9. **notifications** - User notifications
10. **payments** - Payment records
11. **coupons** - Discount coupons ✨

---

## API Routes Summary

### Orders API
```
GET    /api/orders              # Admin: Get all orders
GET    /api/orders/my           # Customer: Get own orders
GET    /api/orders/seller       # Seller: Get seller's orders
GET    /api/orders/:id          # Get single order
POST   /api/orders              # Create new order
PATCH  /api/orders/:id/status   # Admin: Update order status
PATCH  /api/orders/:id/accept   # Seller: Accept order
```

### Products API
```
GET    /api/products            # Get all products
GET    /api/products/:id        # Get single product
POST   /api/products            # Create product (admin/seller)
PATCH  /api/products/:id        # Update product (admin/seller)
DELETE /api/products/:id        # Delete product (admin/seller)
```

### Auth API
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login
GET    /api/auth/profile        # Get current user profile
PATCH  /api/auth/profile        # Update profile
```

---

## Scripts

### Backend
```bash
npm run start          # Start in production mode
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # Run ESLint
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

---

## Recent Changes (Order Management System)

### ✨ New Files Created:
1. `/frontend/src/pages/OrderManagement.jsx` - Admin order management
2. `/frontend/src/pages/SellerOrders.jsx` - Seller order management
3. `/ORDER_MANAGEMENT_GUIDE.md` - Complete documentation

### ✅ Updated Files:
1. `/frontend/src/App.jsx` - Added new routes
2. `/frontend/src/components/Layout/Layout.jsx` - Added navigation links

### 📋 Existing Files Used:
1. `/backend/src/modules/orders/orders.controller.ts` - Already had endpoints
2. `/backend/src/modules/orders/orders.service.ts` - Already had logic
3. `/frontend/src/store/slices/ordersSlice.js` - Already had actions

---

## Documentation Files

1. **ORDER_MANAGEMENT_GUIDE.md** ✨ NEW - Complete order management documentation
2. **HOW_TO_ADD_PRODUCTS.md** - Product creation guide
3. **IMAGE_UPLOAD_GUIDE.md** - Image upload documentation
4. **ADVANCED_FEATURES_GUIDE.md** - Advanced features guide
5. **IMPLEMENTATION_GUIDE.md** - General implementation guide
6. **QUICK_START.md** - Quick start guide

---

**Last Updated**: December 9, 2025
**Version**: 1.0.0
