const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/ecommerce-new-features';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const ProductSchema = new mongoose.Schema({
    images: [String],
    thumbnail: String,
    variants: [{
        image: String,
        name: String,
        options: [String]
    }]
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

const LOCLAHOST_PREFIX = 'http://localhost:3000/';

async function migrate() {
    try {
        const products = await Product.find({
            $or: [
                { images: { $regex: LOCLAHOST_PREFIX } },
                { thumbnail: { $regex: LOCLAHOST_PREFIX } },
                { "variants.image": { $regex: LOCLAHOST_PREFIX } }
            ]
        });

        console.log(`Found ${products.length} products to update.`);

        for (const product of products) {
            let modified = false;

            // Fix images array
            if (product.images && product.images.length > 0) {
                const originalImages = [...product.images];
                product.images = product.images.map(img => {
                    if (img && img.startsWith(LOCLAHOST_PREFIX)) {
                        return img.replace(LOCLAHOST_PREFIX, '');
                    }
                    return img;
                });

                if (JSON.stringify(originalImages) !== JSON.stringify(product.images)) {
                    modified = true;
                }
            }

            // Fix thumbnail
            if (product.thumbnail && product.thumbnail.startsWith(LOCLAHOST_PREFIX)) {
                product.thumbnail = product.thumbnail.replace(LOCLAHOST_PREFIX, '');
                modified = true;
            }

            // Fix variants
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(variant => {
                    if (variant.image && variant.image.startsWith(LOCLAHOST_PREFIX)) {
                        variant.image = variant.image.replace(LOCLAHOST_PREFIX, '');
                        modified = true;
                    }
                });
            }

            if (modified) {
                await product.save();
                console.log(`Updated product: ${product._id}`);
            }
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

migrate();
