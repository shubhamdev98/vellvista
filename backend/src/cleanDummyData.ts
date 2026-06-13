import { db } from './db';
import { user, reviews, addresses, wishlist, shoppingCart, subscribers, orders } from './schema';
import { eq, like } from 'drizzle-orm';

async function clean() {
  console.log('Cleaning dummy data from the database...');

  try {
    // 1. Delete subscribers with @example.com
    const deletedSubscribers = await db.delete(subscribers)
      .where(like(subscribers.email, '%@example.com'))
      .returning();
    console.log(`Deleted ${deletedSubscribers.length} dummy subscribers.`);

    // 2. Find all user IDs ending in @example.com or with mock emails
    const dummyUsers = await db.select()
      .from(user)
      .where(like(user.email, '%@example.com'));

    const dummyUserIds = dummyUsers.map(u => u.id);
    console.log(`Found ${dummyUserIds.length} dummy users:`, dummyUsers.map(u => u.email));

    if (dummyUserIds.length > 0) {
      // 3. Delete related reviews, wishlist, cart, addresses
      for (const userId of dummyUserIds) {
        await db.delete(reviews).where(eq(reviews.userId, userId));
        await db.delete(wishlist).where(eq(wishlist.userId, userId));
        await db.delete(shoppingCart).where(eq(shoppingCart.userId, userId));
        await db.delete(addresses).where(eq(addresses.userId, userId));
      }
      console.log('Cleaned reviews, wishlist, cart items, and addresses for dummy users.');

      // 4. Delete the dummy users themselves (which cascade deletes sessions/accounts)
      for (const userId of dummyUserIds) {
        await db.delete(user).where(eq(user.id, userId));
      }
      console.log('Deleted dummy users from user table.');
    }

    // 5. Delete any dummy orders that might have been created under dummy emails
    const deletedOrders = await db.delete(orders)
      .where(like(orders.customerEmail, '%@example.com'))
      .returning();
    console.log(`Deleted ${deletedOrders.length} dummy orders.`);

    console.log('Dummy data clean up completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    process.exit(0);
  }
}

clean();
