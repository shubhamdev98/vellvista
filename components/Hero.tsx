import Image from "next/image";

export default function Hero() {
  return (
    <div id="home" className="relative h-[37.5rem] md:h-[43.75rem] text-inverse overflow-hidden">
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
    </div>
  );
}