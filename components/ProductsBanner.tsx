import Image from "next/image";

export default function ProductsBanner() {
  return (
    <section className="relative w-full h-[30vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626156/vellvista/product/hzbpvaobukfgznudrw7x.jpg"
          alt="Premium Products Banner"
          layout="fill"
          objectFit="cover"
          className="object-center scale-105 hover:scale-100 transition-transform duration-700"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
        {/* Subtle light accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      </div>
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">
          Premium Collection
        </h1>
      </div>
    </section>
  );
}
