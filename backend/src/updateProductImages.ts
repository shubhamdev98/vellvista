import { db } from './db';
import { products } from './schema';
import { eq } from 'drizzle-orm';

async function updateProductImages() {
  console.log('Updating product images...');

  const productUpdates = [
    { id: 1, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg' },
    { id: 2, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544138/vellvista/product/vnqu2pvfpyhqdzl7bevh.jpg' },
    { id: 3, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544160/vellvista/product/wfwrpm4pinxikehslkd7.jpg' },
    { id: 4, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544142/vellvista/product/wjdiftninfppxofwj4gs.jpg' },
    { id: 5, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544146/vellvista/product/bfu7aebv60l4ont7usbm.jpg' },
    { id: 6, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544149/vellvista/product/zzm6qrhh6v4w6qgnowyy.jpg' },
    { id: 7, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544150/vellvista/product/jzjc31b2eq1eklvtgdyy.jpg' },
    { id: 8, image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544152/vellvista/product/jfumqqqjlast4avarssf.jpg' },
  ];

  for (const update of productUpdates) {
    await db.update(products)
      .set({ image: update.image })
      .where(eq(products.id, update.id));
    console.log(`Updated product ${update.id}: ${update.image}`);
  }

  console.log('Product images updated successfully!');
  process.exit(0);
}

updateProductImages().catch((error) => {
  console.error('Error updating product images:', error);
  process.exit(1);
});
