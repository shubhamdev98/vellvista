import Link from 'next/link';

export default function Hero() {
  return (
        <div
      id="home"
      className="relative h-[90vh] md:h-[88vh] text-inverse"
    >
      {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video autoPlay preload="auto"
            className="object-cover w-full h-full"
            muted
            loop
            playsInline
          >
            <source src="/mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/desk.mp4" type="video/mp4" media="(min-width: 768px)" />
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-primary/60"></div>
        </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-xs sm:text-sm tracking-[0.2em] uppercase text-gray-300 font-light mb-2.5 sm:mb-3 mt-4">
                summer collection 26
            </h4>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-tight text-inverse">
                The Art of Fragrance
            </h1>
            <Link href="/products" className="inline-block mt-6 bg-white text-primary font-medium py-3 px-6 transition-colors duration-300">
                Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}