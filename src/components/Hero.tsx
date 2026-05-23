import { motion } from "motion/react";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(22, 36, 29, 0.95) 0%, rgba(22, 36, 29, 0.75) 45%, rgba(22, 36, 29, 0.15) 100%), linear-gradient(to top, rgba(22, 36, 29, 0.95) 0%, transparent 40%), url("/images/hero-garden.webp")`,
      }}
    >
      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:py-36 w-full flex items-center">
        <div className="max-w-3xl text-left">
          {/* Subtle Eco-Slogan Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-primary/40 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full mb-6 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#f5f0e8] font-bold">
              Premium Outdoor Care Specialists
            </span>
          </motion.div>

          {/* H1 Heading - Plays Playfair Display */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream tracking-tight leading-tight mb-6"
          >
            Complete Exterior <br className="hidden sm:inline" />
            Care by Precision
          </motion.h1>

          {/* Subheading - Plays DM Sans via font-sans */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-2xl mb-10 h-auto"
          >
            Expert gardening and restorative power washing. We treat your property with organic horticultural methods and deep surface extraction to reveal spotless, lasting brilliance.
          </motion.p>

          {/* Two CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-5"
          >
            <button
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center justify-center space-x-2 bg-accent-blue hover:bg-accent-blue-light text-white font-bold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-accent-blue/30 transition-all duration-300 group cursor-pointer active:scale-98"
            >
              <Calendar className="w-5 h-5 text-zinc-150" />
              <span>Get a Free Quote</span>
            </button>

            <button
              onClick={() => scrollToSection("services")}
              className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/15 text-cream hover:text-white border border-white/20 hover:border-white/40 backdrop-blur-md font-bold text-sm sm:text-base px-8 py-4 rounded-xl transition-all duration-300 group cursor-pointer active:scale-98"
            >
              <span>View Our Services</span>
              <ArrowRight className="w-5 h-5 text-cream group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Dynamic Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 max-w-lg"
          >
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-white">240+</p>
              <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest mt-1">
                Homes Cultivated
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-white">4.9/5</p>
              <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest mt-1">
                Google Rating
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-white">100%</p>
              <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest mt-1">
                On-Time Promise
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
