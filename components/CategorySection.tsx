"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CategorySection() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/products?category=${category}`);
  };

  return (
    <section id="categories" className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="mb-8 md:mb-12 font-inter">
          <p className="font-label-caps text-xs text-secondary tracking-widest mb-2 font-semibold">
            CURATED FOR YOU
          </p>
          <h2 className="font-headline-xl text-3xl md:text-4xl font-bold font-manrope text-primary leading-tight">
            Seasonal Perspective
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Box 1: Large Featured Category (The Essentials) */}
          <button
            onClick={() => handleCategoryClick("women")}
            className="col-span-1 md:col-span-2 row-span-2 group relative overflow-hidden bg-surface-alt h-[400px] text-left w-full cursor-pointer focus:outline-none"
          >
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqcKZjrxcg7_wCmw5zg8MixHwIflOXwrNnYqURa8kS6ZYELKzn2qZDoIFFUcrrM--lAFN3ctKKbpOfZp09DUnbRSuycvtMv5aWn-dir9y_8l_V6tK7uiEyvCyXbhDEttxPcrlPuYbdiYBKptJxRZwBSr9txCPlD8lJViKX2vB2-fjoEcXVnHY3UqIrAXQ_UyzCafjzWD9tR7sYCdUy6Vr3wH-QSxLThkL9PUO8GeT0kMVu2973KP8jkvnjoZLa3szGuw_ZpoRs4yd_"
                alt="The Essentials"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            {/* Soft dark overlay */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute bottom-6 left-6 font-inter">
              <p className="font-label-caps text-[10px] text-white/90 tracking-wider mb-1 font-semibold">COLLECTION 01</p>
              <h3 className="font-headline-md text-2xl text-white font-semibold font-manrope">The Essentials</h3>
            </div>
          </button>

          {/* Box 2: Accessories */}
          <button
            onClick={() => handleCategoryClick("accessories")}
            className="group relative overflow-hidden bg-surface-alt h-[192px] text-left w-full cursor-pointer focus:outline-none"
          >
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa-kUKen9Z4UyNeQGFzxvQBYyw7dh3xwFnAOp0z2NLSw8rPlJgMh1FZJUxbti8I7acmZOOaxuSnKV2iHTgvb9W-mZas1kM2bJzE6zrTPWgugeBFaWYMhiZniYhmPfRXuZuPTOaC9C2DbgKhCKUER0_0kOX_4AwdVGgTifDiR9kc1DO5j_Ic6R6zq55E2ptAyQAwGlkQA24l2cNO4GhNNAj54byGG5viv9usChZCn2gwHnr2ePzzqNxSKzEaYB60lvHP4_Gl-jU9Xkb"
                alt="Accessories"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
            {/* Soft dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute bottom-4 left-4 font-inter z-10">
              <h3 className="font-label-caps text-xs text-white tracking-widest font-semibold font-manrope">Accessories</h3>
            </div>
          </button>

          {/* Box 3: Footwear */}
          <button
            onClick={() => handleCategoryClick("footwear")}
            className="group relative overflow-hidden bg-surface-alt h-[192px] text-left w-full cursor-pointer focus:outline-none"
          >
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdk-tHqrntkZQ8ikr_m8CR1FXuhlzmnYn1aNNWEyrg7zh7pgyG9AwZ2eknPESJvON2twnJy0B5bJjN8c6TBvvHSpcGFBT8kNhA8BmHHBP6oTe1k5mKGCBZHbmDlbEW8Vj538YuhHBGEHBHFiBO0dS7NV9Mhu4NrvYo7bYoOeGwINTkTEKNio2EFoPLzWQNiPla9WrnkCGHPfcBc8uePzK-5cxMd-mbAn2_zcWrsTFvX2cXvk2ixPMHM3uFrtoEdoSdPfaFN6F4g3jt"
                alt="Footwear"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
            {/* Soft dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute bottom-4 left-4 font-inter z-10">
              <h3 className="font-label-caps text-xs text-white tracking-widest font-semibold font-manrope">Footwear</h3>
            </div>
          </button>

          {/* Box 4: Landscape Wide Category (Limited Edition) */}
          <button
            onClick={() => router.push("/products")}
            className="col-span-1 md:col-span-2 group relative overflow-hidden bg-surface-alt h-[192px] text-left w-full cursor-pointer focus:outline-none"
          >
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQPIHD13IZkx4y1-siUiBr1Ut04eOAyjCRwyrhVUj01Ufj1h4kXRMeWaNPbc9tkd5uUS0WbKu_lpNxyCgTVJxdEMM8-UEFJXbPXSezWZuRedYHe2o7O0JgXx6fWI0BssL7aDKPeMTCslrl5BDlDrfHZVkkXXw0SODmwK-cLIwIVhow4bbRWsCS1XNNkWW0m3e1nP9SW3rPocoUuZZCQGvoq9LugBUOtUr1TgA47Gb81jevN1trxboCuoswOxCcY5asGmsiUNE0WCJB"
                alt="Limited Edition"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            {/* Soft dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors duration-300" />
            <div className="absolute bottom-4 left-4 font-inter z-10">
              <h3 className="font-headline-md text-xl text-white font-semibold font-manrope">Limited Edition</h3>
            </div>
          </button>

        </div>
      </div>
    </section>
  );
}