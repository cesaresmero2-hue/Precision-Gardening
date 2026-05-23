import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Sparkles, Calendar, Clock, ArrowRight } from "lucide-react";

export default function ContactForm() {
  const [requestType, setRequestType] = useState<"quote" | "booking">("quote");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceType: "Lawn Mowing & Edging",
    date: "",
    timeSlot: "Morning (8AM - 12PM)",
    message: ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<{ id: string; type: string } | null>(null);

  const servicesList = [
    { value: "Lawn Mowing & Edging", label: "Lawn Mowing & Edging" },
    { value: "Hedge Trimming & Shaping", label: "Hedge Trimming & Shaping" },
    { value: "Garden Tidy-up & Weeding", label: "Garden Tidy-up & Weeding" },
    { value: "Driveway & Patio Jet Wash", label: "Driveway & Patio Jet Wash" },
    { value: "Siding Softwash & Treatment", label: "Siding Softwash & Treatment" },
    { value: "Other / Custom Request", label: "Other / Custom Request" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your name.";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email.";
    }

    if (requestType === "booking") {
      if (!formData.date) {
        errors.date = "Please select a date for your appointment.";
      } else {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          errors.date = "Appointment date cannot be in the past.";
        }
      }
    }
    return errors;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = requestType === "booking" ? "/api/book" : "/api/quote";
      const payload = requestType === "booking"
        ? {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          serviceType: formData.serviceType,
          date: formData.date,
          timeSlot: formData.timeSlot,
          message: formData.message
        }
        : {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          serviceType: formData.serviceType,
          message: formData.message
        };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setTicketDetails({
        id: data.referenceId || "PRC-" + Math.floor(100000 + Math.random() * 900000),
        type: requestType === "booking" ? "Service Appointment" : "Estimate Request"
      });
      setSubmitSuccess(true);
    } catch (err: any) {
      setFormErrors({ submit: "Something went wrong. Please call us directly." });
      // Don't set submitSuccess to true
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      serviceType: "Lawn Mowing & Edging",
      date: "",
      timeSlot: "Morning (8AM - 12PM)",
      message: ""
    });
    setSubmitSuccess(false);
    setTicketDetails(null);
  };

  // Get tomorrow's date formatted as YYYY-MM-DD for min date picker restriction
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <section id="contact" className="py-24 bg-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#1e6fa8] font-bold bg-[#1e6fa8]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Schedule Crew
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-dark-slate tracking-tight mb-4">
            Book a Crew or Request Quote
          </h2>
          <p className="text-zinc-700 leading-relaxed font-light text-base sm:text-lg">
            Choose whether to schedule an instant service slot with our crew or request a custom digital estimate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-stretch">

          {/* Left Sidebar: Service Area & Contact Coordinates */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#1b3a2d] text-cream rounded-2xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div>
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest font-bold">
                  Our Service Coordinates
                </span>
                <h3 className="font-serif text-2xl font-bold mt-2 mb-4 tracking-tight">
                  Galway Base
                </h3>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  We service residential properties in Galway City, Salthill, Oranmore, Barna, Clarinbridge, and Athenry.
                </p>
              </div>

              {/* Styled Mini Coverage Map Overlay */}
              <div className="relative h-44 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 200">
                  <path d="M50 150 Q100 80, 200 130 T350 80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="100" cy="115" r="4" fill="white" />
                  <circle cx="200" cy="130" r="4" fill="white" />
                  <circle cx="300" cy="100" r="4" fill="white" />
                </svg>

                {/* Hub location markers */}
                <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping absolute" />
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full relative" />
                  <span className="font-mono text-[8px] tracking-wider text-zinc-300 mt-1 uppercase">Salthill Hub</span>
                </div>

                <div className="absolute top-1/2 left-2/3 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping absolute" />
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-full relative" />
                  <span className="font-mono text-[8px] tracking-wider text-zinc-300 mt-1 uppercase">Oranmore Hub</span>
                </div>

                <div className="absolute bottom-1/4 left-1/2 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full relative" />
                  <span className="font-mono text-[8px] tracking-wider text-zinc-300 mt-1 uppercase">Barna Hub</span>
                </div>
              </div>

              {/* Direct coordinates */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex items-start space-x-3.5">
                  <div className="bg-white/10 p-2 rounded-lg text-emerald-300 mt-0.5">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Call / Text</h4>
                    <p className="text-base font-bold text-white mt-0.5 hover:text-emerald-400 transition-colors">
                      <a href="tel:+353915550190">+353 (91) 555 0190</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="bg-white/10 p-2 rounded-lg text-emerald-300 mt-0.5">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Email Address</h4>
                    <p className="text-base font-bold text-white mt-0.5 hover:text-emerald-400 transition-colors">
                      <a href="mailto:quotes@precisionexterior.com">quotes@precisionexterior.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="flex items-center space-x-2.5 mb-1.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#1e6fa8]" />
                <span className="font-serif font-bold text-sm">Full Liability Coverage</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                General liability coverage safeguarding masonry layers, garden beds, and botanical structures.
              </p>
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl z-0" />
          </div>

          {/* Right Column: Dynamic Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-primary/10 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!submitSuccess ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFormSubmit}
                  className="space-y-5 text-left"
                  noValidate
                >
                  {/* Selector for Request Type */}
                  <div className="grid grid-cols-2 gap-3 p-1 bg-cream-light border border-zinc-200 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => setRequestType("quote")}
                      className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${requestType === "quote"
                        ? "bg-[#1b3a2d] text-white shadow-sm"
                        : "text-zinc-700 hover:bg-cream"
                        }`}
                    >
                      Request Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestType("booking")}
                      className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${requestType === "booking"
                        ? "bg-[#1b3a2d] text-white shadow-sm"
                        : "text-zinc-700 hover:bg-cream"
                        }`}
                    >
                      Book Crew Slot
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div id="field-fullName">
                      <label htmlFor="fullName" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        placeholder="Sarah Jenkins"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full bg-cream-light border text-zinc-800 placeholder-zinc-400 rounded-xl p-3 text-sm transition-all focus:outline-none ${formErrors.fullName
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                          }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-xs text-rose-500 font-medium flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Phone number */}
                    <div id="field-phone">
                      <label htmlFor="phone" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        placeholder="+353 (91) 555 0190"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full bg-cream-light border text-zinc-800 placeholder-zinc-400 rounded-xl p-3 text-sm transition-all focus:outline-none ${formErrors.phone
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                          }`}
                      />
                      {formErrors.phone && (
                        <p className="text-xs text-rose-500 font-medium flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Email address */}
                    <div id="field-email">
                      <label htmlFor="email" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="sarah.jenkins@outlook.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-cream-light border text-zinc-800 placeholder-zinc-400 rounded-xl p-3 text-sm transition-all focus:outline-none ${formErrors.email
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                          }`}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-rose-500 font-medium flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Service Type Select */}
                    <div>
                      <label htmlFor="service-select" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5">
                        Service Needed
                      </label>
                      <select
                        name="serviceType"
                        id="service-select"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full bg-cream-light border border-zinc-200 text-zinc-800 rounded-xl p-3 text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[46px] cursor-pointer"
                      >
                        {servicesList.map(s => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Booking Date & Time Schedule step */}
                  {requestType === "booking" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-zinc-100"
                    >
                      <div id="field-date">
                        <label htmlFor="date" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-[#1e6fa8]" /> Select Date <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          min={getTomorrowString()}
                          value={formData.date}
                          onChange={handleInputChange}
                          className={`w-full bg-cream-light border text-zinc-800 rounded-xl p-3 text-sm transition-all focus:outline-none ${formErrors.date
                            ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                            : "border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary"
                            }`}
                        />
                        {formErrors.date && (
                          <p className="text-xs text-rose-500 font-medium flex items-center mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            {formErrors.date}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="timeSlot" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-[#1e6fa8]" /> Preferred Time
                        </label>
                        <select
                          name="timeSlot"
                          id="timeSlot"
                          value={formData.timeSlot}
                          onChange={handleInputChange}
                          className="w-full bg-cream-light border border-zinc-200 text-zinc-800 rounded-xl p-3 text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[46px] cursor-pointer"
                        >
                          <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
                          <option value="Afternoon (1PM - 5PM)">Afternoon (1PM - 5PM)</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* Message Area */}
                  <div>
                    <label htmlFor="message" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1.5">
                      {requestType === "booking" ? "Additional Notes or Gate Codes" : "Message & Property Specifications"}
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={2}
                      placeholder={
                        requestType === "booking"
                          ? "Specify any gates, pets, water spigot locations, or timing preferences..."
                          : "List grass type, estimated square footage, or hedge height to help us compile your quote..."
                      }
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-cream-light border border-zinc-200 text-zinc-800 placeholder-zinc-400 rounded-xl p-3 text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full inline-flex items-center justify-center space-x-2.5 bg-primary hover:bg-[#1b3a2d] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all cursor-pointer active:scale-98 ${isSubmitting ? "opacity-90 cursor-not-allowed" : ""
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4.5 h-4.5" />
                          <span className="font-serif text-base">
                            {requestType === "booking" ? "Submit Booking Request" : "Request Free Quote"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* Success Message State */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  <div className="bg-emerald-100 p-3 rounded-full mb-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-pulse" />
                  </div>

                  <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded">
                    Ticket Logged
                  </span>

                  <h3 className="font-serif text-2xl font-bold text-dark-slate mt-3 mb-1">
                    {requestType === "booking" ? "Booking Requested" : "Estimate Logged"}
                  </h3>

                  <p className="text-zinc-700 leading-relaxed font-light max-w-md mb-6 text-xs sm:text-sm">
                    Thank you, <strong>{formData.fullName}</strong>. Your {requestType === "booking" ? "booking request" : "estimate query"} is received. We've sent a notification to your email: <strong>{formData.email}</strong>.
                  </p>

                  {/* Booking Receipt Ticket */}
                  <div className="w-full max-w-xs bg-cream-light border border-zinc-200 rounded-xl p-5 text-left relative overflow-hidden shadow-inner font-mono text-[11px] text-zinc-700">
                    <div className="absolute top-0 right-0 p-3 flex items-center space-x-1 text-emerald-650">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase">
                        {requestType === "booking" ? "Pending Approval" : "Confirmed"}
                      </span>
                    </div>

                    <div className="border-b border-dashed border-zinc-300 pb-3 mb-3">
                      <p className="font-bold text-zinc-900 pb-1 mb-1.5 uppercase tracking-wide">Care Coordination Ticket</p>
                      <p className="flex justify-between"><span>Reference:</span> <strong className="text-zinc-900">{ticketDetails?.id}</strong></p>
                      <p className="flex justify-between"><span>Service:</span> <strong className="text-zinc-950">{formData.serviceType}</strong></p>
                    </div>

                    <div className="space-y-1.5 mb-4 border-b border-dashed border-zinc-300 pb-3">
                      <p className="flex justify-between"><span>Contact:</span> <strong className="text-zinc-950 truncate max-w-[130px]">{formData.fullName}</strong></p>
                      <p className="flex justify-between"><span>Type:</span> <strong className="text-zinc-950">{ticketDetails?.type}</strong></p>
                      {requestType === "booking" && (
                        <>
                          <p className="flex justify-between"><span>Date:</span> <strong className="text-zinc-950">{formData.date}</strong></p>
                          <p className="flex justify-between"><span>Time Slot:</span> <strong className="text-zinc-950">{formData.timeSlot}</strong></p>
                        </>
                      )}
                    </div>

                    <button
                      onClick={resetForm}
                      className="w-full bg-white hover:bg-zinc-50 text-zinc-700 font-semibold py-2 rounded-lg border border-zinc-200 transition-colors text-center cursor-pointer text-xs"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
