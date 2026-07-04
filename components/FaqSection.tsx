"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy on all unopened, unused beauty and fragrance products. Items must be returned in their original luxury packaging to be eligible for a refund."
  },
  {
    question: "Are your products cruelty-free and vegan?",
    answer: "Yes, all Vellvista products are 100% cruelty-free and never tested on animals. The majority of our formulas are also 100% vegan, which is highlighted in the product description."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order has been dispatched, you will receive a shipping confirmation email containing a tracking link. You can also view your order status by logging into your account."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship worldwide. Shipping rates, custom duties, and estimated delivery timelines are calculated automatically at checkout based on your country."
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach our dedicated concierge team by emailing support@vellvista.com or by submitting an inquiry through our Contact page. We strive to respond within 24 hours."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="pb-5 bg-background">
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
              <div key={index} className="py-5 sm:py-6 group">
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
