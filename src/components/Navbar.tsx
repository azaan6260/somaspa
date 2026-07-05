import { Sparkles, Calendar, BookOpen, MessageSquare, Users, Star, Compass, ShieldCheck } from "lucide-react";
import { SomaLogo } from "./SomaLogo";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenQuickBook: (serviceName?: string) => void;
  logoPalette?: string;
  customLogoUrl?: string | null;
}

export default function Navbar({ currentTab, setCurrentTab, onOpenQuickBook, logoPalette, customLogoUrl }: NavbarProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Compass },
    { id: "services", label: "Therapies", icon: BookOpen },
    { id: "therapists", label: "Specialists", icon: Users },
    { id: "consultant", label: "SOMA SPA AI", icon: Sparkles },
    { id: "reviews", label: "Reviews", icon: Star }
  ];

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <div 
            id="brand-logo" 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentTab("home")}
          >
            <SomaLogo size={42} palette={(logoPalette as any) || "sunset-gold"} customLogoUrl={customLogoUrl} className="group-hover:scale-105 transition-transform duration-300" />
            <div>
              <span className="font-serif text-2xl tracking-wide font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors duration-300">
                Soma Spa
              </span>
              <p className="text-[10px] font-mono tracking-wider text-indigo-600 uppercase -mt-1 font-bold">
                SPA & WELLNESS CENTRE
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/10"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Booking Button */}
          <div className="flex items-center space-x-3">
            <button
              id="header-booking-btn"
              onClick={() => onOpenQuickBook()}
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-slate-800 rounded-full group bg-gradient-to-br from-sky-400 to-indigo-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-indigo-300 transition-all duration-300 mt-2 cursor-pointer"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-full group-hover:bg-opacity-0 text-slate-800 group-hover:text-white font-semibold flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Book Now</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Navigation Rail at the bottom */}
      <div id="mobile-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-indigo-50 shadow-lg px-4 py-2 flex justify-around items-center z-50 backdrop-blur-md">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-btn-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-indigo-600 scale-105 font-bold"
                  : "text-slate-400 hover:text-indigo-500"
              }`}
            >
              <IconComponent className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onOpenQuickBook()}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-indigo-600 animate-pulse"
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Book</span>
        </button>
      </div>
    </header>
  );
}
