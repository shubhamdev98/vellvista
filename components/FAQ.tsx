"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Are your perfumes 100% authentic?",
    answer: "Absolutely. At Vellvista, authenticity is our highest priority. All our fragrances and products are sourced directly from the brands themselves or their authorized distributors, ensuring 100% genuine luxury products.",
  },
  {
    question: "How long do the fragrances typically last?",
    answer: "Our curated selection features Eau de Parfum (EDP) and Parfum concentrations, which generally last between 6 to 8 hours. However, longevity can vary depending on skin type, climate, and the specific fragrance notes.",
  },
  {
    question: "How should I store my perfume to preserve its quality?",
    answer: "We recommend storing your perfumes in a cool, dry place away from direct sunlight, heat, and humidity (avoid bathrooms). Extreme temperature fluctuations and light can break down the delicate scent molecules over time.",
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a 15-day return policy for unused, unopened, and undamaged items in their original packaging. If you receive a damaged or incorrect product, please contact our customer support team immediately.",
  },
  {
    question: "How can I track my shipment?",
    answer: "Once your order is processed and shipped, you will receive a tracking link via email. You can also monitor your order status directly from the 'Orders' section in your account dashboard.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white border-t border-default">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-secondary max-w-xl mx-auto font-light">
            Got questions about our fragrances, ordering process, or authenticity? We have answers.
          </p>
        </div>

        <div className="border-t border-default divide-y divide-default">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-5 text-left text-primary hover:text-opacity-80 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg sm:text-xl font-medium tracking-tight text-primary">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-48 pb-5" : "max-h-0"
                  } overflow-hidden`}
                >
                  <div className="text-sm sm:text-base text-secondary leading-relaxed font-light pr-8">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
