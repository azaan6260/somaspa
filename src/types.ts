export interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  category: "massage" | "ayurveda" | "facial" | "package" | "wellness";
  description: string;
  benefits: string[];
  imageUrl: string;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  avatarUrl: string;
}

export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  therapist: string;
  status?: string; // 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  notes?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  rating: number;
  avatarUrl: string;
  salary: number; // Monthly base pay in INR
  status: "Active" | "On Leave" | "Inactive";
  attendance: { [date: string]: "Present" | "Absent" | "Leave" };
  salariesPaid: { [month: string]: { amount: number; date: string; status: "Paid" | "Pending" } };
}

export interface OperatingHour {
  day: string;
  open: string;
  close: string;
}

export interface SpaMetadata {
  title: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logoPalette: "sunset-gold" | "cosmic-ocean" | "teal-mint" | "royal-indigo";
  hours: OperatingHour[];
}

export interface BillItem {
  serviceId: string;
  serviceName: string;
  price: number;
  qty: number;
}

export interface Bill {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: BillItem[];
  therapistId?: string;
  therapistName?: string;
  date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "Cash" | "UPI" | "Card" | "Net Banking";
  status: "Paid" | "Pending";
  createdAt: string;
}

