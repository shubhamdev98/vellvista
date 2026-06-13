import Image from "next/image";

export default function PromoBanner() {
  return (
    <section className="relative h-[18.75rem] md:h-[25rem] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/product/laura-chouette-3RJ1HFdiJ0M-unsplash.jpg"
          alt="Luxury Perfume Collection"
          fill
          className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
          priority
        />
        {/* Sophisticated dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80"></div>
        {/* Diagonal light accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top-right accent line */}
        <div className="absolute top-10 right-10 w-24 h-px bg-gradient-to-l from-accent/40 to-transparent"></div>
        {/* Bottom-left accent line */}
        <div className="absolute bottom-10 left-10 w-24 h-px bg-gradient-to-r from-accent/40 to-transparent"></div>
        {/* Decorative circle blur */}
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          {/* Main Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
              Elegance
            </span>
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-300 mb-0 max-w-2xl mx-auto leading-relaxed">
            Discover our exclusive collection of premium fragrances crafted for
            those who appreciate the finer things in life.
          </p>
        </div>
      </div>

      {/* Bottom gradient overlay for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
    </section>
  );
}