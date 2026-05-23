import { Star, Quote } from "lucide-react";
import { motion } from "motion/react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Marcus V.",
      location: "Salthill, Galway",
      service: "Lawn Cultivation & Edge Lining",
      rating: 5,
      quote: "Our lawn has never looked this crisp. The team at Precision uses actual mechanical edge guides, not just hand-trimmers. It completely changed the clean lines around our flower beds.",
    },
    {
      name: "Sarah L.",
      location: "Oranmore, Galway",
      service: "Driveway & Patio Restoration",
      rating: 5,
      quote: "Years of mildew and dark stains on our brick patio disappeared in a single afternoon. The pressure washing was deep but completely safe for our garden plants. Highly recommend!",
    },
    {
      name: "David K.",
      location: "Barna, Galway",
      service: "Hedge Trimming & Pruning",
      rating: 5,
      quote: "Meticulous work. They pruned our boxwood hedges to absolute straightness and spent an extra 30 minutes cleaning up every last leaf clipping. Real professionals.",
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Client Voices
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-dark-slate tracking-tight mb-4">
            Trusted by Galway Homeowners
          </h2>
          <p className="text-zinc-700 leading-relaxed font-light text-base sm:text-lg">
            Real homeowners share their experiences with our precision-based garden management and power washing restorations.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-primary/5 relative hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Quote Icon Background */}
                <div className="absolute top-6 right-6 text-zinc-100 select-none">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Rating stars */}
                <div className="flex items-center space-x-1 mb-6 relative z-10">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-zinc-700 leading-relaxed font-light text-sm sm:text-base relative z-10 italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-4 mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-dark-slate">
                    {review.name}
                  </h3>
                  <p className="font-sans text-xs text-zinc-700 mt-0.5">
                    {review.location}
                  </p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {review.service}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
