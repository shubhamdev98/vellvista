"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/context/ToastProvider";
import { useCurrency } from "@/context/CurrencyProvider";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  Ticket,
  ArrowRight,
  Filter,
  Search,
  Award,
  Phone,
  Mail,
  User,
  Music,
  GlassWater,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  Printer,
  Check,
  RefreshCw,
  X
} from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  category: "garba" | "concert" | "masterclass" | "bridal" | "vip" | "corporate";
  categoryLabel: string;
  badge: string;
  date: string;
  time: string;
  location: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  highlights: string[];
  capacity: string;
  isPopular?: boolean;
}

const EVENTS_DATA: EventItem[] = [
  {
    id: "garba-single-pass",
    title: "Royal Navratri Garba Night 2026",
    subtitle: "1-Day Entry Pass • Live Orchestra & Traditional Raas",
    category: "garba",
    categoryLabel: "Garba & Navratri Special",
    badge: "NAVRI 2026",
    date: "Oct 12, 2026",
    time: "07:00 PM - 11:30 PM",
    location: "Grand Palace Arena, Sector 5",
    price: 10,
    originalPrice: 15,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    description: "Experience the vibrant energy of authentic Navratri Garba with traditional live orchestra music, grand floral decorations, and luxury scent-infused ambience.",
    highlights: [
      "Traditional Live Orchestra & Raas Singer",
      "Complimentary Welcome Botanical Mocktail",
      "Traditional Dandiya Sticks Provided",
      "Prizes for Best Dressed & Best Garba Player"
    ],
    capacity: "Limited Passes Available",
    isPopular: true
  },
  {
    id: "garba-vip-season-pass",
    title: "Navratri VIP All-Access Season Pass",
    subtitle: "Full 9 Days Entry • Dedicated VIP Lounge & Fast Track",
    category: "garba",
    categoryLabel: "Garba & Navratri VIP",
    badge: "VIP 9-DAY PASS",
    date: "Oct 12 - Oct 20, 2026",
    time: "07:00 PM - Midnight Daily",
    location: "Royal Heritage Pavilion",
    price: 35,
    originalPrice: 50,
    image: "https://images.unsplash.com/photo-1545232979-fbf34fc366c4?q=80&w=800&auto=format&fit=crop",
    description: "Enjoy non-stop celebrations for all 9 nights of Navratri with VIP seating, fast-track entry, gourmet refreshments, and exclusive fragrance gift box.",
    highlights: [
      "Unlimited Priority Access for All 9 Nights",
      "Air-Conditioned VIP Lounge & Fragrance Bar",
      "Unlimited Soft Beverages & Gourmet Finger Food",
      "Dedicated Valet Parking & Executive Security"
    ],
    capacity: "Only 50 VIP Passes Left"
  },
  {
    id: "garba-couple-dandiya",
    title: "Grand Dandiya Fusion Night",
    subtitle: "Couple Pass • Folk Fusion & Electro-Garba Beats",
    category: "garba",
    categoryLabel: "Garba & Navratri Special",
    badge: "COUPLE PASS",
    date: "Oct 16, 2026",
    time: "08:00 PM - 12:00 AM",
    location: "Vellvista Arena Grounds",
    price: 12,
    originalPrice: 18,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    description: "A magical night of fusion music blending classical folk with modern electronic rhythms, crafted specially for couples and dance enthusiasts.",
    highlights: [
      "Couple Entry (Valid for 2 Persons)",
      "Exclusive Custom Fragrance Wristbands",
      "Interactive 360° Photo Booth Access",
      "Food & Beverage Coupon Included"
    ],
    capacity: "Popular Demand"
  },
  {
    id: "concert-orchestral",
    title: "Symphony of Scents - Live Acoustic Evening",
    subtitle: "Live String Quartet Paired with Botanical Fragrance Notes",
    category: "concert",
    categoryLabel: "Concerts & Live Music",
    badge: "LIVE CONCERT",
    date: "Nov 05, 2026",
    time: "06:30 PM - 09:30 PM",
    location: "Vellvista Grand Concert Hall",
    price: 20,
    originalPrice: 28,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    description: "An immersive multi-sensory evening where classical musical movements are synchronized with real-time olfactory scent releases across the auditorium.",
    highlights: [
      "12-Piece Live Chamber String Ensemble",
      "Synchronized Ambient Olfactory Diffusion",
      "Luxury Vellvista Discovery Discovery Kit Included",
      "Complimentary Sparkling Welcome Drink"
    ],
    capacity: "Seated Event"
  },
  {
    id: "concert-midnight-jazz",
    title: "Midnight Jazz & Botanical Lounge",
    subtitle: "Smooth Jazz Performances & Custom Fragrance Tastings",
    category: "concert",
    categoryLabel: "Concerts & Live Music",
    badge: "EXCLUSIVE NIGHT",
    date: "Nov 20, 2026",
    time: "08:30 PM - 11:30 PM",
    location: "The Velvet Lounge",
    price: 18,
    originalPrice: 25,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    description: "Unwind with soul-stirring jazz solos while exploring rare botanical essential oils curated by our master perfumers.",
    highlights: [
      "Live International Jazz Trio",
      "Craft Scented Cocktail Menu",
      "Limited Intimate Capacity (50 Guests)",
      "Take-Home 10ml Travel Atomizer"
    ],
    capacity: "Intimate 50 Seats"
  },
  {
    id: "masterclass-creation",
    title: "Artisan Perfume Creation Masterclass",
    subtitle: "Design & Bottle Your Signature 50ml Eau de Parfum",
    category: "masterclass",
    categoryLabel: "Scent Masterclass",
    badge: "HANDS-ON WORKSHOP",
    date: "Oct 25, 2026",
    time: "02:00 PM - 05:00 PM",
    location: "Vellvista Atelier Studio",
    price: 30,
    originalPrice: 40,
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800&auto=format&fit=crop",
    description: "Learn the secrets of top, heart, and base notes from senior nose perfumers. Formulate and take home your personalized 50ml custom perfume.",
    highlights: [
      "Take Home Custom 50ml Eau de Parfum",
      "Access to 40+ Rare Natural Extracts & Oils",
      "Personal Olfactory Formula Card Record",
      "Official Certificate of Perfumery Workshop"
    ],
    capacity: "15 Seats Per Session",
    isPopular: true
  },
  {
    id: "masterclass-aromatherapy",
    title: "Olfactory Wellness & Herbal Distillation",
    subtitle: "Discover Natural Extraction & Mindful Scent Crafting",
    category: "masterclass",
    categoryLabel: "Scent Masterclass",
    badge: "WELLNESS & CARE",
    date: "Nov 12, 2026",
    time: "11:00 AM - 02:00 PM",
    location: "Botanical Greenhouse Studio",
    price: 22,
    originalPrice: 30,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop",
    description: "Explore steam distillation techniques using organic herbs and flowers to craft soothing aromatherapy blends for stress relief and home wellness.",
    highlights: [
      "Live Plant Distillation Demonstration",
      "3 Custom Aromatherapy Rollerballs Included",
      "Guided Mindful Scent Meditation",
      "Organic Herbal Tea & Botanical Snacks"
    ],
    capacity: "20 Seats"
  },
  {
    id: "bridal-experience",
    title: "Bespoke Wedding Scent Styling",
    subtitle: "Curate Signature Scents for Bride, Groom & Wedding Favors",
    category: "bridal",
    categoryLabel: "Bridal & Weddings",
    badge: "BRIDAL LUXURY",
    date: "Nov 02, 2026",
    time: "01:00 PM - 04:00 PM",
    location: "Vellvista Private Bridal Suite",
    price: 60,
    originalPrice: 80,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
    description: "Make your wedding day unforgettable with bespoke perfume formulations for the couple, along with custom-scented wedding favors for your guests.",
    highlights: [
      "Private Bridal Consultation (Up to 4 Persons)",
      "2 Bespoke 100ml Perfumes (Bride & Groom)",
      "Custom Bottle Engraving & Custom Box",
      "Scented Favor Sample Set for Wedding"
    ],
    capacity: "By Appointment Only"
  },
  {
    id: "vip-salon",
    title: "Exclusive Master Perfumer VIP Salon",
    subtitle: "1-on-1 Private Fragrance Formulation Session",
    category: "vip",
    categoryLabel: "VIP & Private Salon",
    badge: "1-ON-1 VIP",
    date: "Flexible / On Demand",
    time: "Custom Scheduling",
    location: "Vellvista VIP Vault",
    price: 95,
    originalPrice: 125,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
    description: "An elite private session with our Chief Perfumer to craft an ultra-exclusive signature scent archived permanently under your name.",
    highlights: [
      "Private Master Perfumer 1-on-1 Consultation",
      "100ml Pure Extrait de Parfum Concentration",
      "Handcrafted Italian Crystal Flacon",
      "Lifetime Formula Archiving & Reorder Privilege"
    ],
    capacity: "VIP Exclusive"
  },
  {
    id: "corporate-lounge",
    title: "Corporate Olfactory Team Experience",
    subtitle: "Interactive Scent Workshop & Brand Aroma Creation",
    category: "corporate",
    categoryLabel: "Corporate Lounge",
    badge: "CORPORATE EVENT",
    date: "Flexible Scheduling",
    time: "Half-Day Event",
    location: "Vellvista Executive Suite",
    price: 150,
    originalPrice: 190,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    description: "A premium team-building experience where teams create their corporate signature scent while learning perfume science and sensory branding.",
    highlights: [
      "Group Entry for up to 10 Team Members",
      "Corporate Ambient Signature Scent Formula",
      "Gourmet Catering & Refreshment Lounge",
      "Custom Branded Gift Boxes for All Participants"
    ],
    capacity: "Group Booking"
  }
];

const CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "garba", label: "Garba & Navratri" },
  { id: "concert", label: "Concerts & Music" },
  { id: "masterclass", label: "Scent Masterclasses" },
  { id: "bridal", label: "Bridal & Weddings" },
  { id: "vip", label: "VIP Salon" },
  { id: "corporate", label: "Corporate" }
];

const BANNER_SLIDES = [
  {
    id: "garba-single-pass",
    badge: "ROYAL NAVRATRI 2026",
    title: "Grand Navratri Garba Celebration 2026",
    subtitle: "Experience 9 nights of authentic live orchestra, traditional Raas, and luxury scent-infused arena.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop",
    cta: "Book Garba Pass Now"
  },
  {
    id: "concert-orchestral",
    badge: "LIVE ACOUSTICS & SCENTS",
    title: "Symphony of Scents - Acoustic Evening",
    subtitle: "A multi-sensory evening pairing live chamber string movements with real-time olfactory fragrance releases.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop",
    cta: "Reserve Concert Pass"
  },
  {
    id: "vip-salon",
    badge: "EXCLUSIVE VIP ATELIER",
    title: "Master Perfumer Private VIP Salon",
    subtitle: "1-on-1 private formulation session with our Chief Perfumer to archive your custom signature scent.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1600&auto=format&fit=crop",
    cta: "Book VIP Session"
  }
];

