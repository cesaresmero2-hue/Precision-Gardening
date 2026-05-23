import { ShieldCheck, Award, BadgeCheck, Clock } from "lucide-react";
import { motion } from "motion/react";

export default function TrustBar() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "$2M Liability Insured",
      desc: "Complete property protection",
    },
    {
      icon: Award,
      title: "Eco-Friendly Safe Certified",
      desc: "Non-toxic chemical neutralizers",
    },
    {
      icon: BadgeCheck,
      title: "100% Satisfaction Guarantee",
      desc: "We make it right, guaranteed",
    },
    {
      icon: Clock,
      title: "On-Time Arrival Promise",
      desc: "Reliable scheduling & execution",
    },
  ];

  return (
    <section className="bg-white border-y border-zinc-200 py-8 relative z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-start space-x-3 text-left"
              >
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-sans font-bold text-sm sm:text-base text-dark-slate">
                    {item.title}
                  </p>
                  <p className="font-sans text-xs text-zinc-700 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
