import { useState } from "react";
import { Service } from "../types";
import { Clock, IndianRupee, Sparkles, Check, ArrowRight, X } from "lucide-react";

interface ServiceCardProps {
  key?: string;
  service: Service;
  onBook: (serviceName: string) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div 
        id={`service-card-${service.id}`}
        className="group bg-white border border-indigo-100/70 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between shadow-sm"
      >
        <div>
          {/* Service Image banner */}
          <div className="relative h-56 overflow-hidden">
            <img 
              src={service.imageUrl} 
              alt={service.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
            
            {/* Category badge */}
            <span className="absolute top-4 left-4 bg-gradient-to-tr from-white to-indigo-50/50 backdrop-blur-md text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100/70 uppercase tracking-widest font-mono">
              {service.category}
            </span>
          </div>

          {/* Service Info */}
          <div className="p-6">
            <h3 className="font-serif text-xl font-semibold text-slate-800 tracking-wide mb-2 group-hover:text-indigo-600 transition-colors duration-300">
              {service.name}
            </h3>
            
            {/* Price & Duration */}
            <div className="flex items-center space-x-4 mb-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-indigo-500" />
                {service.duration}
              </span>
              <span className="flex items-center text-indigo-600 font-bold text-base">
                <IndianRupee className="w-4 h-4 mr-0.5 text-indigo-500" />
                {service.price}
              </span>
            </div>

            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">
              {service.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 border-t border-indigo-50/60 flex items-center justify-between gap-3">
          <button
            id={`service-learn-more-${service.id}`}
            onClick={() => setShowDetail(true)}
            className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors duration-300 flex items-center"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            id={`service-book-${service.id}`}
            onClick={() => onBook(service.name)}
            className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-all duration-300 shadow-sm cursor-pointer"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fade-in">
          <div 
            id={`service-modal-${service.id}`}
            className="bg-white rounded-3xl border border-indigo-100/70 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up"
          >
            {/* Close Button */}
            <button
              id={`service-modal-close-${service.id}`}
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-indigo-600 hover:text-white p-2 rounded-full text-slate-700 transition-all duration-300 z-10 border border-slate-100 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img 
                src={service.imageUrl} 
                alt={service.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              <span className="absolute bottom-6 left-6 bg-gradient-to-r from-indigo-600 to-sky-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-mono">
                {service.category}
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-wide mb-3">
                {service.name}
              </h2>

              <div className="flex flex-wrap items-center gap-6 mb-6 text-sm sm:text-base font-semibold border-b border-indigo-50 pb-4">
                <span className="flex items-center text-slate-700 bg-indigo-50/50 px-3 py-1.5 rounded-full">
                  <Clock className="w-5 h-5 mr-1.5 text-indigo-500" />
                  <span>Duration: {service.duration}</span>
                </span>
                <span className="flex items-center text-indigo-600 bg-indigo-50/50 px-4 py-1.5 rounded-full font-bold">
                  <IndianRupee className="w-5 h-5 mr-1 text-indigo-500" />
                  <span>Price: {service.price} INR</span>
                </span>
              </div>

              <h4 className="text-xs font-mono tracking-widest text-indigo-600 uppercase mb-2 font-bold">Description</h4>
              <p className="text-slate-700 leading-relaxed mb-6 text-sm sm:text-base">
                {service.description}
              </p>

              <h4 className="text-xs font-mono tracking-widest text-indigo-600 uppercase mb-3 font-bold">Therapeutic Benefits</h4>
              <ul className="space-y-3 mb-8">
                {service.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start text-slate-700 text-sm sm:text-base">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Action */}
              <div className="flex items-center justify-end space-x-4 border-t border-indigo-50 pt-6">
                <button
                  id={`modal-cancel-btn-${service.id}`}
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-3 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Close
                </button>
                <button
                  id={`modal-book-btn-${service.id}`}
                  onClick={() => {
                    setShowDetail(false);
                    onBook(service.name);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold tracking-wide px-8 py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book This Therapy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