function EventsPageContent() {
  const { showToast } = useToast();
  const { formatPrice, currency } = useCurrency();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Slideshow State & Controls
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  // Filter Drawer State
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500,
    popularOnly: false,
    sortBy: "default"
  });

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory("all");
    }
  }, [categoryParam]);

  // Prevent background scrolling when booking modal or filter drawer is open
  useEffect(() => {
    if (selectedEvent || showFilter) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent, showFilter]);
  
  // Booking Form state
  const [ticketCount, setTicketCount] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: ""
  });
  
  // Confirmation state
  const [bookingConfirmed, setBookingConfirmed] = useState<{
    passId: string;
    event: EventItem;
    tickets: number;
    totalAmount: number;
    customerName: string;
    customerEmail: string;
    bookingDate: string;
  } | null>(null);

  // Filter & Sort Logic
  const filteredEvents = EVENTS_DATA.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesMinPrice = !filters.minPrice || item.price >= filters.minPrice;
    const matchesMaxPrice = !filters.maxPrice || item.price <= filters.maxPrice;
    const matchesPopular = !filters.popularOnly || item.isPopular;
    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesPopular;
  }).sort((a, b) => {
    if (filters.sortBy === "price-asc") return a.price - b.price;
    if (filters.sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 20000,
      popularOnly: false,
      sortBy: "default"
    });
    setActiveCategory("all");
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setBookingConfirmed(null);
    setTicketCount(1);
    setFormData({ fullName: "", email: "", phone: "", specialRequests: "" });
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setBookingConfirmed(null);
    setTicketCount(1);
    setFormData({ fullName: "", email: "", phone: "", specialRequests: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast("Please fill in all required contact details.", "error");
      return;
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const prefix = selectedEvent.category === "garba" ? "GARBA" : "EVENT";
    const passCode = `${prefix}-${randomNum}`;
    const total = selectedEvent.price * ticketCount;

    setBookingConfirmed({
      passId: passCode,
      event: selectedEvent,
      tickets: ticketCount,
      totalAmount: total,
      customerName: formData.fullName,
      customerEmail: formData.email,
      bookingDate: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    });

    showToast(`Pass reserved! Reference #${passCode}`, "success");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* Slideshow Hero Banner - Sharp corners, auto-play & interactive slide controls */}
      <section className="relative w-full h-[22rem] sm:h-[28rem] lg:h-[32rem] bg-gray-900 overflow-hidden group border-b border-gray-200">
        {BANNER_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          const targetEvent = EVENTS_DATA.find((e) => e.id === slide.id);

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center transition-transform duration-7000 ease-out scale-105"
                sizes="100vw"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

              {/* Slide Content Box */}
              <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-12 text-center z-20">
                <div className="max-w-3xl space-y-3 sm:space-y-5">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-base text-gray-200 max-w-2xl mx-auto line-clamp-2 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (targetEvent) handleSelectEvent(targetEvent);
                      }}
                      className="bg-white text-black hover:bg-black hover:text-white border border-white font-bold text-xs sm:text-sm px-6 py-3 transition-colors duration-200 cursor-pointer inline-flex items-center gap-2 uppercase tracking-wider rounded-none"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Previous / Next Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/40 hover:bg-black/80 text-white border border-white/20 backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer rounded-none"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/40 hover:bg-black/80 text-white border border-white/20 backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer rounded-none"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Position Indicator Dots/Bars */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 transition-all duration-300 cursor-pointer rounded-none ${
                idx === currentSlide ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">

        {/* Header Title & Filter Button */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Available Events
          </h2>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 border border-black px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-black hover:text-white transition-colors cursor-pointer rounded-none bg-white"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(filters.minPrice > 0 || filters.maxPrice < 20000 || filters.popularOnly || filters.sortBy !== "default") && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Event Cards Grid */}
        <section className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-none border border-gray-200 p-12 text-center space-y-3">
              <Ticket className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-semibold text-gray-800">No events found</h3>
              <p className="text-xs text-gray-500">
                Try selecting another category or clearing your search filter.
              </p>
              <button
                onClick={() => {
                  clearFilters();
                }}
                className="mt-2 text-xs font-semibold text-black underline hover:text-gray-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredEvents.map((event) => {
                const isSelected = selectedEvent?.id === event.id;

                return (
                  <div
                    key={event.id}
                    className={`border transition-all duration-200 rounded-none bg-white flex flex-col justify-between overflow-hidden relative group h-full ${
                      isSelected
                        ? "border-black ring-1 ring-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex flex-col flex-1">
                      {/* Card Top Image - Completely Clear, No Text Overlays */}
                      <div className="relative h-48 w-full bg-gray-100 overflow-hidden shrink-0">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>

                      {/* Card Content Body - aligned spacing */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                              {event.categoryLabel}
                            </p>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2 py-0.5 border border-gray-200">
                              {event.badge}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-black transition-colors leading-snug min-h-[2.5rem] flex items-center">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 min-h-[2rem]">
                            {event.subtitle}
                          </p>
                        </div>

                        {/* Details Grid Box - sharp corners */}
                        <div className="bg-gray-50 border border-gray-200 p-3.5 space-y-2 text-xs text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span className="font-medium text-gray-900">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 pt-1 border-t border-gray-200/60 font-medium">
                            <Users className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span>{event.capacity}</span>
                          </div>
                        </div>

                        {/* Highlights List */}
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Pass Includes:
                          </p>
                          <ul className="space-y-1">
                            {event.highlights.slice(0, 3).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Price & Action - Pinned to bottom */}
                    <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 bg-white mt-auto">
                      <div>
                        <span className="text-xs text-gray-400 block leading-none mb-1">Pass Price</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-gray-900">{formatPrice(event.price)}</span>
                          {event.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">{formatPrice(event.originalPrice)}</span>
                          )}
                        </div>
                      </div>

                      {/* Book Pass Button */}
                      <button
                        onClick={() => handleSelectEvent(event)}
                        className={`transition-all duration-200 py-2.5 px-4 rounded-none text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-black text-white border border-black"
                            : "bg-gray-100 text-black border border-gray-200 hover:bg-black hover:text-white"
                        }`}
                      >
                        <Ticket className="w-3.5 h-3.5 shrink-0" />
                        <span>Book Pass</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* FILTER DRAWER SIDEBAR */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          showFilter ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowFilter(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[24rem] bg-white z-50 shadow-2xl border-l border-gray-200 transition-transform duration-300 ease-in-out transform ${
          showFilter ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full font-sans">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-black" />
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                Event Filters
              </h3>
            </div>
            <button
              onClick={() => setShowFilter(false)}
              className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-800">
            
            {/* Category Option */}
            <div className="space-y-2">
              <label className="block font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                Event Category
              </label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black outline-none bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="block font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black outline-none bg-white cursor-pointer"
              >
                <option value="default">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="block font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                Pass Price Range ({currency.symbol})
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Min Price</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.minPrice || ""}
                    onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full p-2.5 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Max Price</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxPrice === 500 ? "" : filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : 500 })}
                    placeholder="500"
                    className="w-full p-2.5 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.popularOnly}
                  onChange={(e) => setFilters({ ...filters, popularOnly: e.target.checked })}
                  className="w-4 h-4 accent-black border-gray-300 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-800">Show Popular Events Only</span>
              </label>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
            <button
              onClick={clearFilters}
              className="w-1/2 py-2.5 border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer rounded-none"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setShowFilter(false)}
              className="w-1/2 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 transition-colors cursor-pointer rounded-none uppercase tracking-wider"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL DIALOG FOR BOOKING PASS */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-white border border-gray-900 rounded-none shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {selectedEvent.categoryLabel}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  {selectedEvent.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedEvent.date} • {selectedEvent.time} • {selectedEvent.location}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            {bookingConfirmed ? (
              /* Case A: Confirmed E-Pass Summary */
              <div className="space-y-6 text-center py-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-none flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-none uppercase tracking-wider border border-emerald-200">
                    Booking Confirmed • E-Pass Issued
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 pt-2">
                    Your Pass Reservation is Successful!
                  </h4>
                  <p className="text-xs text-gray-500">
                    Reference code logged. Please present your pass code at entry.
                  </p>
                </div>

                {/* E-Pass Summary Box */}
                <div className="bg-gray-900 text-white rounded-none p-5 text-left space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                    <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                      {bookingConfirmed.event.categoryLabel}
                    </span>
                    <span className="font-mono text-gray-300 bg-white/10 px-2.5 py-0.5 text-[11px]">
                      REF: #{bookingConfirmed.passId}
                    </span>
                  </div>

                  <h5 className="text-base font-bold text-white">
                    {bookingConfirmed.event.title}
                  </h5>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-b border-white/10 py-3">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Pass Holder</span>
                      <span className="font-semibold text-white">{bookingConfirmed.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Quantity</span>
                      <span className="font-semibold text-white">{bookingConfirmed.tickets} Pass(es)</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Total Paid</span>
                      <span className="font-bold text-emerald-400">{formatPrice(bookingConfirmed.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Date</span>
                      <span className="font-medium text-gray-200">{bookingConfirmed.event.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Time</span>
                      <span className="font-medium text-gray-200">{bookingConfirmed.event.time}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Venue</span>
                      <span className="font-medium text-gray-200 truncate">{bookingConfirmed.event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Digital Pass Validated
                    </span>
                    <span>Issued {bookingConfirmed.bookingDate}</span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-none flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print Pass
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-5 py-2.5 rounded-none cursor-pointer transition-colors"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              /* Case B: Reservation Form inside Modal */
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Customer Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Attendee Details
                    </h4>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Summary */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Pass Quantity & Summary
                    </h4>

                    <div className="bg-gray-50 border border-gray-200 rounded-none p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Number of Passes</span>
                        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-none px-2.5 py-1">
                          <button
                            type="button"
                            onClick={() => setTicketCount((prev) => Math.max(1, prev - 1))}
                            className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-black text-sm cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{ticketCount}</span>
                          <button
                            type="button"
                            onClick={() => setTicketCount((prev) => Math.min(10, prev + 1))}
                            className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-black text-sm cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 border-t border-gray-200 pt-2.5 text-xs">
                        <div className="flex justify-between text-gray-600">
                          <span>Price Per Pass</span>
                          <span>{formatPrice(selectedEvent.price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Quantity</span>
                          <span>x {ticketCount}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xs text-gray-900 pt-2 border-t border-gray-200">
                          <span>Total Amount</span>
                          <span className="text-sm text-black">{formatPrice(selectedEvent.price * ticketCount)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        name="specialRequests"
                        rows={2}
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Seating preferences, dietary notes..."
                        className="w-full p-2 border border-gray-300 rounded-none text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-none text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Confirm & Generate E-Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  );
}
