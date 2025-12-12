# Advanced Image Upload System with Multer

## 🎯 Overview
Professional-grade image upload system with:
- **Drag & Drop** interface
- **Multiple image uploads** (up to 10 images)
- **Automatic optimization** and resizing
- **Thumbnail generation**
- **Progress indicators**
- **Image preview** and management
- **File validation** (type, size)

---

## 📦 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install multer @nestjs/platform-express sharp
npm install --save-dev @types/multer
```

### 2. Create Upload Directory
```bash
mkdir -p uploads/products
```

### 3. Add to .gitignore
```
# Uploads
uploads/
```

### 4. Update main.ts to Serve Static Files
```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // ... rest of configuration
}
```

### 5. Update app.module.ts
```typescript
// backend/src/app.module.ts
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    // ... other imports
    UploadModule,
  ],
})
export class AppModule {}
```

---

## 🎨 Frontend Setup

### 1. Update ProductForm Component

Replace the images section in `ProductForm.jsx`:

```javascript
import ImageUpload from '../ImageUpload/ImageUpload';

// In the form, replace the images section with:
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
    Product Images
  </h3>
  
  <ImageUpload
    onImagesUploaded={(images) => {
      setFormData(prev => ({
        ...prev,
        images: images.map(img => img.url),
        thumbnail: images[0]?.url || '',
      }));
    }}
    maxImages={10}
    existingImages={formData.images.map(url => ({ url }))}
  />
</div>
```

---

## 🚀 API Endpoints

### Upload Single Image
```
POST /upload/product-image
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  image: File

Response:
{
  "success": true,
  "image": "http://localhost:3000/uploads/products/image-1234567890.jpg",
  "thumbnail": "http://localhost:3000/uploads/products/image-1234567890-thumb.jpg"
}
```

### Upload Multiple Images
```
POST /upload/product-images
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  images: File[]

Response:
{
  "success": true,
  "images": ["url1", "url2", ...],
  "thumbnails": ["thumb1", "thumb2", ...],
  "count": 3
}
```

### Delete Images
```
DELETE /upload/product-images
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "imageUrls": ["url1", "url2"]
}

Response:
{
  "success": true,
  "message": "Images deleted successfully"
}
```

---

## ✨ Features

### Image Optimization
- **Automatic resizing** to 1200px width (maintains aspect ratio)
- **Quality compression** to 85% (configurable)
- **Format conversion** to JPEG for consistency
- **Thumbnail generation** at 200x200px

### File Validation
- **Allowed formats**: JPG, JPEG, PNG, GIF, WEBP
- **Max file size**: 5MB per image
- **Max images**: 10 per product (configurable)

### User Experience
- **Drag & drop** files directly
- **Click to browse** traditional upload
- **Real-time preview** while uploading
- **Progress indicators** for uploads
- **Image management** (reorder, delete)
- **Visual feedback** for drag state

---

## 🎯 Usage Example

### Creating a Product with Images

1. **Navigate to Product Management**
   ```
   http://localhost:5173/products/manage
   ```

2. **Click "Add New Product"**

3. **Fill in Product Details**

4. **Upload Images**:
   - Drag & drop images onto the upload area
   - OR click to browse and select files
   - First image becomes the main product image
   - Up to 10 images total

5. **Submit Form**
   - Images are automatically included in product data
   - Thumbnail is set to first image

---

## 🔧 Configuration Options

### Adjust Upload Limits

```typescript
// upload.module.ts
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 20, // Max 20 files
}
```

### Change Image Quality

```typescript
// upload.service.ts
async optimizeImage(filePath: string) {
  await sharp(filePath)
    .resize(1600) // Larger size
    .jpeg({ quality: 90 }) // Higher quality
    .toFile(optimizedPath);
}
```

### Custom Thumbnail Size

```typescript
// upload.service.ts
async createThumbnail(filePath: string) {
  await sharp(filePath)
    .resize(300, 300) // Larger thumbnails
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
}
```

---

## 🌐 Cloud Storage Integration (Optional)

### AWS S3 Setup

```bash
npm install @aws-sdk/client-s3 multer-s3
```

```typescript
// upload.module.ts
import { S3Client } from '@aws-sdk/client-s3';
import * as multerS3 from 'multer-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

MulterModule.register({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `products/${Date.now()}-${file.originalname}`);
    },
  }),
});
```

### Cloudinary Setup

```bash
npm install cloudinary multer-storage-cloudinary
```

```typescript
// upload.module.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'gif', 'webp'],
  },
});
```

---

## 🐛 Troubleshooting

### Images Not Uploading
1. Check upload directory exists and has write permissions
2. Verify file size is under 5MB
3. Check file format is supported
4. Verify authentication token is valid

### Images Not Displaying
1. Check static file serving is configured in main.ts
2. Verify BASE_URL in .env matches your backend URL
3. Check CORS settings allow image requests

### Sharp Installation Issues
```bash
# If Sharp fails to install
npm rebuild sharp

# Or install with specific platform
npm install --platform=linux --arch=x64 sharp
```

---

## 📊 Performance Tips

1. **Use WebP format** for better compression
2. **Lazy load images** on product pages
3. **Implement CDN** for production
4. **Cache thumbnails** aggressively
5. **Use responsive images** with srcset

---

## 🔐 Security Considerations

1. **Validate file types** on both client and server
2. **Limit file sizes** to prevent abuse
3. **Scan for malware** in production
4. **Use signed URLs** for private images
5. **Implement rate limiting** on upload endpoints

---

## 📝 Complete Integration Checklist

- [ ] Install Multer and Sharp packages
- [ ] Create uploads directory
- [ ] Update main.ts for static file serving
- [ ] Add UploadModule to app.module.ts
- [ ] Update ProductForm to use ImageUpload component
- [ ] Test single image upload
- [ ] Test multiple image upload
- [ ] Test image deletion
- [ ] Test drag & drop functionality
- [ ] Verify image optimization works
- [ ] Check thumbnail generation
- [ ] Test with different image formats
- [ ] Verify file size validation
- [ ] Test on mobile devices

---

## 🎉 You're Done!

Your e-commerce platform now has a professional image upload system!

**Test it out:**
1. Go to `/products/manage`
2. Click "Add New Product"
3. Drag & drop some images
4. Watch them upload and optimize automatically
5. Create your product with beautiful images!

---

**Next Steps:**
- Add image cropping functionality
- Implement image reordering (drag & drop)
- Add bulk image upload
- Integrate with cloud storage (S3/Cloudinary)
- Add watermarking for product images
