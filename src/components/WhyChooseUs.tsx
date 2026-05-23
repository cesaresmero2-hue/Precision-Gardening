import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { ShieldCheck, Target, Clock } from "lucide-react";

function Counter({
  value,
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  // ✅ FIXED: margin "0px" so it triggers reliably on mobile viewports
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;

    let frame: number;
    const startTime = performance.now();
    const totalMs = duration * 1000;

    // ✅ ENHANCED: rAF-based animation — no timer drift, syncs with display refresh
    const animate = (now: number) => {
      const elapsed = now - startTime;
      // Ease-out curve: fast start, smooth finish
      const progress = Math.min(elapsed / totalMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const standards = [
  {
    icon: ShieldCheck,
    title: "Certified Environmental Care",
    desc: "Our equipment operates on refined low-emission engines, and our cleaning formulas are 100% biodegradable, safeguarding local waters.",
  },
  {
    icon: Target,
    title: "Meticulous Micro-Clippings Trim",
    desc: "We collect all micro-clippings to avoid thatch buildup and perform clean razor-cuts to prevent grass tip browning.",
  },
  {
    icon: Clock,
    title: "Committed to On-Time Arrival",
    desc: "We provide tight, realistic arrival slots and notify you when our crew is 15 minutes away, respecting your home schedule.",
  },
];

const stats = [
  { value: 247, suffix: "", label: "Homes Cultivated" },
  { value: 98, suffix: "%", label: "Punctual Arrival" },
  { value: 18, suffix: "k+", label: "Sq Ft Cleaned" },
  { value: 100, suffix: "%", label: "Eco-Safe Materials" },
];

export default function WhyChooseUs() {
  return (
    <section
      id="about"
      className="py-24 bg-[#1b3a2d] text-cream relative overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-700/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 text-left space-y-8"
          >
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold bg-white/10 px-3.5 py-1.5 rounded-full inline-block">
                Our Standards
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Setting the Benchmark in{" "}
                <span className="text-emerald-400">Exterior Care</span>
              </h2>
              <p className="text-zinc-300 leading-relaxed font-light text-base sm:text-lg">
                We operate at high technical standards. Every service slot is
                handled with professional-grade tools and organic garden safety
                practices.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="space-y-1.5"
                >
                  <div className="font-serif text-4xl sm:text-5xl font-bold text-white tabular-nums">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-4">
            {standards.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  // ✅ FIXED: margin "0px" on cards too — "-100px" was hiding cards on mobile
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="group bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 hover:bg-white/8 hover:border-emerald-500/30 transition-all duration-300 flex flex-col sm:flex-row items-start gap-5 text-left cursor-default"
                >
                  <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-emerald-100 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400 font-light leading-relaxed text-sm sm:text-base">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}