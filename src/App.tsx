import { useState, useEffect, FormEvent } from "react";
import { SERVICES, THERAPISTS, REVIEWS } from "./data";
import { Booking, Service, Therapist, Review, SpaMetadata } from "./types";
import Navbar from "./components/Navbar";
import ServiceCard from "./components/ServiceCard";
import AIConsultant from "./components/AIConsultant";
import BookingModal from "./components/BookingModal";
import AdminDashboard from "./components/AdminDashboard";
import { LogoStudio } from "./components/LogoStudio";
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Heart, 
  Coffee, 
  Music, 
  Flame, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  Plus,
  Compass,
  ArrowRight,
  BookmarkCheck
} from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Dynamic server-side DB state
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [therapists, setTherapists] = useState<Therapist[]>(THERAPISTS);
  const [metadata, setMetadata] = useState<SpaMetadata | null>(null);
  const [newReview, setNewReview] = useState({ name: "", comment: "", rating: 5, service: SERVICES[0].name });
  const [customLogoUrl, setCustomLogoUrl] = useState<string | undefined>(undefined);

  const fetchLogoStatus = async () => {
    try {
      const res = await fetch("/api/logo-status");
      if (res.ok) {
        const data = await res.json();
        if (data.hasCustomLogo) {
          // Add a cache busting query parameter to force dynamic update
          setCustomLogoUrl(`${data.logoSmallUrl}?t=${Date.now()}`);
        } else {
          setCustomLogoUrl(undefined);
        }
      }
    } catch (err) {
      console.error("Error loading logo status in App component:", err);
    }
  };

  const fetchDbState = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        if (data.services) {
          setServices(data.services);
        }
        if (data.employees) {
          const activeTherapists: Therapist[] = data.employees
            .filter((e: any) => e.status === "Active")
            .map((e: any) => ({
              id: e.id,
              name: e.name,
              specialty: e.specialty,
              experience: e.experience,
              rating: e.rating,
              avatarUrl: e.avatarUrl
            }));
          setTherapists(activeTherapists);
        }
        if (data.metadata) {
          setMetadata(data.metadata);
        }
        if (data.reviews) {
          setReviewsList(data.reviews);
        }
      }
    } catch (err) {
      console.error("Error loading dynamic db state in parent App:", err);
    }
  };

  // Fetch active bookings from our server-side database
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchDbState();
    fetchBookings();
    fetchLogoStatus();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      setNewReview(prev => ({ ...prev, service: services[0].name }));
      if (!preselectedService) {
        setPreselectedService(services[0].name);
      }
    }
  }, [services]);

  const handleOpenBooking = (serviceName?: string) => {
    if (serviceName) {
      setPreselectedService(serviceName);
    } else {
      setPreselectedService(services[0]?.name || "Abhyanga – Full Body Ayurvedic Oil Massage");
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    fetchBookings(); // Refresh bookings list
  };

  // Filtered services based on dynamic services state
  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const handleAddReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newReview.name,
          location: "Indore, Madhya Pradesh",
          rating: Number(newReview.rating),
          comment: newReview.comment,
          service: newReview.service
        })
      });
      if (res.ok) {
        const addedReview = await res.json();
        setReviewsList([addedReview, ...reviewsList]);
        setNewReview({ name: "", comment: "", rating: 5, service: services[0]?.name || "Abhyanga – Full Body Ayurvedic Oil Massage" });
        setShowAddReview(false);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 4000);
      } else {
        console.error("Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <div id="soma-spa-root" className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/20 text-slate-800 pb-24 md:pb-8 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Upper Announcement Header */}
      <div id="announcement-banner" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs font-mono py-2.5 px-4 text-center tracking-widest uppercase flex items-center justify-center space-x-2 border-b border-indigo-900">
        <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
        <span>Experience Divine Tranquility in Vijay Nagar, Indore — Open {metadata?.hours?.[0]?.open || "08:00 AM"} to {metadata?.hours?.[0]?.close || "09:30 PM"}</span>
        <span className="hidden sm:inline-block text-[9px] bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-2 py-0.5 rounded ml-2 font-bold">Premium Sanctuary</span>
      </div>

      {/* Navigation */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onOpenQuickBook={handleOpenBooking} 
        logoPalette={metadata?.logoPalette || "sunset-gold"}
        customLogoUrl={customLogoUrl}
      />

      {/* Main Content Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: HOME */}
        {currentTab === "home" && (
          <div id="tab-home" className="space-y-12 animate-fade-in">
            {/* Elegant Hero Banner */}
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-tr from-slate-50 via-indigo-50/50 to-sky-50 text-slate-800 p-8 sm:p-16 border border-indigo-100/80 shadow-xl">
              {/* Background Image is highly visible and beautifully blended */}
              <div className="absolute inset-0 opacity-55 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200')` }} />
              {/* Gentle ambient light overlay for crisp text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/15 pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl space-y-6">
                <div className="inline-flex items-center space-x-2 bg-indigo-50/90 border border-indigo-100 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold shadow-sm">
                  <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" />
                  <span>{metadata?.title || "SOMA Spa"} & Wellness Center • Vijay Nagar, Indore</span>
                </div>
                
                <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Escape the hustle, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-600 italic">renew your spirit.</span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                  {metadata?.description || "Welcome to SOMA spa and wellness center, a premium holistic oasis combining ancient healing modalities with modern sensory refinement. Indulge in warm customized oils, organic face treatments, and tailored aromatherapies."}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => handleOpenBooking()}
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold tracking-wider text-xs sm:text-sm uppercase px-8 py-4 rounded-full shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Reserve Session
                  </button>
                  <button
                    onClick={() => setCurrentTab("consultant")}
                    className="bg-white hover:bg-slate-50 border border-indigo-100 text-slate-700 font-bold tracking-wider text-xs sm:text-sm uppercase px-8 py-4 rounded-full transition-all duration-300 flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-500 animate-pulse" />
                    <span>Talk to AI Advisor</span>
                  </button>
                </div>
              </div>

              {/* Decorative side badge */}
              <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-end border-l-2 border-indigo-200 pl-6 text-right">
                <span className="font-serif text-xl font-bold italic text-indigo-600">"Om Shanti"</span>
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase mt-1">Holistic Sanity</span>
              </div>
            </div>

            {/* Premium Bento Quick Info Grid */}
            <div id="bento-info-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Location Card */}
              <div className="bg-white border border-indigo-50/80 rounded-3xl p-6 flex items-start space-x-4 shadow-sm hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-sky-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-slate-900 mb-1">Our Location</h4>
                  <p className="text-sm text-slate-600">
                    {metadata?.address || "19 GH, 2nd Floor, Mittal Kachori building, scheme no 54, Vijay nagar, Indore 452010"}
                  </p>
                  <span className="inline-block mt-2 text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider">
                    Madhya Pradesh
                  </span>
                </div>
              </div>

              {/* Hours Card */}
              <div className="bg-white border border-indigo-50/80 rounded-3xl p-6 flex items-start space-x-4 shadow-sm hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-sky-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-slate-900 mb-1">Hours of Peace</h4>
                  <p className="text-sm text-slate-600">
                    Open Every Single Day <br />
                    {metadata?.hours?.[0] ? `Monday – Sunday: ${metadata.hours[0].open} – ${metadata.hours[0].close}` : "Monday – Sunday: 08:00 AM – 09:30 PM"}
                  </p>
                  <span className="inline-block mt-2 text-xs font-mono text-teal-600 font-bold uppercase tracking-wider">
                    ● Bookings Active
                  </span>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white border border-indigo-50/80 rounded-3xl p-6 flex items-start space-x-4 shadow-sm hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-sky-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-slate-900 mb-1">Direct Hotline</h4>
                  <p className="text-sm text-slate-600">
                    <a href={`tel:${metadata?.phone?.replace(/\s+/g, '') || "8982371810"}`} className="hover:text-indigo-600 font-semibold transition-colors">
                      {metadata?.phone || "+91 89823 71810"}
                    </a> <br />
                    {metadata?.email || "hello@somaspaindore.com"}
                  </p>
                  <span className="inline-block mt-2 text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider">
                    Call to book instantly
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Best Sellers Row */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-mono tracking-widest text-blue-600 uppercase font-bold">Recommended for Indore Residents</span>
                  <h2 className="font-serif text-3xl font-semibold text-slate-900 tracking-wide mt-1">Signature Spa Experiences</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentTab("services");
                  }}
                  className="hidden sm:flex items-center space-x-1.5 text-sm font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <span>Explore All Therapies</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.slice(0, 3).map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onBook={(name) => handleOpenBooking(name)} 
                  />
                ))}
              </div>
            </div>


            {/* Interactive Experience Pillars */}
            <div className="bg-white border border-indigo-50 rounded-[32px] p-8 sm:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">Holistic Sanctuary Pillars</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 tracking-wide">
                    The Art of Ayurvedic Rejuvenation
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    SOMA Spa represents a milestone of tranquility. Every scent has been developed locally; we use authentic Kashmiri saffron, organic sandalwood paste curated by generational farmers, and oils prepared dynamically according to traditional holistic formulations.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
                      <Heart className="w-5 h-5 text-indigo-600" />
                      <span>Pure Cold-pressed Oils</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
                      <Coffee className="w-5 h-5 text-indigo-600" />
                      <span>Organic Herbal Teas</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
                      <Music className="w-5 h-5 text-indigo-600" />
                      <span>Raga Healing Soundscapes</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
                      <Flame className="w-5 h-5 text-indigo-600" />
                      <span>Hot Stone Thermals</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-indigo-50 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl" />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold shadow">
                      A
                    </div>
                    <div>
                      <h4 className="font-serif font-semibold text-base text-slate-900">Aura Spa Guide</h4>
                      <p className="text-[10px] font-mono tracking-wide text-indigo-600 uppercase font-bold">Gemini-Powered Advisor</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 italic">
                    "Are you experiencing fatigue from corporate desk-bound hours in Indore, or maybe dryness from the central Indian weather? Ask me how to heal."
                  </p>
                  <button
                    onClick={() => setCurrentTab("consultant")}
                    className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md hover:shadow-indigo-500/15"
                  >
                    <MessageSquare className="w-4 h-4 text-sky-200" />
                    <span>Consult with Aura Advisor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THERAPIES (SERVICES) */}
        {currentTab === "services" && (
          <div id="tab-services" className="space-y-10 animate-fade-in">
            {/* Category Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">Holistic Treatment Menu</span>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-slate-900">Our Sacred Therapies</h1>
              <p className="text-sm sm:text-base text-slate-600">
                Every therapy at SOMA spa and wellness center begins with a silent foot-soaking ritual and ends with a choice of warm organic chamomile or spiced ginger chai.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "All Therapies" },
                { id: "ayurveda", label: "Traditional Ayurveda" },
                { id: "massage", label: "Restorative Massages" },
                { id: "facial", label: "Skin Rejuvenation" },
                { id: "package", label: "Wellness Ritual Packages" },
                { id: "wellness", label: "Holistic Wellness" }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 border cursor-pointer ${
                    selectedCategory === pill.id
                      ? "bg-gradient-to-r from-indigo-600 to-sky-500 text-white border-transparent shadow-md"
                      : "bg-white text-slate-600 border-indigo-100 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onBook={(name) => handleOpenBooking(name)} 
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPECIALISTS (THERAPISTS) */}
        {currentTab === "therapists" && (
          <div id="tab-therapists" className="space-y-10 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">The SOMA Sanctuary Specialists</span>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-slate-900">Therapeutic Experts</h1>
              <p className="text-sm sm:text-base text-slate-600">
                Our specialists are certified in high-altitude aromatherapy, neuromuscular deep tissues, and traditional southern Indian Ayurveda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {therapists.map((th) => (
                <div 
                  key={th.id}
                  id={`therapist-${th.id}`}
                  className="bg-white border border-indigo-50 rounded-3xl p-6 text-center hover:shadow-lg hover:border-indigo-100 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <img 
                        src={th.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"} 
                        alt={th.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full border-2 border-indigo-100"
                      />
                      <span className="absolute bottom-1 right-1 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center">
                        ★ {th.rating}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-slate-900">{th.name}</h3>
                    <p className="text-xs font-mono uppercase text-indigo-600 tracking-wider mt-1 mb-3 font-semibold">
                      {th.specialty}
                    </p>
                    
                    <p className="text-sm text-slate-500">
                      Experience: <strong className="text-slate-800">{th.experience}</strong> of dedicated holistic therapy
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setPreselectedService(services[0]?.name || "Abhyanga – Full Body Ayurvedic Oil Massage");
                      // Set selected therapist in form when modal opens
                      handleOpenBooking();
                    }}
                    className="w-full mt-6 bg-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-sky-500 text-slate-800 hover:text-white border border-indigo-100 hover:border-transparent py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                  >
                    Select Specialist
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AI ADVISOR */}
        {currentTab === "consultant" && (
          <div id="tab-consultant" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="text-center space-y-2 mb-4">
              <span className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">Interactive Holistic Advisor</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900">Aura AI Consultant</h1>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Aura analyzed SOMA Spa's entire holistic menu. Share your mental exhaustion levels, joint blockages, skin concerns, or Indore work schedules.
              </p>
            </div>

            <AIConsultant onSelectService={(serviceName) => handleOpenBooking(serviceName)} />
          </div>
        )}

        {/* TAB 5: REVIEWS */}
        {currentTab === "reviews" && (
          <div id="tab-reviews" className="space-y-8 max-w-4xl mx-auto animate-fade-in">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">SOMA Guest Experiences</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900">Guest Reviews</h1>
              <p className="text-sm text-slate-600">
                Real feedback from patrons across Saket, Vijay Nagar, and Bicholi Mardana, Indore.
              </p>
            </div>

            {reviewSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-xl text-center font-semibold">
                Thank you! Your holistic feedback has been added successfully to our board.
              </div>
            )}

            {/* Add Review Trigger */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h3 className="font-serif text-xl font-bold text-slate-900 font-semibold">Shared Experiences ({reviewsList.length})</h3>
              <button
                onClick={() => setShowAddReview(!showAddReview)}
                className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Write Review Form */}
            {showAddReview && (
              <form onSubmit={handleAddReviewSubmit} className="bg-white border border-indigo-50 rounded-3xl p-6 space-y-4 animate-scale-up shadow-md">
                <h4 className="font-serif text-lg font-bold text-slate-900 font-semibold">Leave your feedback</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      placeholder="E.g., Anand Varma" 
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Service Experienced</label>
                    <select
                      value={newReview.service}
                      onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Rating Star Score</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                    >
                      <option value="5">5 Stars (Excellent sanctuary)</option>
                      <option value="4">4 Stars (Good service)</option>
                      <option value="3">3 Stars (Average)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Your Commentary</label>
                  <textarea 
                    required
                    rows={3}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share details of your therapeutic escape, therapist behavior, aromatherapy oils, and physical relief..."
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddReview(false)}
                    className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}

            {/* Reviews Stream */}
            <div className="space-y-6">
              {reviewsList.map((rev) => (
                <div 
                  key={rev.id}
                  className="bg-white border border-indigo-50/85 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900">{rev.name}</h4>
                      <p className="text-xs text-slate-500">{rev.location} • {rev.date}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-indigo-600">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                     "{rev.comment}"
                  </p>
                  <div className="inline-block bg-indigo-50/50 text-indigo-600 text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-indigo-100/50">
                    Therapy: {rev.service}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ADMIN PORTAL */}
        {currentTab === "admin" && (
          <div id="tab-admin" className="space-y-6 animate-fade-in">
            <AdminDashboard 
              onRefreshApp={() => {
                fetchDbState();
                fetchLogoStatus();
              }} 
              logoPalette={metadata?.logoPalette || "sunset-gold"} 
            />
          </div>
        )}

        {/* Up-coming Active Bookings Section (Loaded Live from /api/bookings) */}
        {bookings.length > 0 && (
          <div id="active-bookings" className="mt-16 bg-white border border-indigo-100/70 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
            <div className="flex items-center space-x-3">
              <BookmarkCheck className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="font-serif text-xl font-semibold text-slate-900">Your Scheduled Sessions</h3>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-wide">Live database status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((bk) => (
                <div 
                  key={bk.id}
                  className="bg-slate-50/50 border border-indigo-100/50 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase font-bold">
                        {bk.id}
                      </span>
                      <span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-200">
                        {bk.status}
                      </span>
                    </div>

                    <h4 className="font-serif font-semibold text-slate-900">{bk.service}</h4>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                      <p>Guest: <strong className="text-slate-800">{bk.name}</strong></p>
                      <p>Therapist: <strong className="text-slate-800">{bk.therapist}</strong></p>
                      <p>Date: <strong className="text-slate-800">{bk.date}</strong></p>
                      <p>Time: <strong className="text-slate-800">{bk.time}</strong></p>
                    </div>

                    {bk.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2.5 border-t border-slate-200 pt-2.5">
                        Notes: "{bk.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Mobile Call Button */}
      <a
        href={`tel:${metadata?.phone?.replace(/\s+/g, '') || "8982371810"}`}
        id="mobile-call-floating-btn"
        className="fixed bottom-24 right-6 z-50 md:hidden bg-gradient-to-r from-teal-500 to-indigo-600 text-white p-4.5 rounded-full shadow-2xl flex items-center justify-center animate-bounce hover:scale-105 active:scale-95 transition-transform border border-white/25"
        aria-label="Call Spa Shop"
      >
        <Phone className="w-6 h-6 animate-pulse" />
      </a>

      {/* Booking Modal Integration */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        services={services}
        therapists={therapists}
        preselectedService={preselectedService}
        onBookingSuccess={handleBookingSuccess}
        customLogoUrl={customLogoUrl}
      />

      {/* Styled Footer */}
      <footer className="mt-12 bg-slate-950 text-slate-200 py-12 px-4 border-t border-slate-800 font-mono text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-slate-800/60">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 mb-3">
              {customLogoUrl ? (
                <img 
                  referrerPolicy="no-referrer"
                  src={customLogoUrl} 
                  className="h-10 w-auto object-contain rounded-xl" 
                  alt="Soma Custom Logo" 
                />
              ) : (
                <div className="h-10 w-10 bg-indigo-950/80 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 font-serif font-bold text-lg">
                  S
                </div>
              )}
              <span className="font-serif text-xl font-semibold tracking-wide text-white">{metadata?.title || "SOMA Spa"}</span>
            </div>
            <p className="text-slate-400 text-xs font-sans">
              {metadata?.tagline || "Premium holistic wellness and therapeutic sanctuary in Indore, Madhya Pradesh."}
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-sky-300 uppercase tracking-wider font-bold">Contact</span>
            <p className="text-slate-300">Hotline: {metadata?.phone || "+91 89823 71810"}</p>
            <p className="text-slate-300">Support: {metadata?.email || "hello@somaspaindore.com"}</p>
          </div>
          <div className="space-y-2">
            <span className="text-sky-300 uppercase tracking-wider font-bold">Find Us</span>
            <p className="text-slate-300 font-sans">
              {metadata?.address || "19 GH, 2nd Floor, Mittal Kachori building, scheme no 54, Vijay nagar, Indore 452010"}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 text-center text-slate-500 text-[10px]">
          © {new Date().getFullYear()} {metadata?.title || "SOMA Spa"} and Wellness Center. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
