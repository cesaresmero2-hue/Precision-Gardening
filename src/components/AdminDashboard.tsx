import React, { useState, useEffect } from "react";
import { 
  Lock, Key, Mail, LogOut, CheckCircle2, XCircle, AlertCircle, 
  Trash2, Search, Download, Calendar, Clock, DollarSign, 
  TrendingUp, Sparkles, RefreshCw, ChevronRight, User, Phone, Edit2, Check, X
} from "lucide-react";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  timeSlot: string;
  message: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
}

// Average price model to construct financial metrics
const SERVICE_ESTIMATES: Record<string, number> = {
  "Lawn Mowing & Edging": 95,
  "Driveway & Patio Jet Wash": 280,
  "Hedge Trimming & Shaping": 150,
  "Siding Softwash & Treatment": 395
};

export default function AdminDashboard() {
  // Authentication states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "dashboard">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [otpSignature, setOtpSignature] = useState<{ signature: string; expiry: number } | null>(null);

  // Dashboard states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("Morning (8AM - 12PM)");

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send passcode");

      setOtpSignature({ signature: data.signature, expiry: data.expiry });
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !otpSignature) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: otp,
          signature: otpSignature.signature,
          expiry: otpSignature.expiry
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify passcode");

      localStorage.setItem("admin_token", data.token);
      setToken(data.token);
      setStep("dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        throw new Error(data.error || "Failed to load bookings");
      }
      setBookings(data.bookings || []);
      setIsFallback(data.isFallback || false);
      setStep("dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: Booking["status"]) => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "update-status",
          bookingId,
          updatedData: { status }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings(data.bookings);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !rescheduleTarget || !newDate || !newSlot) return;
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "reschedule",
          bookingId: rescheduleTarget.id,
          updatedData: { date: newDate, timeSlot: newSlot }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings(data.bookings);
      setRescheduleTarget(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking permanently?")) return;
    if (!token) return;
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "delete",
          bookingId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings(data.bookings);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setStep("email");
    setEmail("");
    setOtp("");
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Service", "Date", "Slot", "Status", "Created At"];
    const rows = bookings.map(b => [
      b.id,
      b.name,
      b.email,
      b.phone,
      b.service,
      b.date,
      b.timeSlot,
      b.status,
      b.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `precision_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics calculations
  const totalBookings = bookings.length;
  const pendingJobs = bookings.filter(b => b.status === "Pending").length;
  const confirmedJobs = bookings.filter(b => b.status === "Confirmed").length;
  const projectedRevenue = bookings
    .filter(b => b.status !== "Cancelled")
    .reduce((sum, b) => sum + (SERVICE_ESTIMATES[b.service] || 150), 0);

  // Filtering
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-cream font-sans selection:bg-accent-blue selection:text-white">
      {/* Login Screens */}
      {(!token || step !== "dashboard") && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-primary/5 shadow-2xl rounded-2xl p-8 relative overflow-hidden">
            
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent-blue" />
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full" />
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/5 text-primary mb-4 border border-primary/10">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-emerald-950">Precision Admin Portal</h1>
              <p className="text-xs text-gray-500 mt-1">Authorized access to crew scheduling only</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-[10px] uppercase font-bold tracking-widest font-mono text-gray-500 mb-2">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="admin@precisionexterior.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-950 text-cream py-3 rounded-lg text-xs uppercase tracking-wider font-bold hover:bg-primary transition duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-primary/10 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-[10px] uppercase font-bold tracking-widest font-mono text-gray-500 mb-2">
                    Enter One-Time Passcode
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-gray-50 text-center tracking-[8px] font-mono font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    We sent a temporary access code to <strong className="text-gray-600">{email}</strong>.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-1/3 border border-gray-200 text-gray-600 py-3 rounded-lg text-xs font-bold hover:bg-gray-50 transition duration-200 cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-emerald-950 text-cream py-3 rounded-lg text-xs uppercase tracking-wider font-bold hover:bg-primary transition duration-200 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Verify & Access</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Admin Dashboard View */}
      {token && step === "dashboard" && (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-gray-400">Admin Control Room</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-emerald-950 mt-1">Crew Schedule & Bookings</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchBookings}
                disabled={loading}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition duration-150 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition duration-150 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Database Fallback Warning Banner */}
          {isFallback && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">In-Memory Mock Database Active</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Bookings will reset on server cold starts. To enable global persistent storage, connect a <strong>Vercel KV (Redis)</strong> database in your Vercel Dashboard settings.
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2.5 py-1 rounded font-bold uppercase self-start sm:self-center">
                Dev Mode
              </div>
            </div>
          )}

          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-gray-400">Total Bookings</span>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mt-1">{totalBookings}</h3>
              </div>
              <div className="p-3 bg-gray-50 text-gray-500 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-gray-400">Pending Approval</span>
                <h3 className="text-2xl font-serif font-bold text-amber-600 mt-1">{pendingJobs}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-gray-400">Confirmed Jobs</span>
                <h3 className="text-2xl font-serif font-bold text-emerald-800 mt-1">{confirmedJobs}</h3>
              </div>
              <div className="p-3 bg-green-50 text-emerald-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-gray-400">Projected Pipeline</span>
                <h3 className="text-2xl font-serif font-bold text-accent-blue mt-1">${projectedRevenue}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-accent-blue rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filtering and Search Actions */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, reference ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button 
                onClick={handleExportCSV}
                className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-emerald-950 transition duration-150 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Data Grid Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">Reference ID</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Service Needed</th>
                    <th className="px-6 py-4">Schedule Slots</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        No bookings match your current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">
                          {b.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{b.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex flex-col space-y-0.5">
                            <span className="flex items-center"><Phone className="w-2.5 h-2.5 mr-1" /> {b.phone}</span>
                            <span className="flex items-center"><Mail className="w-2.5 h-2.5 mr-1" /> {b.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-emerald-950">{b.service}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Est: ${SERVICE_ESTIMATES[b.service] || 150}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center font-medium text-gray-800">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {b.date}
                          </div>
                          <div className="flex items-center text-[10px] text-gray-400 mt-1">
                            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {b.timeSlot}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            b.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            b.status === "Confirmed" ? "bg-green-50 text-green-700 border border-green-200" :
                            b.status === "Completed" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {b.status === "Pending" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "Confirmed")}
                                className="p-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition"
                                title="Approve Booking"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {b.status === "Confirmed" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "Completed")}
                                className="p-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                                title="Mark Completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {b.status !== "Cancelled" && b.status !== "Completed" && (
                              <>
                                <button
                                  onClick={() => {
                                    setRescheduleTarget(b);
                                    setNewDate(b.date);
                                    setNewSlot(b.timeSlot);
                                  }}
                                  className="p-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                                  title="Reschedule Booking"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleUpdateStatus(b.id, "Cancelled")}
                                  className="p-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                                  title="Cancel Booking"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 bg-white text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Notes display */}
          {filteredBookings.some(b => b.message) && (
            <div className="mt-8 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-gray-400 mb-3">Service Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookings.filter(b => b.message).map(b => (
                  <div key={b.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5 font-semibold text-emerald-950">
                      <span>{b.name} ({b.id})</span>
                      <span className="text-[10px] text-gray-400">{b.service}</span>
                    </div>
                    <p className="text-gray-600 italic">"{b.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal Overlay */}
      {rescheduleTarget && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-serif font-bold text-emerald-950 mb-1">Reschedule Job</h3>
            <p className="text-xs text-gray-500 mb-4">Adjust scheduling parameters for {rescheduleTarget.name} ({rescheduleTarget.id}).</p>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">New Time Slot</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                >
                  <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
                  <option value="Afternoon (1PM - 5PM)">Afternoon (1PM - 5PM)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="w-1/2 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-950 text-cream rounded-lg text-xs font-bold hover:bg-primary transition cursor-pointer text-center"
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
