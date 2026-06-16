"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  image: string;
}

const categories: Category[] = [
  {
    id: "men",
    name: "Men",
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg",
  },
  {
    id: "women",
    name: "Women",
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544138/vellvista/product/vnqu2pvfpyhqdzl7bevh.jpg",
  },
  {
    id: "unisex",
    name: "Unisex",
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544160/vellvista/product/wfwrpm4pinxikehslkd7.jpg",
  },
];

export default function CategorySection() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/products?category=${category}`);
  };

  return (
    <section id="categories" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-3 md:mb-4">
            Shop by Category
          </h2>
          <p className="text-sm md:text-lg text-primary max-w-2xl mx-auto px-4">
            Explore our curated collections designed for every personality and style.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="flex flex-col items-center group cursor-pointer w-full"
            >
              <div className="relative w-24 h-24 sm:w-44 sm:h-44 md:w-48 md:h-48 overflow-hidden mb-3 md:mb-4 border-4 border-background group-hover:border-secondary transition-all duration-300 font-light">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 176px, 192px"
                  className="object-cover"
                />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-light text-primary group-hover:text-secondary transition-colors duration-300">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}