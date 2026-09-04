import { db } from './db';
import { products, categories, subCategories, user, vendors, countries, paymentMethods, commissions } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database with Multi-Vendor & Multi-Category support...');

  // Hash password for seed users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const vendorPassword = await bcrypt.hash('vendor123', 10);

  // Insert/update core users
  const userData = [
    {
      id: 'admin-user-uuid-1',
      email: 'admin@vellvista.com',
      name: 'Admin User',
      image: 'https://lh3.googleusercontent.com/a/default-user',
      isActive: true,
      role: 'SUPER_ADMIN',
      password: adminPassword,
    },
    {
      id: 'vendor-user-uuid-1',
      email: 'vendor@luxebeauty.com',
      name: 'Elena Rostova',
      image: 'https://lh3.googleusercontent.com/a/default-user',
      isActive: true,
      role: 'VENDOR',
      password: vendorPassword,
    },
    {
      id: 'vendor-user-uuid-2',
      email: 'vendor@apextech.com',
      name: 'Marcus Vance',
      image: 'https://lh3.googleusercontent.com/a/default-user',
      isActive: true,
      role: 'VENDOR',
      password: vendorPassword,
    },
    {
      id: 'standard-user-uuid-2',
      email: 'user@vellvista.com',
      name: 'Standard User',
      image: 'https://lh3.googleusercontent.com/a/default-user',
      isActive: true,
      role: 'CUSTOMER',
      password: userPassword,
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
            role: u.role || 'CUSTOMER',
            password: u.password,
          }
        });
    } catch (err) {
      console.warn(`User '${u.email}' could not be inserted/updated:`, err);
    }
  }
  console.log('Users seeded / verified');

  // Seed Vendors
  const vendorData: typeof vendors.$inferInsert[] = [
    {
      userId: 'admin-user-uuid-1',
      storeName: 'VellVista Flagship Store',
      slug: 'vellvista-official',
      ownerName: 'VellVista Official',
      email: 'store@vellvista.com',
      phone: '+1 800 555 0199',
      description: 'Official flagship boutique for VellVista luxury fragrances and fine beauty products.',
      address: '742 Fifth Avenue, New York, NY 10019',
      logo: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png',
      banner: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626156/vellvista/product/hzbpvaobukfgznudrw7x.jpg',
      status: 'APPROVED',
      rating: '4.9',
      reviewCount: 154,
    },
    {
      userId: 'vendor-user-uuid-1',
      storeName: 'Luxe Beauty & Skincare',
      slug: 'luxe-beauty',
      ownerName: 'Elena Rostova',
      email: 'vendor@luxebeauty.com',
      phone: '+1 310 555 0142',
      description: 'Organic, botanical skincare and high-end cosmetics formulated in Geneva.',
      address: '128 Rue du Rhône, Geneva, Switzerland',
      logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
      banner: 'https://images.unsplash.com/photo-1512290900673-70023421516e?w=1200',
      status: 'APPROVED',
      rating: '4.8',
      reviewCount: 89,
    },
    {
      userId: 'vendor-user-uuid-2',
      storeName: 'Apex Electronics & Gear',
      slug: 'apex-electronics',
      ownerName: 'Marcus Vance',
      email: 'vendor@apextech.com',
      phone: '+1 415 555 0188',
      description: 'Cutting-edge consumer electronics, smart audio, and premium accessories.',
      address: '500 Howard St, San Francisco, CA 94105',
      logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300',
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
      status: 'APPROVED',
      rating: '4.7',
      reviewCount: 64,
    },
  ];

  for (const v of vendorData) {
    try {
      await db.insert(vendors).values(v).onConflictDoNothing();
    } catch (err) {
      console.warn(`Vendor '${v.storeName}' could not be inserted:`, err);
    }
  }
  console.log('Vendors seeded / verified');

  // Fetch created vendors for mapping
  const allVendors = await db.select().from(vendors);
  const defaultVendor = allVendors.find(v => v.slug === 'vellvista-official') || allVendors[0];
  const luxeVendor = allVendors.find(v => v.slug === 'luxe-beauty') || defaultVendor;
  const apexVendor = allVendors.find(v => v.slug === 'apex-electronics') || defaultVendor;

  // Insert categories safely
  const categoryData: typeof categories.$inferInsert[] = [
    { name: 'Perfumes', slug: 'perfumes', description: 'Luxury fragrances, eau de parfums, and rare extraits' },
    { name: 'Skincare', slug: 'skincare', description: 'Serums, moisturizers, cleansers, and anti-aging treatments' },
    { name: 'Cosmetics', slug: 'cosmetics', description: 'High-definition makeup, lipsticks, and beauty palettes' },
    { name: 'Fashion', slug: 'fashion', description: 'Designer apparel, shoes, and luxury accessories' },
    { name: 'Electronics', slug: 'electronics', description: 'Smartphones, audio, wearables, and high-tech gadgets' },
    { name: 'Accessories', slug: 'accessories', description: 'Handbags, watches, sunglasses, and leather goods' },
  ];

  for (const cat of categoryData) {
    try {
      await db.insert(categories).values(cat).onConflictDoNothing();
    } catch (err) {
      console.warn(`Category '${cat.name}' could not be inserted:`, err);
    }
  }
  console.log('Categories seeded / verified');

  // Seed Subcategories
  const allCategories = await db.select().from(categories);
  const perfumeCat = allCategories.find(c => c.name === 'Perfumes') || allCategories[0];
  const skincareCat = allCategories.find(c => c.name === 'Skincare') || allCategories[0];
  const electronicsCat = allCategories.find(c => c.name === 'Electronics') || allCategories[0];
  const fashionCat = allCategories.find(c => c.name === 'Fashion') || allCategories[0];

  const subCategoryData: typeof subCategories.$inferInsert[] = [
    { categoryId: perfumeCat.id, name: 'Women Fragrances', slug: 'women-fragrances', description: 'Floral, fruity, and oriental perfumes for women' },
    { categoryId: perfumeCat.id, name: 'Men Colognes', slug: 'men-colognes', description: 'Woody, fresh, and aromatic colognes for men' },
    { categoryId: perfumeCat.id, name: 'Unisex Extraits', slug: 'unisex-extraits', description: 'Versatile niche fragrances suited for everyone' },
    { categoryId: skincareCat.id, name: 'Face Serums', slug: 'face-serums', description: 'Hydrating, vitamin C, and hyaluronic acid serums' },
    { categoryId: electronicsCat.id, name: 'Smart Audio', slug: 'smart-audio', description: 'Wireless noise-canceling headphones & speakers' },
    { categoryId: fashionCat.id, name: 'Designer Handbags', slug: 'designer-handbags', description: 'Luxury leather totes, clutches, and crossbody bags' },
  ];

  for (const sub of subCategoryData) {
    try {
      await db.insert(subCategories).values(sub).onConflictDoNothing();
    } catch (err) {
      console.warn(`SubCategory '${sub.name}' could not be inserted:`, err);
    }
  }
  console.log('SubCategories seeded / verified');

  // Seed products if not already seeded
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length === 0) {
    const productData: typeof products.$inferInsert[] = [
      // Perfumes (Attached to Default Flagship Vendor)
      {
        vendorId: defaultVendor.id,
        categoryId: perfumeCat.id,
        name: 'Chanel No. 5',
        slug: 'chanel-no-5',
        brand: 'Chanel',
        price: '150.00',
        originalPrice: '180.00',
        rating: '4.8',
        reviews: 324,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg',
        description: 'The iconic Chanel No. 5, a timeless classic',
        isNew: false,
        isSale: true,
        category: 'perfumes',
        stock: 50,
        status: 'ACTIVE',
      },
      {
        vendorId: defaultVendor.id,
        categoryId: perfumeCat.id,
        name: 'Sauvage',
        slug: 'sauvage-dior',
        brand: 'Dior',
        price: '95.00',
        rating: '4.7',
        reviews: 189,
        image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544160/vellvista/product/wfwrpm4pinxikehslkd7.jpg',
        description: "Raw and fresh men's fragrance",
        isNew: false,
        isSale: false,
        category: 'perfumes',
        stock: 75,
        status: 'ACTIVE',
      },

      // Skincare (Attached to Luxe Beauty Vendor)
      {
        vendorId: luxeVendor.id,
        categoryId: skincareCat.id,
        name: 'Radiance Botanical Elixir Serum',
        slug: 'radiance-botanical-elixir-serum',
        brand: 'Luxe Geneva',
        price: '88.00',
        originalPrice: '110.00',
        rating: '4.9',
        reviews: 42,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        description: 'Concentrated serum infused with Swiss rose stem cells and niacinamide.',
        shortDescription: 'Deep hydration & cellular renewal serum.',
        isNew: true,
        isSale: true,
        category: 'skincare',
        stock: 40,
        status: 'ACTIVE',
        specifications: JSON.stringify({ skinType: 'All Skin Types', volume: '30ml', keyIngredient: 'Niacinamide + Rose Extract' }),
      },

      // Electronics (Attached to Apex Tech Vendor)
      {
        vendorId: apexVendor.id,
        categoryId: electronicsCat.id,
        name: 'Acoustica ANC Pro Headphones',
        slug: 'acoustica-anc-pro-headphones',
        brand: 'Apex Audio',
        price: '249.99',
        originalPrice: '299.99',
        rating: '4.8',
        reviews: 78,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        description: 'Active noise-canceling wireless headphones with 40-hour battery life and spatial audio.',
        shortDescription: 'High-fidelity spatial audio headset.',
        isNew: true,
        isSale: true,
        category: 'electronics',
        stock: 25,
        status: 'ACTIVE',
        specifications: JSON.stringify({ batteryLife: '40 Hours', connectivity: 'Bluetooth 5.3', noiseCancellation: 'Active ANC' }),
      },
    ];

    await db.insert(products).values(productData);
    console.log('Multi-Vendor Products seeded');
  }

  // Seed default commission percentage
  try {
    await db.insert(commissions).values({
      defaultRate: '10.00',
      description: 'Global platform commission percentage',
    });
    console.log('Commission configuration initialized (10.00%)');
  } catch (err) {
    // ignore duplicate
  }

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
  ];

  for (const c of countryData) {
    try {
      await db.insert(countries).values(c).onConflictDoNothing();
    } catch (err) {
      console.warn(`Country '${c.name}' could not be inserted:`, err);
    }
  }

  // Seed payment methods
  const paymentMethodData = [
    { name: 'Google Pay', code: 'gpay', description: 'Pay via Google Pay app or UPI code', isActive: true },
    { name: 'Credit Card', code: 'credit_card', description: 'Pay with Visa, Mastercard, AMEX', isActive: true },
    { name: 'Debit Card', code: 'debit_card', description: 'Pay with standard Debit Card', isActive: true },
    { name: 'UPI / QR', code: 'upi', description: 'Pay with PhonePe, Paytm, or BHIM UPI', isActive: true },
    { name: 'Razorpay', code: 'razorpay', description: 'All-in-one payment gateway integration', isActive: true },
  ];

  for (const pm of paymentMethodData) {
    try {
      await db.insert(paymentMethods).values(pm).onConflictDoNothing();
    } catch (err) {
      console.warn(`Payment Method '${pm.name}' could not be inserted:`, err);
    }
  }

  console.log('Database seeded successfully with Multi-Vendor support!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});