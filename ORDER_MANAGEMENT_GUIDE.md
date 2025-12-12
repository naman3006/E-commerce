# Order Management System - Complete Guide

## Overview
This e-commerce platform now includes a comprehensive order management system that allows **Admin** and **Seller** users to view and manage product orders with complete customer information.

## Features Implemented

### 1. **Admin Order Management** (`/admin/orders`)
Admins have full access to all orders in the system with the following capabilities:

#### Features:
- **View All Orders**: Complete list of all orders from all customers
- **Customer Information Display**:
  - Customer name
  - Email address
  - Phone number
  - User ID
- **Order Details**:
  - Order ID
  - Order date
  - Number of items
  - Total amount
  - Payment status
  - Order status
  - Shipping address
- **Search & Filter**:
  - Search by Order ID, customer email, or customer name
  - Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled)
- **Order Statistics**:
  - Total orders count
  - Pending orders
  - Processing orders
  - Delivered orders
- **Order Management**:
  - Update order status directly from the table
  - View detailed order information in a modal
  - See all order items with product images
  - View order summary (subtotal, shipping, tax, discount)
  - Access customer notes and internal notes

#### Access:
- **Route**: `/admin/orders`
- **Navigation**: "Manage Orders" link in header (visible only to admins)
- **Role Required**: `admin`

### 2. **Seller Order Management** (`/seller/orders`)
Sellers can view orders that contain their products with the following capabilities:

#### Features:
- **View Relevant Orders**: Only orders containing seller's products
- **Customer Information Display**:
  - Customer name
  - Email address
  - Phone number
  - User ID
- **Seller-Specific Order Details**:
  - Highlights seller's products separately
  - Shows "My Products in This Order" section
  - Displays "Other Items in Order" from different sellers
  - Calculates seller's portion of the order total
- **Order Acceptance**:
  - Sellers can accept pending orders
  - Accepting changes order status to "processing"
  - Sends notification to customer
- **Search & Filter**:
  - Search by Order ID, customer email, or customer name
  - Filter by order status
- **Order Statistics**:
  - Total orders containing seller's products
  - Pending, processing, and delivered counts

#### Access:
- **Route**: `/seller/orders`
- **Navigation**: "My Orders" link in header (visible only to sellers)
- **Role Required**: `seller`

## Backend API Endpoints

### Existing Endpoints Used:

1. **GET `/orders`** (Admin only)
   - Returns all orders with populated user and product information
   - Includes customer details

2. **GET `/orders/seller`** (Seller only)
   - Returns orders containing seller's products
   - Filters by seller's product ownership

3. **GET `/orders/my`** (Customer)
   - Returns customer's own orders

4. **PATCH `/orders/:id/status`** (Admin only)
   - Updates order status
   - Sends notifications to customers

5. **PATCH `/orders/:id/accept`** (Seller only)
   - Seller accepts order for processing
   - Validates seller owns products in the order
   - Updates status to "processing"

## Database Schema

### Order Schema
```typescript
{
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId (ref: Product),
      quantity: number,
      price: number,
      productName: string,
      productImage: string
    }
  ],
  totalAmount: number,
  subtotal: number,
  discount: number,
  shippingCost: number,
  tax: number,
  paymentStatus: enum ['pending', 'paid', 'failed', 'refunded'],
  orderStatus: enum ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  shippingAddress: string,
  customerEmail: string,
  customerPhone: string,
  customerNotes: string,
  trackingNumber: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema (Relevant Fields)
```typescript
{
  sellerId: ObjectId (ref: User),
  title: string,
  price: number,
  categoryId: ObjectId (ref: Category),
  // ... other fields
}
```

## User Roles

### Admin
- Can view ALL orders from all customers
- Can update order status
- Can view complete customer information
- Access to `/admin/orders` and `/admin/dashboard`

### Seller
- Can view orders containing THEIR products only
- Can accept pending orders
- Can see which products in an order are theirs
- Access to `/seller/orders`

### Customer
- Can view their own orders
- Can place new orders
- Access to `/orders`

## File Structure

```
E-commerce/
├── backend/
│   └── src/
│       └── modules/
│           ├── orders/
│           │   ├── orders.controller.ts      # Order API endpoints
│           │   ├── orders.service.ts         # Order business logic
│           │   ├── schemas/
│           │   │   └── order.schema.ts       # Order database schema
│           │   └── dto/
│           │       ├── create-order.dto.ts
│           │       └── update-order-status.dto.ts
│           └── products/
│               └── schemas/
│                   └── product.schema.ts     # Product schema with sellerId
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── OrderManagement.jsx           # Admin order management page
        │   ├── SellerOrders.jsx              # Seller order management page
        │   ├── Orders.jsx                    # Customer orders page
        │   └── AdminDashboard.jsx            # Admin dashboard
        ├── components/
        │   ├── Layout/
        │   │   └── Layout.jsx                # Navigation with role-based links
        │   └── OrderCard/
        │       └── OrderCard.jsx             # Order display component
        ├── store/
        │   └── slices/
        │       └── ordersSlice.js            # Redux state management
        └── App.jsx                           # Route configuration
