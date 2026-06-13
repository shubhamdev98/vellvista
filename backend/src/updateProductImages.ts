import { db } from './db';
import { products } from './schema';
import { eq } from 'drizzle-orm';

async function updateProductImages() {
  console.log('Updating product images...');

  const productUpdates = [
    { id: 1, image: '/product/beautinow-niche-perfume-k1X05CSCybE-unsplash.jpg' },
    { id: 2, image: '/product/filip-baotic-_3cLB_mvVTw-unsplash.jpg' },
    { id: 3, image: '/product/kelvin-lutan-5f4yovjJw4c-unsplash.jpg' },
    { id: 4, image: '/product/laurissi-Bxsl6rpbwfI-unsplash.jpg' },
    { id: 5, image: '/product/miska-sage-UpoUiGj-qg8-unsplash.jpg' },
    { id: 6, image: '/product/pavlo-talpa-MfGoZ-QoJFc-unsplash.jpg' },
    { id: 7, image: '/product/romy-ameryckx-NLz3Wy8Thac-unsplash.jpg' },
    { id: 8, image: '/product/zulian-firmansyah-rYcbOljwx10-unsplash.jpg' },
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
