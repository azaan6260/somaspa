import { useState, FormEvent } from "react";
import { Booking, Service, Therapist } from "../types";
import { X, Calendar, Clock, User, MessageSquare, Phone, Mail, Sparkles, CheckCircle2, Ticket } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  therapists: Therapist[];
  preselectedService?: string;
  onBookingSuccess: () => void;
  customLogoUrl?: string | null;
}

export default function BookingModal({
  isOpen,
  onClose,
  services,
  therapists,
  preselectedService = "",
  onBookingSuccess,
  customLogoUrl
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: preselectedService || (services[0]?.name || ""),
    date: "",
    time: "",
    therapist: "Any Available Therapist",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setConfirmedBooking(data);
        onBookingSuccess();
      } else {
        throw new Error(data.error || "Failed to confirm your booking. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  return (
    <div id="booking-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fade-in">
      <div 
        id="booking-modal-content" 
        className="bg-white border border-indigo-100 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up"
      >
        {/* Close Button */}
        <button
          id="close-booking-modal"
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-indigo-600 hover:text-white p-2 rounded-full text-slate-700 transition-all duration-300 z-10 border border-slate-100 shadow-sm animate-pulse"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Confirmation Screen */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-6 border border-green-200">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            
            <span className="text-[11px] font-mono tracking-widest text-indigo-600 uppercase font-bold mb-1">
              Booking Confirmed
            </span>
            <h2 className="font-serif text-3xl font-semibold text-slate-900 tracking-wide mb-2">
              Namaste, {confirmedBooking.name}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-8">
              Your therapeutic escape at SOMA Spa and Wellness Center has been secured. A confirmation summary has been logged below. We look forward to offering you divine tranquility.
            </p>

            {/* Premium Digital Voucher */}
            <div className="bg-indigo-50/40 border-2 border-dashed border-indigo-200 rounded-2xl p-6 w-full text-left max-w-sm relative shadow-sm overflow-hidden mb-8">
              {/* Card Notch */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border-r border-indigo-200/50" />
              <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border-l border-indigo-200/50" />
              
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-indigo-100">
                <div className="flex items-center space-x-2">
                  {customLogoUrl ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={customLogoUrl} 
                      className="w-5 h-5 object-contain rounded-md" 
                      alt="Logo" 
                    />
                  ) : (
                    <Ticket className="w-4 h-4 text-indigo-500" />
                  )}
                  <span className="font-serif font-bold text-slate-800">SOMA Spa Ticket</span>
                </div>
                <span className="font-mono text-xs text-indigo-600 uppercase font-bold">
                  {confirmedBooking.id}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] font-mono text-indigo-500 uppercase">Therapy Session</p>
                  <p className="font-serif font-semibold text-slate-900">{confirmedBooking.service}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-mono text-indigo-500 uppercase">Date</p>
                    <p className="font-medium text-slate-800">{confirmedBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-indigo-500 uppercase">Time</p>
                    <p className="font-medium text-slate-800">{confirmedBooking.time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-indigo-500 uppercase">Specialist</p>
                  <p className="font-medium text-slate-800">{confirmedBooking.therapist}</p>
                </div>
                {confirmedBooking.notes && (
                  <div>
                    <p className="text-[10px] font-mono text-indigo-500 uppercase">Special instructions</p>
                    <p className="text-xs text-slate-600 italic">"{confirmedBooking.notes}"</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
            >
              Back to Website
            </button>
          </div>
        ) : (
          /* Booking Form */
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <span className="text-[11px] font-mono tracking-widest text-indigo-600 uppercase font-bold">
                Online Reservation
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-wide mt-1">
                Schedule Tranquility
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Reserve your custom holistic wellness therapy at our premium Indore center.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input
                      type="tel"
                      required
                      pattern="^[0-9\s\+\-]{10,15}$"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                  Choose Spa Treatment
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.name}>
                      {srv.name} ({srv.duration} - {srv.price} INR)
                    </option>
                  ))}
                </select>
              </div>

              {/* Therapist Selection */}
              <div>
                <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                  Preferred Specialist
                </label>
                <select
                  value={formData.therapist}
                  onChange={(e) => setFormData({ ...formData, therapist: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                >
                  <option value="Any Available Therapist">Any Available Therapist (Recommended)</option>
                  {therapists.map((th) => (
                    <option key={th.id} value={th.name}>
                      {th.name} ({th.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                    Appointment Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                    <input
                      type="date"
                      required
                      min={minDateStr}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                    Preferred Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                    <select
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="">Select Time Slot</option>
                      <option value="09:00 AM">09:00 AM (Early serene slot)</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:30 PM">07:30 PM (Evening tranquility)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1.5 font-bold">
                  Custom Request or Health Conditions
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-indigo-500" />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="E.g., Prefers firm pressure, pregnant, shoulder injuries, allergic to lavender oils, sandalwood preferences..."
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <p className="text-[11px] text-slate-500 text-center py-1">
                By reserving, you agree to our friendly cancellation policy. We'll hold your spot for 15 minutes past the scheduled time.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Tranquil Appointment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
