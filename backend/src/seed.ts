import { db } from './db';
import { products, categories, user, countries } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // Insert categories safely
  const categoryData: typeof categories.$inferInsert[] = [
    { name: 'fragrance', description: 'Perfumes and colognes' },
    { name: 'women', description: "Women's fragrances" },
    { name: 'men', description: "Men's fragrances" },
    { name: 'unisex', description: 'Unisex fragrances' },
  ];

  for (const cat of categoryData) {
    try {
      await db.insert(categories).values(cat).onConflictDoNothing();
    } catch (err) {
      console.warn(`Category '${cat.name}' could not be inserted:`, err);
    }
  }
  console.log('Categories seeded / verified');

  // Insert products if not already seeded
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length === 0) {
    const productData: typeof products.$inferInsert[] = [
      {
        name: 'Chanel No. 5',
        brand: 'Chanel',
        price: '150.00',
        originalPrice: '180.00',
        rating: '4.8',
        reviews: 324,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg',
        description: 'The iconic Chanel No. 5, a timeless classic',
        isNew: false,
        isSale: true,
        category: 'women',
        stock: 50,
      },
      {
        name: 'Flowerbomb',
        brand: 'Viktor & Rolf',
        price: '120.00',
        rating: '4.6',
        reviews: 256,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544138/vellvista/product/vnqu2pvfpyhqdzl7bevh.jpg',
        description: 'Explosive floral fragrance',
        isNew: true,
        isSale: false,
        category: 'women',
        stock: 30,
      },
      {
        name: 'Sauvage',
        brand: 'Dior',
        price: '95.00',
        rating: '4.7',
        reviews: 189,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544160/vellvista/product/wfwrpm4pinxikehslkd7.jpg',
        description: "Raw and fresh men's fragrance",
        isNew: false,
        isSale: false,
        category: 'men',
        stock: 75,
      },
      {
        name: 'Black Opium',
        brand: 'YSL',
        price: '110.00',
        originalPrice: '140.00',
        rating: '4.5',
        reviews: 412,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544142/vellvista/product/wjdiftninfppxofwj4gs.jpg',
        description: 'Addictive vanilla fragrance',
        isNew: false,
        isSale: true,
        category: 'women',
        stock: 25,
      },
      {
        name: 'Light Blue',
        brand: 'Dolce & Gabbana',
        price: '85.00',
        rating: '4.4',
        reviews: 167,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544146/vellvista/product/bfu7aebv60l4ont7usbm.jpg',
        description: 'Fresh Mediterranean fragrance',
        isNew: true,
        isSale: false,
        category: 'unisex',
        stock: 40,
      },
      {
        name: 'La Vie Est Belle',
        brand: 'Lancôme',
        price: '130.00',
        rating: '4.9',
        reviews: 523,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544149/vellvista/product/zzm6qrhh6v4w6qgnowyy.jpg',
        description: 'Sweet and feminine fragrance',
        isNew: false,
        isSale: false,
        category: 'women',
        stock: 60,
      },
      {
        name: 'Acqua di Gio',
        brand: 'Giorgio Armani',
        price: '75.00',
        rating: '4.6',
        reviews: 298,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544150/vellvista/product/jzjc31b2eq1eklvtgdyy.jpg',
        description: 'Fresh aquatic fragrance',
        isNew: false,
        isSale: false,
        category: 'men',
        stock: 80,
      },
      {
        name: 'Coco Mademoiselle',
        brand: 'Chanel',
        price: '145.00',
        originalPrice: '180.00',
        rating: '4.8',
        reviews: 445,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544152/vellvista/product/jfumqqqjlast4avarssf.jpg',
        description: 'Modern and sophisticated fragrance',
        isNew: false,
        isSale: false,
        category: 'women',
        stock: 35,
      },
    ];

    await db.insert(products).values(productData);
    console.log('Products seeded');
  } else {
    console.log('Products already exist, skipping product seed');
  }

  // Hash password for seed users
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Insert/update users safely
  const userData = [
    {
      id: 'admin-user-uuid-1',
      email: 'admin@luxescents.com',
      name: 'Admin User',
      image: 'https://lh3.googleusercontent.com/a/default-user',
      isActive: true,
      role: 'SUPER_ADMIN',
      password: adminPassword,
    },
  ];

  for (const u of userData) {
    try {
      await db.insert(user)
        .values(u)
        .onConflictDoUpdate({
          target: user.id,
          set: {
            email: u.email,
            name: u.name,
            image: u.image,
            isActive: u.isActive,
            role: u.role || 'USER',
            password: u.password,
          }
        });
    } catch (err) {
      console.warn(`User '${u.email}' could not be inserted/updated:`, err);
    }
  }
  console.log('Users seeded / verified');

  // Seed countries
  const countryData = [
    { name: 'United States', code: 'US', isActive: true },
    { name: 'United Kingdom', code: 'GB', isActive: true },
    { name: 'Canada', code: 'CA', isActive: true },
    { name: 'India', code: 'IN', isActive: true },
    { name: 'Germany', code: 'DE', isActive: true },
    { name: 'France', code: 'FR', isActive: true },
    { name: 'Australia', code: 'AU', isActive: true },
    { name: 'United Arab Emirates', code: 'AE', isActive: true },
    { name: 'Singapore', code: 'SG', isActive: false },
    { name: 'Japan', code: 'JP', isActive: false },
  ];

  for (const c of countryData) {
    try {
      await db.insert(countries)
        .values(c)
        .onConflictDoNothing();
    } catch (err) {
      console.warn(`Country '${c.name}' could not be inserted:`, err);
    }
  }
  console.log('Countries seeded / verified');

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});