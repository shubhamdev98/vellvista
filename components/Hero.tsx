import Image from "next/image";

export default function Hero() {
  return (
    <div
      id="home"
      className="relative h-[37.5rem] md:h-[43.75rem] text-inverse overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero/velvista hero.jpg"
          alt="Velvista Hero"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-primary/60"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-[20%] md:bottom-[25%] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl">
            <h4 className="text-xs sm:text-sm tracking-[0.2em] uppercase text-gray-300 font-light mb-2.5 sm:mb-3">
              summer collection 26
            </h4>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-tight font-serif text-inverse">
              The Art of Fragrance
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}