import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "Are you fully licensed and insured?",
      answer: "Yes, absolutely. Precision Gardening & Power Washing is a legally registered entity backed by a $2,000,000 general liability insurance policy. This fully protects your property, paving, and landscapes during all maintenance visits.",
    },
    {
      question: "What makes your lawn care 'precision' instead of standard?",
      answer: "We utilize commercial-grade, razor-sharp blades that clean-cut the grass blades instead of shredding them (which turns grass yellow). Additionally, we customize the cut height according to current soil moisture levels and season, and use mechanical edge-rollers for perfectly straight line division.",
    },
    {
      question: "Will power washing damage my siding, deck, or plants?",
      answer: "No. We utilize a split technique: High-Pressure for hard, dense surfaces like brick driveways or concrete slabs, and a Low-Pressure 'Softwash' combined with bio-degradable chemical neutralizers for siding, roofs, and delicate wood decks. This removes mold completely without risking structural damage.",
    },
    {
      question: "Do I need to be home for the assessment or service?",
      answer: "No. As long as our crews have clear access to the exterior of your property (gates unlocked, pets kept indoors), we can conduct the entire quote assessment and service visit without you needing to take time off work. We will send digital photo logs immediately upon completion.",
    },
    {
      question: "How are your pricing packages calculated?",
      answer: "Our pricing is transparent, calculated by flat square-footage rates for power washing, and flat seasonal service slots for lawn care. This ensures there are never hourly overruns or surprise fees. You receive a final, firm quote before any work starts.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-cream relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Common Inquiries
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-dark-slate tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-700 leading-relaxed font-light text-base sm:text-lg">
            Find immediate answers regarding our credentials, safety protocols, scheduling, and billing systems.
          </p>
        </div>

        {/* FAQ List Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between space-x-4 cursor-pointer hover:bg-zinc-50 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-dark-slate">
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-full ${isOpen ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-600"}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 border-t border-zinc-200">
                        <p className="text-sm sm:text-base text-zinc-700 font-light leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
