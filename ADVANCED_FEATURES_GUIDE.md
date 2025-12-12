# Advanced E-Commerce Features Implementation Guide

## 🎯 Overview
This guide covers the implementation of:
1. **Hierarchical Categories** (Categories with Subcategories)
2. **Email Notifications** (Gmail Integration)
3. **Order Management** with Email Notifications
4. **Role-Based Product & Order Management**

---

## 📦 Required Packages

### Backend
```bash
cd backend
npm install @nestjs-modules/mailer nodemailer handlebars
npm install --save-dev @types/nodemailer
```

### Environment Variables
Add to `backend/.env`:
```env
# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@ecommerce.com
MAIL_FROM_NAME=E-Commerce Store

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**Important for Gmail:**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an "App Password" at: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password) in `MAIL_PASSWORD`

---

## 🗂️ 1. Hierarchical Categories

### Features:
- Parent categories and unlimited subcategories
- SEO-friendly slugs
- Active/Inactive status
- Custom ordering
- Icons and images

### Backend Files Created:
- ✅ `categories/schemas/category.schema.ts` - Enhanced with parentId
- 📝 Need to update: `categories/categories.service.ts`
- 📝 Need to update: `categories/categories.controller.ts`

### Category Service Methods:
```typescript
// Get all categories with hierarchy
async findAllWithHierarchy()

// Get subcategories of a parent
async findSubcategories(parentId: string)

// Get category tree (nested structure)
async getCategoryTree()

// Get breadcrumb path
async getBreadcrumb(categoryId: string)
```

### API Endpoints:
```
GET  /categories              # All categories (flat)
GET  /categories/tree         # Hierarchical tree
GET  /categories/:id/children # Get subcategories
GET  /categories/:id/breadcrumb # Get breadcrumb path
POST /categories              # Create category (admin only)
PATCH /categories/:id         # Update category (admin only)
DELETE /categories/:id        # Delete category (admin only)
```

---

## 📧 2. Email Notification System

### Features:
- Order confirmation emails
- Order status update emails
- Welcome emails for new users
- Low stock alerts for admins
- New order notifications for admins

### Files Created:
- ✅ `mail/mail.module.ts` - Email module configuration
- ✅ `mail/mail.service.ts` - Email sending service
- ✅ `mail/templates/order-confirmation.hbs` - Order confirmation template
- ✅ `mail/templates/order-status-update.hbs` - Status update template
- ✅ `mail/templates/low-stock-alert.hbs` - Low stock alert template
- ✅ `mail/templates/new-order-admin.hbs` - Admin notification template

### Email Service Methods:
```typescript
// Customer emails
sendOrderConfirmation(email, orderData)
sendOrderStatusUpdate(email, orderData)
sendWelcomeEmail(email, name)
sendPasswordReset(email, resetToken)

// Admin emails
sendLowStockAlert(adminEmails, productData)
sendNewOrderNotification(adminEmails, orderData)
```

### Integration Points:

#### In Orders Service:
```typescript
// After creating an order
await this.mailService.sendOrderConfirmation(user.email, {
  orderId: order._id,
  customerName: user.name,
  items: order.items,
  total: order.total,
  shippingAddress: order.shippingAddress,
});

