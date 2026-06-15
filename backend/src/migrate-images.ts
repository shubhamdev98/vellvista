import { db } from './db';
import { products } from './schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrate() {
  console.log('Starting product images migration to Cloudinary...');
  
  try {
    const allProducts = await db.select().from(products);
    console.log(`Found ${allProducts.length} products in database.`);

    for (const product of allProducts) {
      if (product.image && (product.image.startsWith('/product/') || product.image.startsWith('product/'))) {
        const relativePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
        const localPath = path.join(__dirname, '../public', relativePath);
        
        if (fs.existsSync(localPath)) {
          console.log(`Uploading image for product ${product.id} (${product.name}) from ${localPath}...`);
          const uploadResult = await cloudinary.uploader.upload(localPath, {
            folder: 'vellvista/product',
          });
          const cloudinaryUrl = uploadResult.secure_url;
          console.log(`Uploaded successfully! Cloudinary URL: ${cloudinaryUrl}`);

          await db
            .update(products)
            .set({ image: cloudinaryUrl })
            .where(eq(products.id, product.id));
          console.log(`Updated database record for product ${product.id}.`);
        } else {
          console.warn(`Local file not found for product ${product.id} at path: ${localPath}`);
        }
      } else {
        console.log(`Product ${product.id} already has external/Cloudinary URL: ${product.image}`);
      }
    }
    console.log('Migration finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
