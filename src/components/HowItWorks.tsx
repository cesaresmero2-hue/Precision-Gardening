import { Calendar, ClipboardCheck, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Calendar,
      title: "Request Your Quote",
      desc: "Fill out our brief online form or call directly to detail your garden size or exterior washing needs.",
    },
    {
      number: "02",
      icon: ClipboardCheck,
      title: "Onsite Assessment",
      desc: "Our directors inspect soil health or masonry layers to compile a fully transparent, flat-rate quote.",
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Pristine Execution",
      desc: "Our certified crews arrive precisely on schedule to restore your property using eco-safe methods.",
    },
  ];

  return (
    <section className="py-24 bg-cream-light border-y border-zinc-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#1e6fa8] font-bold bg-[#1e6fa8]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Our Process
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-dark-slate tracking-tight mb-4">
            How Precision Works
          </h2>
          <p className="text-zinc-700 leading-relaxed font-light text-base sm:text-lg">
            A simple, transparent timeline to bring meticulous order and cleanliness back to your home landscape.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          
          {/* Decorative Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-zinc-200 -translate-y-12 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm relative z-10 flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-primary/5 border border-primary/10 text-primary p-3 rounded-xl">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-3xl font-black text-zinc-200">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-dark-slate mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-zinc-700 font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between text-zinc-600 font-mono text-[10px] uppercase tracking-widest font-black">
                  <span>Step {step.number}</span>
                  {idx < 2 && <ArrowRight className="w-3.5 h-3.5 hidden md:block text-zinc-300" />}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
