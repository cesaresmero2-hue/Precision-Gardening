import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import HowItWorks from "./components/HowItWorks";
import WhyChooseUs from "./components/WhyChooseUs";
import BeforeAfter from "./components/BeforeAfter";
import FAQ from "./components/FAQ";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === "#admin");

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === "#admin");
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (isAdmin) {
    return (
      <div className="relative min-h-screen bg-cream selection:bg-accent-blue selection:text-white overflow-x-hidden">
        {/* Floating Navbar with Return Option */}
        <header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 bg-white/80 backdrop-blur-md shadow-lg border border-primary/5 rounded-xl z-50 p-4 flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2">
            <span className="font-serif text-lg font-bold tracking-tight text-[#1b3a2d]">
              Precision Gardening & Power Washing
            </span>
          </a>
          <a
            href="#"
            className="bg-emerald-950 hover:bg-primary text-cream text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-lg shadow transition duration-200"
          >
            Return to Site
          </a>
        </header>
        
        {/* Spacer for navbar */}
        <div className="pt-24">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cream selection:bg-accent-blue selection:text-white overflow-x-hidden">
      
      {/* Skip to main content link for keyboard users */}
      <a
        href="#services"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2.5 rounded-lg z-[100] font-sans font-bold text-xs uppercase tracking-wider shadow-lg"
      >
        Skip to main content
      </a>

      {/* Seasonal Promo Banner — fixed at very top, above navbar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-950 via-[#1b3a2d] to-emerald-950 text-cream text-[10px] sm:text-xs font-semibold py-2.5 px-4 text-center border-b border-white/5 z-[60]">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <span className="inline-flex items-center bg-accent-blue text-white rounded px-1.5 py-0.5 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold font-mono">
            Seasonal Promo
          </span>
          <span className="font-light tracking-wide text-zinc-150">
            Book an early-summer <strong>Lawn Cultivation Package</strong> & receive <strong>15% off</strong> any concrete or siding Jet Wash!
          </span>
          <button
            onClick={() => {
              const element = document.getElementById("contact");
              if (element) {
                const offset = 90;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = element.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
              }
            }}
            className="underline hover:text-white font-bold ml-1 cursor-pointer"
          >
            Claim Spot
          </button>
        </div>
      </div>

      {/* Spacer to push content below the fixed promo banner (~40px) */}
      <div className="h-10" />

      {/* Floating Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        {/* Hero Landing */}
        <Hero />

        {/* Trust Badges Bar */}
        <TrustBar />

        {/* Services & Catalog */}
        <Services />

        {/* Testimonials Review Cards */}
        <Testimonials />

        {/* Process Timeline */}
        <HowItWorks />

        {/* Core Standards & Counter Stats */}
        <WhyChooseUs />

        {/* Before / After comparison slider */}
        <BeforeAfter />

        {/* FAQ Accordion */}
        <FAQ />

        {/* Quote Form */}
        <ContactForm />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
