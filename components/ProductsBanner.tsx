import Image from "next/image";

export default function ProductsBanner() {
  return (
    <section className="relative w-full h-[40vh] md:h-[45vh] overflow-hidden flex items-center justify-center">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626156/vellvista/product/hzbpvaobukfgznudrw7x.jpg"
          alt="Premium Products Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
        />
        {/* Sophisticated semi-transparent dark overlay */}
        <div className="absolute inset-0 bg-black/45" />
        {/* Soft bottom fade to blend with the white page background */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      {/* Decorative Gold Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Subtle glowing ambient gold light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-accent/5 rounded-full blur-[100px] opacity-75" />
        {/* Thin gold accent lines at top and bottom */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center animate-fade-in">
        {/* Glassmorphic Panel */}
        <div className="backdrop-blur-sm bg-black/30 px-8 py-8 md:px-16 md:py-10 border border-white/10 relative overflow-hidden shadow-2xl">
          {/* Subtle gold corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-accent/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent/40" />

          {/* Tagline */}
          <span className="inline-block text-[10px] md:text-xs font-semibold tracking-[0.3em] text-accent uppercase mb-2 font-sans">
            The Art of Perfumery
          </span>

          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl font-light tracking-wider text-white mb-3 font-serif">
            The Signature Collection
          </h1>

          {/* Divider */}
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-3" />

          {/* Subtitle / Description */}
          <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto font-light leading-relaxed tracking-wide">
            Indulge in a curated collection of world-class fragrances, selected to evoke emotion and embody timeless elegance.
          </p>
        </div>
      </div>
    </section>
  );
}