// Notify admins
const adminEmails = this.configService.get('ADMIN_EMAILS').split(',');
await this.mailService.sendNewOrderNotification(adminEmails, {
  orderId: order._id,
  customerName: user.name,
  total: order.total,
  itemCount: order.items.length,
});
```

#### In Products Service:
```typescript
// Check stock after order
if (product.stock < 10) {
  const adminEmails = this.configService.get('ADMIN_EMAILS').split(',');
  await this.mailService.sendLowStockAlert(adminEmails, {
    productName: product.title,
    sku: product.sku,
    currentStock: product.stock,
    threshold: 10,
  });
}
```

---

## 🛒 3. Enhanced Order Management

### Features:
- Order status tracking
- Email notifications on status changes
- Admin/Reseller order management
- Order filtering and search

### Order Statuses:
- `pending` - Order placed
- `confirmed` - Order confirmed
- `processing` - Being prepared
- `shipped` - On the way
- `delivered` - Completed
- `cancelled` - Cancelled

### API Endpoints:
```
GET  /orders/my               # Customer's orders
GET  /orders                  # All orders (admin/reseller)
GET  /orders/:id              # Single order
POST /orders                  # Create order
PATCH /orders/:id/status      # Update status (admin/reseller)
DELETE /orders/:id            # Cancel order
```

---

## 👥 4. Role-Based Access Control

### Roles:
- **Customer**: Browse, purchase, view own orders
- **Reseller**: Manage products, view assigned orders
- **Admin**: Full access to everything

### Permission Matrix:

| Feature | Customer | Reseller | Admin |
|---------|----------|----------|-------|
| Browse Products | ✅ | ✅ | ✅ |
| Purchase | ✅ | ✅ | ✅ |
| View Own Orders | ✅ | ✅ | ✅ |
| Manage Products | ❌ | ✅ | ✅ |
| View All Orders | ❌ | ✅ | ✅ |
| Manage Categories | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ✅ |

---

## 🎨 Frontend Components

### Category Management UI
```
/categories/manage
- Tree view of categories
- Drag & drop reordering
- Add/Edit/Delete categories
- Subcategory management
```

### Order Management UI
```
/orders/manage
- Order list with filters
- Status update interface
- Order details view
- Email notification triggers
```

---

## 🚀 Implementation Steps

### Step 1: Install Dependencies
```bash
cd backend
npm install @nestjs-modules/mailer nodemailer handlebars
```

### Step 2: Configure Environment
Add email configuration to `.env` file

### Step 3: Update App Module
```typescript
// app.module.ts
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    // ... other imports
    MailModule,
  ],
})
```

### Step 4: Update Orders Module
```typescript
// orders.module.ts
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    // ... other imports
    MailModule,
  ],
})
```

### Step 5: Inject Mail Service
```typescript
// orders.service.ts
import { MailService } from '../mail/mail.service';

constructor(
  // ... other dependencies
  private mailService: MailService,
) {}
```

### Step 6: Test Email Functionality
```bash
# Start backend
npm run start:dev

# Test order creation to trigger emails
```

---

## 📝 Testing Checklist

### Email Testing:
- [ ] Order confirmation email sent to customer
- [ ] Order status update email sent
- [ ] Admin receives new order notification
- [ ] Low stock alert sent to admins
- [ ] Welcome email on registration

### Category Testing:
- [ ] Create parent category
- [ ] Create subcategory
- [ ] View category tree
- [ ] Filter products by category
- [ ] Navigate breadcrumb

### Order Management:
- [ ] Create order as customer
- [ ] View order in admin panel
- [ ] Update order status
- [ ] Receive email on status change
- [ ] Filter orders by status

---

## 🔧 Troubleshooting

### Email Not Sending:
1. Check Gmail App Password is correct
2. Verify 2FA is enabled on Gmail
3. Check firewall/network allows SMTP port 587
4. Review backend logs for errors

### Categories Not Showing:
1. Check MongoDB connection
2. Verify category schema migration
3. Check isActive status

### Permission Denied:
1. Verify user role in JWT token
2. Check RolesGuard implementation
3. Verify route decorators

---

## 📊 Database Indexes

Ensure these indexes exist for performance:

```typescript
// Categories
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ name: 'text' });

// Orders
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Products
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ title: 'text' });
```

---

## 🎯 Next Steps

1. **Implement Category Service** with hierarchy methods
2. **Update Orders Service** to send emails
3. **Create Category Management UI**
4. **Create Order Management UI**
5. **Add Email Preferences** for users
6. **Implement Order Tracking** page
7. **Add Analytics Dashboard**

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Handlebars Templates](https://handlebarsjs.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [NestJS Mailer Module](https://nest-modules.github.io/mailer/)

---

**Your e-commerce platform now has enterprise-level features!** 🎉

For implementation assistance, refer to the created files and follow the steps above.
