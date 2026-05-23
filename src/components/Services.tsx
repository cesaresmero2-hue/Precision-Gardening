import { useState } from "react";
import { motion } from "motion/react";
import { Leaf, Droplet, CheckCircle2, ArrowRight, Shield } from "lucide-react";

export default function Services() {
  const gardeningServices = [
    {
      title: "Precision Lawn Mowing & Edging",
      desc: "Perfect razor-cut mowing with dynamic height selection matched to seasonal grass health. Includes pristine mechanical clipping borders for perfect edge lines.",
      time: "Weekly / Bi-weekly",
    },
    {
      title: "Hedge Trimming & Shaping",
      desc: "Artistic topiary pruning, hedge thinning, and structural wall training. We trim with absolute straightness and collect all micro-clippings.",
      time: "Seasonal / Standard",
    },
    {
      title: "Garden Tidy-ups & Weed Control",
      desc: "Thorough organic soil weeding, flowerbed design curation, systemic non-toxic pre-emergent weed protection, and fresh organic mulching.",
      time: "Onetime / Custom",
    }
  ];

  const washingServices = [
    {
      title: "Driveways, Patios & Walkways",
      desc: "Deep high-pressure concrete extraction to purge decades of motor oil, tire marks, grime, and environmental black-spores.",
      time: "Standard Jet Wash",
    },
    {
      title: "Deck Restoration",
      desc: "Specialized gentle wood scrubbing, moss-purging soft washing, and professional prep for weather sealing or oiling.",
      time: "Soft-Pretreated Wash",
    },
    {
      title: "Exterior Wall & Siding Cleaning",
      desc: "Safe, low-pressure chemical-free siding bath targeting soot, pollen buildup, dust, and environmental staining.",
      time: "Gentle Softwash",
    },
    {
      title: "Moss & Algae Removal",
      desc: "Lichen stripping and bio-active prevention barriers that discourage slippery micro-algae growth for up to 18 months.",
      time: "Pre-treated & Cleaned",
    }
  ];

  const scrollToContact = (serviceName?: string) => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      const formSelect = document.getElementById("service-select") as HTMLSelectElement;
      if (formSelect && serviceName) {
        formSelect.value = serviceName;
        const event = new Event("change", { bubbles: true });
        formSelect.dispatchEvent(event);
      }

      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = contactSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="services" className="py-24 bg-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            What We Do
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-dark-slate tracking-tight mb-4">
            Professional Exterior Cultivation & Refinement
          </h2>
          <p className="text-zinc-700 leading-relaxed font-light text-base sm:text-lg">
            We operate at the intersection of nature and meticulous mechanical excellence, offering two core specialized disciplines.
          </p>
        </div>

        {/* Stacked Layout Section */}
        <div className="space-y-24">
          
          {/* Discipline 1: Gardening Services */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] lg:aspect-auto lg:h-[500px]"
            >
              <img
                src="/images/gardening-service.webp"
                alt="Professional gardening hedge shaping and lawn maintenance"
                width="800"
                height="800"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-slate/60 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center space-x-3 text-white">
                <div className="bg-primary p-2.5 rounded-lg shadow">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-300 font-bold block">Discipline A</span>
                  <h3 className="font-serif text-xl font-bold">Lawn & Garden Cultivation</h3>
                </div>
              </div>
            </motion.div>

            {/* List Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div>
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-black block mb-2">Horticultural Standards</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-dark-slate">Precision Garden Maintenance</h3>
                <p className="text-zinc-700 font-light mt-3 leading-relaxed">
                  We shape hedges, manage weeds, and groom lawns with extreme care. Our techniques are designed to preserve plant lifespan, protect soil nutrition, and maintain clean lines.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200">
                {gardeningServices.map((service, idx) => (
                  <div
                    key={idx}
                    onClick={() => scrollToContact(service.title.split(" & ")[0])}
                    className="flex items-start space-x-3.5 group cursor-pointer p-2.5 rounded-xl hover:bg-white transition-all duration-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-primary group-hover:text-emerald-700 transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-600 font-light mt-1">
                        {service.desc}
                      </p>
                      <span className="inline-block bg-primary/5 text-primary font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded mt-2">
                        {service.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => scrollToContact("Lawn Mowing")}
                  className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-light text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-colors group cursor-pointer"
                >
                  <span>Book Gardening Care</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Discipline 2: Power Washing Services */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* List Column (Desktop Left) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left order-2 lg:order-1"
            >
              <div>
                <span className="font-mono text-[10px] text-accent-blue uppercase tracking-widest font-black block mb-2">Restorative Standards</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-dark-slate">Deep Power Washing & Softwashing</h3>
                <p className="text-zinc-700 font-light mt-3 leading-relaxed">
                  We clean masonry, siding, and wood decks. We adjust pressure levels dynamically to eliminate dirt, black mold, and lichen stains without cracking concrete or scoring soft wood.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200">
                {washingServices.map((service, idx) => (
                  <div
                    key={idx}
                    onClick={() => scrollToContact(service.title.split(",")[0])}
                    className="flex items-start space-x-3.5 group cursor-pointer p-2.5 rounded-xl hover:bg-white transition-all duration-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-primary group-hover:text-accent-blue transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-600 font-light mt-1">
                        {service.desc}
                      </p>
                      <span className="inline-block bg-sky-50 text-accent-blue font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded mt-2">
                        {service.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => scrollToContact("Driveway Washing")}
                  className="inline-flex items-center space-x-2 bg-accent-blue hover:bg-accent-blue-light text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-colors group cursor-pointer"
                >
                  <span>Book Restorative Washing</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Image Column (Desktop Right) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] lg:aspect-auto lg:h-[500px] order-1 lg:order-2"
            >
              <img
                src="/images/power-washing-action.webp"
                alt="Professional power washer cleaning brick patio surfaces"
                width="800"
                height="800"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-slate/60 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center space-x-3 text-white">
                <div className="bg-accent-blue p-2.5 rounded-lg shadow">
                  <Droplet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-sky-300 font-bold block">Discipline B</span>
                  <h3 className="font-serif text-xl font-bold">Jet Washing & Siding Care</h3>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Eco-Friendly Pledge banner */}
        <div className="mt-20 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between text-left shadow-sm">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-primary/10 rounded-xl p-3 flex-shrink-0 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-dark-slate">Biodegradable Chemical Neutralizers</h4>
              <p className="text-sm text-zinc-650 font-light mt-1">
                We commit to zero harsh residues. Our washing solutions decompose entirely without harming plants, pets, or lawn soils.
              </p>
            </div>
          </div>
          <button
            onClick={() => scrollToContact()}
            className="w-full md:w-auto bg-transparent border border-zinc-300 text-dark-slate hover:bg-zinc-50 font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer text-center text-sm active:scale-98"
          >
            Learn More
          </button>
        </div>

      </div>
    </section>
  );
}
