import React, { useState } from "react";
import { ArrowUp, Instagram, Facebook, Sparkles } from "lucide-react";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

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
        behavior: "smooth"
      });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-dark-slate text-cream border-t border-primary-light/10 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-12 mb-12">

          {/* Column 1: Logo and Coordinates */}
          <div className="md:col-span-5 flex flex-col items-start text-left space-y-4">
            <div
              onClick={() => scrollToSection("home")}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <img
                  src="/images/favicon.webp"
                  alt="Precision Logo"
                  width="40"
                  height="40"
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  Precision
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold block mt-0.5">
                  Exterior Care Specialists
                </span>
              </div>
            </div>

            <p className="text-[#f5f0e8]/70 font-light text-xs sm:text-sm max-w-sm leading-relaxed">
              Serving Galway City, Oranmore, Salthill, Barna, and surrounding Co. Galway properties. We combine biological turf trimming with deep pressure washing restorations.
            </p>

            <div className="flex space-x-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-2 transition-colors text-[#f5f0e8]"
                aria-label="Facebook Profile"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-2 transition-colors text-[#f5f0e8]"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 flex flex-col items-start text-left">
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold mb-6 border-b border-white/5 pb-2 w-full">
              Navigation
            </p>
            <div className="space-y-3 flex flex-col items-start text-sm text-zinc-300">
              <button
                onClick={() => scrollToSection("home")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Our Services
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Our Standards
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Frequently Asked
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact Coordinates
              </button>
            </div>
          </div>

          {/* Column 3: Newsletter SignUp */}
          <div className="md:col-span-4 flex flex-col items-start text-left space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2 border-b border-white/5 pb-2 w-full">
              Seasonal Guides
            </p>
            <p className="text-zinc-300 font-light text-xs leading-relaxed">
              Subscribe to receive brief spring mulching schedules and cold weather brick preservation tips.
            </p>

            {!subscribed ? (
              <form onSubmit={handleNewsletterSubmit} className="w-full flex">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 text-cream text-xs p-3 rounded-l-xl focus:outline-none focus:border-emerald-400 placeholder-zinc-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 rounded-r-xl font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            ) : (
              <div className="bg-white/5 border border-emerald-500/20 text-emerald-400 rounded-xl p-3.5 text-xs w-full">
                <strong>Checklist subscription logged!</strong> Look out for our upcoming seasonal guide.
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-[9px] text-zinc-400 font-mono tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>SPAM-FREE GUARANTEE</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-4">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Precision Gardening & Power Washing. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="#admin"
              className="hover:text-white transition-colors uppercase tracking-wider text-[10px] font-bold"
            >
              Admin Portal
            </a>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => scrollToSection("home")}
              className="inline-flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