```

## How to Use

### For Admins:

1. **Login** as an admin user
2. Navigate to **"Manage Orders"** from the header
3. **Search/Filter** orders as needed
4. **Click "View"** on any order to see detailed information
5. **Update Status** using the dropdown in the table
6. View customer information including:
   - Name, email, phone
   - Shipping address
   - Order items and totals

### For Sellers:

1. **Login** as a seller user
2. Navigate to **"My Orders"** from the header
3. **View orders** containing your products
4. **Click "View"** to see order details
5. **Accept pending orders** by clicking "Accept" button
6. See which items in the order are yours (highlighted in blue)
7. Track your portion of the order total

### For Customers:

1. **Login** as a customer
2. Navigate to **"Orders"** from the header
3. View your order history
4. See order status and payment information

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered
                ↓
            cancelled
```

- **Pending**: Order placed, awaiting payment/confirmation
- **Confirmed**: Payment received, awaiting seller acceptance
- **Processing**: Seller accepted, preparing for shipment
- **Shipped**: Order dispatched with tracking
- **Delivered**: Order received by customer
- **Cancelled**: Order cancelled by admin or customer

## Payment Status Flow

```
pending → paid → (refunded if needed)
    ↓
  failed
```

## Security & Permissions

### Route Protection:
- All order management routes require authentication
- Role-based access control enforced on both frontend and backend
- Sellers can only access their own product orders
- Admins have full access to all orders

### Data Privacy:
- Customer information visible to admins and sellers (for fulfillment)
- Sellers only see orders containing their products
- User IDs and sensitive data properly protected

## Testing the System

### Test as Admin:
1. Create admin user (if not exists)
2. Login as admin
3. Navigate to `/admin/orders`
4. Verify you can see all orders
5. Test search and filter functionality
6. Update an order status
7. View order details modal

### Test as Seller:
1. Create seller user (if not exists)
2. Create products with this seller's ID
3. Place orders containing seller's products
4. Login as seller
5. Navigate to `/seller/orders`
6. Verify only relevant orders appear
7. Accept a pending order
8. View order details

### Test as Customer:
1. Create customer account
2. Place an order
3. Navigate to `/orders`
4. Verify order appears
5. Check order status

## Key Features Summary

✅ **Admin can view all orders with customer information**
✅ **Seller can view orders containing their products**
✅ **Customer information displayed (name, email, phone)**
✅ **Search and filter functionality**
✅ **Order status management**
✅ **Detailed order view with modal**
✅ **Order statistics dashboard**
✅ **Seller order acceptance workflow**
✅ **Role-based access control**
✅ **Real-time notifications on order updates**

## API Response Examples

### Admin Get All Orders:
```json
{
  "success": true,
  "data": [
    {
      "_id": "order123",
      "userId": {
        "_id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "productId": {
            "_id": "prod123",
            "title": "Product Name",
            "sellerId": "seller123"
          },
          "quantity": 2,
          "price": 29.99
        }
      ],
      "totalAmount": 59.98,
      "orderStatus": "pending",
      "paymentStatus": "paid",
      "customerEmail": "john@example.com",
      "customerPhone": "+1234567890",
      "shippingAddress": "123 Main St, City, State 12345",
      "createdAt": "2025-12-09T10:00:00Z"
    }
  ]
}
```

### Seller Get Orders:
```json
{
  "success": true,
  "data": [
    {
      "_id": "order123",
      "userId": {
        "_id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "productId": {
            "_id": "prod123",
            "title": "My Product",
            "sellerId": "currentSellerId"
          },
          "quantity": 1,
          "price": 49.99
        },
        {
          "productId": {
            "_id": "prod456",
            "title": "Other Seller Product",
            "sellerId": "otherSellerId"
          },
          "quantity": 1,
          "price": 29.99
        }
      ],
      "totalAmount": 79.98,
      "orderStatus": "pending"
    }
  ]
}
```

## Troubleshooting

### Orders not showing for seller:
- Verify products have correct `sellerId` field
- Check that orders contain products from this seller
- Ensure seller is logged in with correct role

### Customer information not displaying:
- Verify order has `userId` populated
- Check that `customerEmail` and `customerPhone` are saved during checkout
- Ensure backend populates user data in queries

### Cannot update order status:
- Verify user has admin role
- Check authentication token is valid
- Ensure order ID is correct

## Next Steps / Potential Enhancements

1. **Export Orders**: Add CSV/PDF export functionality
2. **Bulk Actions**: Select multiple orders for bulk status updates
3. **Advanced Filters**: Date range, amount range, customer filters
4. **Order Analytics**: Revenue charts, top products, customer insights
5. **Email Notifications**: Automated emails on status changes
6. **Shipping Integration**: Connect with shipping providers
7. **Return Management**: Handle returns and refunds
8. **Invoice Generation**: Automatic invoice creation
9. **Order Notes**: Add internal notes to orders
10. **Customer Communication**: In-app messaging with customers

---

**Last Updated**: December 9, 2025
**Version**: 1.0.0
