"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useFaqs } from "../app/hooks/useApi";

export default function FaqSection() {
  const { data: faqData, isLoading } = useFaqs();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (isLoading || !faqData || faqData.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="pb-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16 font-inter">
          <p className="font-label-caps text-xs text-secondary-dark tracking-[0.25em] mb-3 font-semibold uppercase">
            Customer Care
          </p>
          <h2 className="font-headline-xl text-3xl md:text-4xl font-normal font-manrope text-primary leading-tight tracking-wide">
            Frequently Asked Questions
          </h2>
          <div className="w-12 h-px bg-primary/20 mx-auto" />
        </div>

        {/* FAQ Accordion List */}
        <div className="border-t border-dark/20 divide-y divide-dark/10">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.id || index} className="py-5 sm:py-6 group">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-manrope text-base sm:text-lg font-medium text-primary tracking-wide transition-colors duration-300 group-hover:text-primary/70">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-primary/60 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-inter text-sm sm:text-base text-secondary leading-relaxed font-light pr-6">
                      {item.answer}
                    </p>
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
