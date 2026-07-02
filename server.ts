import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { isSupabaseConfigured, supabase, supabaseDb } from "./server_supabase";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header User-Agent: 'aistudio-build'
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Database path
const DB_FILE = path.join(process.cwd(), "server_db.json");

// Default initial data seeds
const DEFAULT_METADATA = {
  title: "Soma Spa",
  tagline: "SPA & WELLNESS CENTRE",
  description: "Welcome to Soma spa and wellness center, a premium holistic oasis combining ancient healing modalities with modern sensory refinement. Indulge in warm customized oils, organic face treatments, and tailored aromatherapies designed to soothe and restore.",
  address: "19 GH, 2nd Floor, Mittal Kachori building, scheme no 54, Vijay nagar, Indore 452010",
  phone: "+91 89823 71810",
  email: "hello@somaspaindore.com",
  logoPalette: "sunset-gold",
  hours: [
    { day: "Monday", open: "08:00 AM", close: "09:30 PM" },
    { day: "Tuesday", open: "08:00 AM", close: "09:30 PM" },
    { day: "Wednesday", open: "08:00 AM", close: "09:30 PM" },
    { day: "Thursday", open: "08:00 AM", close: "09:30 PM" },
    { day: "Friday", open: "08:00 AM", close: "09:30 PM" },
    { day: "Saturday", open: "08:00 AM", close: "09:30 PM" },
    { day: "Sunday", open: "08:00 AM", close: "09:30 PM" }
  ]
};

const DEFAULT_EMPLOYEES = [
  {
    id: "siddharth",
    name: "Siddharth Nair",
    specialty: "Ayurvedic Treatments & Pain Management",
    experience: "8 Years",
    rating: 4.9,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    role: "Senior Therapist",
    salary: 35000,
    status: "Active",
    attendance: {},
    salariesPaid: {}
  },
  {
    id: "aarti",
    name: "Aarti Holkar",
    specialty: "Organic Skin Facials & Aromatherapy",
    experience: "6 Years",
    rating: 4.8,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    role: "Therapist",
    salary: 28000,
    status: "Active",
    attendance: {},
    salariesPaid: {}
  },
  {
    id: "manoj",
    name: "Manoj Yadav",
    specialty: "Deep Tissue & Nirvana Hot Stones",
    experience: "7 Years",
    rating: 4.9,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    role: "Senior Therapist",
    salary: 32000,
    status: "Active",
    attendance: {},
    salariesPaid: {}
  },
  {
    id: "elena",
    name: "Elena Gonsalves",
    specialty: "Aroma Harmony & Swedish Relaxation",
    experience: "5 Years",
    rating: 4.7,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    role: "Therapist",
    salary: 25000,
    status: "Active",
    attendance: {},
    salariesPaid: {}
  }
];

const DEFAULT_SERVICES = [
  {
    id: "abhyanga",
    name: "Abhyanga Shanti Ayurvedic Massage",
    duration: "60 / 90 Mins",
    price: 2400,
    category: "ayurveda",
    description: "A deeply restorative full-body massage using warm herbal oils custom-blended according to your Ayurvedic Dosha. Designed to relieve physical fatigue, improve blood circulation, and calm the nervous system.",
    benefits: [
      "Pacifies Vata, Pitta, and Kapha imbalances",
      "Increases lymphatic circulation and flushes out toxins",
      "Improves skin texture and brings a natural glow",
      "Promotes deep, sound sleep"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "soundarya",
    name: "Indori Royal Soundarya Facial",
    duration: "75 Mins",
    price: 2200,
    category: "facial",
    description: "A luxurious therapeutic facial that uses organic sandalwood paste, pure saffron extract, and freshly crushed marigold flowers. Perfect for restoring natural luster and counteracting the urban dust and dry heat of Indore.",
    benefits: [
      "Deeply exfoliates and clears city pollution",
      "Hydrates and firms facial skin",
      "Reduces dark spots and pigmentation",
      "Soothing face, neck, and shoulder massage included"
    ],
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "hotstone",
    name: "Nirvana Hot Stone Therapy",
    duration: "90 Mins",
    price: 3200,
    category: "massage",
    description: "Smooth, heated volcanic basalt stones are strategically placed along key energy meridians of your body while our therapist uses deep, sliding strokes to melt away deep muscle tension.",
    benefits: [
      "Eases muscle stiffness and pain",
      "Incredibly grounding for mental stress",
      "Improves joint flexibility and blood flow",
      "Recharges body's energetic pathways"
    ],
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "marma",
    name: "Marma Points Healing Therapy",
    duration: "60 Mins",
    price: 1900,
    category: "ayurveda",
    description: "Focuses on the 107 vital energy intersections (Marma points) of the human body. Stimulated using therapeutic-grade essential oils to release blocked energy, headaches, and computer-bound shoulder strain.",
    benefits: [
      "Relieves chronic shoulder and neck stiffness",
      "Alleviates fatigue and tension headaches",
      "Balances body's vital life-force (Prana)",
      "Highly recommended for corporate workers and heavy screen users"
    ],
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "deeptissue",
    name: "Deep Tissue Mukti Massage",
    duration: "60 / 90 Mins",
    price: 2600,
    category: "massage",
    description: "Slow, deliberate strokes and deep finger pressure focus on releasing chronic muscle tightness, tight knots, and fascia congestion. Ideal for athletes or those with physical fatigue.",
    benefits: [
      "Releases deep myofascial tightness and knots",
      "Helps recover from intense workouts or travel",
      "Corrects posture alignment over time",
      "Increases range of motion"
    ],
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "aroma",
    name: "Aroma Harmony Fusion",
    duration: "60 Mins",
    price: 2000,
    category: "massage",
    description: "A delicate, aromatic massage that combines gentle Swedish rhythmic strokes with high-altitude Lavender, Indian Lemongrass, and healing Eucalyptus oils to uplift the mind and restore harmony.",
    benefits: [
      "Reduces immediate anxiety and mental chatter",
      "Calming aromatherapy benefits via inhalation and absorption",
      "Gentle relaxation of muscles",
      "Uplifts spirit and relieves exhaustion"
    ],
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "panchakarma",
    name: "Panchakarma Express Detox",
    duration: "150 Mins",
    price: 4800,
    category: "package",
    description: "A signature multi-stage Ayurvedic cleanse combining Udvartana (herbal powder scrub), Abhyanga (warm oil massage), and Shirodhara (warm oil poured continuously over the forehead) for ultimate mind-body renewal.",
    benefits: [
      "Full body detoxification and cellular rejuvenation",
      "Deeply calms hyperactive brain waves and stress",
      "Exfoliates dead skin cells and improves tone",
      "Restores holistic dosha balance"
    ],
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "royalwedding",
    name: "Royal Mewar Couple's Ritual",
    duration: "120 Mins",
    price: 7500,
    category: "package",
    description: "The ultimate shared escape. Includes side-by-side aromatherapy fusion massages, classic sandalwood body wraps, and an private organic green tea service in our premium suite.",
    benefits: [
      "Shared calming experience in a private candlelit couple's suite",
      "Full body exfoliation, hydration, and relaxation",
      "Perfect gift for anniversaries or couples in Indore",
      "Complimentary gourmet fruit platter and herbal refreshments"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  }
];

const DEFAULT_LEADS = [
  {
    id: "bk-1",
    name: "Rajesh Sharma",
    email: "rajesh@example.com",
    phone: "9876543210",
    service: "Abhyanga Shanti Ayurvedic Massage",
    date: "2026-07-05",
    time: "11:00 AM",
    therapist: "Siddharth Nair",
    status: "Confirmed",
    notes: "Prefers medium pressure, warm herbal tea post-therapy.",
    createdAt: "2026-07-01T10:00:00Z"
  },
  {
    id: "bk-2",
    name: "Priyanka Joshi",
    email: "priyanka@example.com",
    phone: "9823456789",
    service: "Indori Royal Soundarya Facial",
    date: "2026-07-06",
    time: "03:30 PM",
    therapist: "Aarti Holkar",
    status: "Confirmed",
    notes: "Has slight sandalwood allergy; swap with lavender if needed.",
    createdAt: "2026-07-01T14:30:00Z"
  }
];

// Read DB from file
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read server_db.json, recreating...", err);
  }
  const initial = {
    metadata: { ...DEFAULT_METADATA },
    employees: [...DEFAULT_EMPLOYEES],
    services: [...DEFAULT_SERVICES],
    leads: [...DEFAULT_LEADS]
  };
  saveDB(initial);
  return initial;
}

// Write DB to file
function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save server_db.json:", err);
  }
}

// Ensure database is populated immediately
let db = loadDB();

// API ROUTES

// Get entire database state (for admin sync)
app.get("/api/db", async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      let metadata = await supabaseDb.getMetadata();
      let employees = await supabaseDb.getEmployees();
      let services = await supabaseDb.getServices();
      let leads = await supabaseDb.getLeads();

      // Auto-seed empty databases
      if (!metadata) {
        metadata = await supabaseDb.updateMetadata(DEFAULT_METADATA as any);
      }
      if (services.length === 0) {
        for (const s of DEFAULT_SERVICES) {
          await supabaseDb.addService(s as any);
        }
        services = await supabaseDb.getServices();
      }
      if (employees.length === 0) {
        for (const e of DEFAULT_EMPLOYEES) {
          await supabaseDb.addEmployee(e as any);
        }
        employees = await supabaseDb.getEmployees();
      }
      res.json({ metadata, employees, services, leads });
    } else {
      db = loadDB();
      res.json(db);
    }
  } catch (err: any) {
    console.error("Failed to load DB state:", err);
    db = loadDB();
    res.json(db);
  }
});

// Reset database to default seeds
app.post("/api/db/reset", async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      // Clear existing records from Supabase tables
      await supabase!.from("spa_leads").delete().neq("id", "");
      await supabase!.from("spa_employees").delete().neq("id", "");
      await supabase!.from("spa_services").delete().neq("id", "");
      await supabase!.from("spa_metadata").delete().neq("id", "");

      const metadata = await supabaseDb.updateMetadata(DEFAULT_METADATA as any);
      for (const s of DEFAULT_SERVICES) {
        await supabaseDb.addService(s as any);
      }
      for (const e of DEFAULT_EMPLOYEES) {
        await supabaseDb.addEmployee(e as any);
      }
      for (const l of DEFAULT_LEADS) {
        await supabaseDb.addLead(l as any);
      }

      const services = await supabaseDb.getServices();
      const employees = await supabaseDb.getEmployees();
      const leads = await supabaseDb.getLeads();

      res.json({
        success: true,
        db: { metadata, employees, services, leads }
      });
    } else {
      const initial = {
        metadata: { ...DEFAULT_METADATA },
        employees: [...DEFAULT_EMPLOYEES],
        services: [...DEFAULT_SERVICES],
        leads: [...DEFAULT_LEADS]
      };
      db = initial;
      saveDB(db);
      res.json({ success: true, db });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reset database" });
  }
});

// Update metadata & settings
app.post("/api/db/metadata", async (req, res) => {
  try {
    const { title, tagline, description, address, phone, email, logoPalette, hours } = req.body;
    if (isSupabaseConfigured) {
      const existing = await supabaseDb.getMetadata() || DEFAULT_METADATA;
      const updatedMeta = {
        title: title || existing.title,
        tagline: tagline || existing.tagline,
        description: description || existing.description,
        address: address || existing.address,
        phone: phone || existing.phone,
        email: email || existing.email,
        logoPalette: (logoPalette as any) || existing.logoPalette,
        hours: hours || existing.hours
      };
      const metadata = await supabaseDb.updateMetadata(updatedMeta);
      res.json({ success: true, metadata });
    } else {
      db.metadata = {
        title: title || db.metadata.title,
        tagline: tagline || db.metadata.tagline,
        description: description || db.metadata.description,
        address: address || db.metadata.address,
        phone: phone || db.metadata.phone,
        email: email || db.metadata.email,
        logoPalette: logoPalette || db.metadata.logoPalette,
        hours: hours || db.metadata.hours
      };
      saveDB(db);
      res.json({ success: true, metadata: db.metadata });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update metadata" });
  }
});

// GET Bookings / Leads (compatibility with frontend booking fetch)
app.get("/api/bookings", async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const leads = await supabaseDb.getLeads();
      res.json(leads);
    } else {
      db = loadDB();
      res.json(db.leads);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch bookings" });
  }
});

// POST Bookings / Leads (compatibility with frontend booking)
app.post("/api/bookings", async (req, res) => {
  try {
    const { name, email, phone, service, date, time, therapist, notes } = req.body;
    if (!name || !email || !phone || !service || !date || !time) {
      return res.status(400).json({ error: "Missing required booking details" });
    }
    const newBooking = {
      id: `bk-${Date.now()}`,
      name,
      email,
      phone,
      service,
      date,
      time,
      therapist: therapist || "Any Available Therapist",
      status: "Confirmed",
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const lead = await supabaseDb.addLead(newBooking);
      res.status(201).json(lead);
    } else {
      db.leads.unshift(newBooking);
      saveDB(db);
      res.status(201).json(newBooking);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to book appointment" });
  }
});

// CRUD - Leads
app.put("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, name, email, phone, service, date, time, therapist } = req.body;
    
    if (isSupabaseConfigured) {
      const updated = await supabaseDb.updateLead(id, {
        status, notes, name, email, phone, service, date, time, therapist
      });
      res.json(updated);
    } else {
      const idx = db.leads.findIndex((l: any) => l.id === id);
      if (idx === -1) {
        return res.status(444).json({ error: "Lead not found" });
      }

      db.leads[idx] = {
        ...db.leads[idx],
        name: name !== undefined ? name : db.leads[idx].name,
        email: email !== undefined ? email : db.leads[idx].email,
        phone: phone !== undefined ? phone : db.leads[idx].phone,
        service: service !== undefined ? service : db.leads[idx].service,
        date: date !== undefined ? date : db.leads[idx].date,
        time: time !== undefined ? time : db.leads[idx].time,
        therapist: therapist !== undefined ? therapist : db.leads[idx].therapist,
        status: status !== undefined ? status : db.leads[idx].status,
        notes: notes !== undefined ? notes : db.leads[idx].notes
      };

      saveDB(db);
      res.json(db.leads[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update lead" });
  }
});

app.delete("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured) {
      await supabaseDb.deleteLead(id);
      res.json({ success: true, id });
    } else {
      db.leads = db.leads.filter((l: any) => l.id !== id);
      saveDB(db);
      res.json({ success: true, id });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete lead" });
  }
});

// CRUD - Employees
app.post("/api/employees", async (req, res) => {
  try {
    const { name, role, specialty, experience, salary, status, avatarUrl, rating } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: "Name and Role are required" });
    }
    const newEmp = {
      id: `emp-${Date.now()}`,
      name,
      role,
      specialty: specialty || "General Therapist",
      experience: experience || "1 Year",
      rating: Number(rating) || 5.0,
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      salary: Number(salary) || 20000,
      status: status || "Active",
      attendance: {},
      salariesPaid: {}
    };

    if (isSupabaseConfigured) {
      const emp = await supabaseDb.addEmployee(newEmp as any);
      res.status(201).json(emp);
    } else {
      db.employees.push(newEmp);
      saveDB(db);
      res.status(201).json(newEmp);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add employee" });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, specialty, experience, salary, status, avatarUrl, rating } = req.body;
    
    if (isSupabaseConfigured) {
      const emp = await supabaseDb.updateEmployee(id, {
        name, role, specialty, experience, salary, status, avatarUrl, rating
      });
      res.json(emp);
    } else {
      const idx = db.employees.findIndex((e: any) => e.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Employee not found" });
      }

      db.employees[idx] = {
        ...db.employees[idx],
        name: name !== undefined ? name : db.employees[idx].name,
        role: role !== undefined ? role : db.employees[idx].role,
        specialty: specialty !== undefined ? specialty : db.employees[idx].specialty,
        experience: experience !== undefined ? experience : db.employees[idx].experience,
        salary: salary !== undefined ? Number(salary) : db.employees[idx].salary,
        status: status !== undefined ? status : db.employees[idx].status,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : db.employees[idx].avatarUrl,
        rating: rating !== undefined ? Number(rating) : db.employees[idx].rating
      };

      saveDB(db);
      res.json(db.employees[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update employee" });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured) {
      await supabaseDb.deleteEmployee(id);
      res.json({ success: true, id });
    } else {
      db.employees = db.employees.filter((e: any) => e.id !== id);
      saveDB(db);
      res.json({ success: true, id });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete employee" });
  }
});

// Employee Attendance
app.post("/api/employees/:id/attendance", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status } = req.body; // status: 'Present' | 'Absent' | 'Leave'
    if (!date || !status) {
      return res.status(400).json({ error: "Date and status are required" });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from("spa_employees")
        .select("attendance")
        .eq("id", id)
        .single();
      if (error) throw error;
      const currentAttendance = data.attendance || {};
      currentAttendance[date] = status;

      const updated = await supabaseDb.updateEmployee(id, { attendance: currentAttendance });
      res.json({ success: true, employee: updated });
    } else {
      const idx = db.employees.findIndex((e: any) => e.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (!db.employees[idx].attendance) {
        db.employees[idx].attendance = {};
      }
      db.employees[idx].attendance[date] = status;
      saveDB(db);
      res.json({ success: true, employee: db.employees[idx] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to log attendance" });
  }
});

// Employee Salaries Paid
app.post("/api/employees/:id/salary", async (req, res) => {
  try {
    const { id } = req.params;
    const { month, amount, status } = req.body; // status: 'Paid' | 'Pending'
    if (!month || amount === undefined || !status) {
      return res.status(400).json({ error: "Month, amount and status are required" });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from("spa_employees")
        .select("salaries_paid")
        .eq("id", id)
        .single();
      if (error) throw error;
      const currentSalaries = data.salaries_paid || {};
      currentSalaries[month] = {
        amount: Number(amount),
        date: new Date().toISOString().split("T")[0],
        status
      };

      const updated = await supabaseDb.updateEmployee(id, { salariesPaid: currentSalaries });
      res.json({ success: true, employee: updated });
    } else {
      const idx = db.employees.findIndex((e: any) => e.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (!db.employees[idx].salariesPaid) {
        db.employees[idx].salariesPaid = {};
      }
      db.employees[idx].salariesPaid[month] = {
        amount: Number(amount),
        date: new Date().toISOString().split("T")[0],
        status
      };
      saveDB(db);
      res.json({ success: true, employee: db.employees[idx] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update salary payment" });
  }
});

// CRUD - Services
app.post("/api/services", async (req, res) => {
  try {
    const { name, duration, price, category, description, benefits, imageUrl } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: "Name, price and category are required" });
    }
    const newService = {
      id: `svc-${Date.now()}`,
      name,
      duration: duration || "60 Mins",
      price: Number(price),
      category,
      description: description || "",
      benefits: benefits || [],
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
    };

    if (isSupabaseConfigured) {
      const svc = await supabaseDb.addService(newService as any);
      res.status(201).json(svc);
    } else {
      db.services.push(newService);
      saveDB(db);
      res.status(201).json(newService);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add service" });
  }
});

app.put("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price, category, description, benefits, imageUrl } = req.body;
    
    if (isSupabaseConfigured) {
      const svc = await supabaseDb.updateService(id, {
        name, duration, price, category, description, benefits, imageUrl
      });
      res.json(svc);
    } else {
      const idx = db.services.findIndex((s: any) => s.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Service not found" });
      }

      db.services[idx] = {
        ...db.services[idx],
        name: name !== undefined ? name : db.services[idx].name,
        duration: duration !== undefined ? duration : db.services[idx].duration,
        price: price !== undefined ? Number(price) : db.services[idx].price,
        category: category !== undefined ? category : db.services[idx].category,
        description: description !== undefined ? description : db.services[idx].description,
        benefits: benefits !== undefined ? benefits : db.services[idx].benefits,
        imageUrl: imageUrl !== undefined ? imageUrl : db.services[idx].imageUrl
      };

      saveDB(db);
      res.json(db.services[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update service" });
  }
});

app.delete("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured) {
      await supabaseDb.deleteService(id);
      res.json({ success: true, id });
    } else {
      db.services = db.services.filter((s: any) => s.id !== id);
      saveDB(db);
      res.json({ success: true, id });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete service" });
  }
});

// Gemini dynamic consultation endpoint
app.post("/api/consultation", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let liveServicesList = "";
    let metadataTitle = "";
    let metadataTagline = "";
    let metadataAddress = "";
    let metadataPhone = "";
    let metadataEmail = "";

    if (isSupabaseConfigured) {
      const services = await supabaseDb.getServices();
      const meta = await supabaseDb.getMetadata() || DEFAULT_METADATA;
      metadataTitle = meta.title;
      metadataTagline = meta.tagline;
      metadataAddress = meta.address;
      metadataPhone = meta.phone;
      metadataEmail = meta.email;

      liveServicesList = services.map((s: any, index: number) => {
        return `${index + 1}. "${s.name}" (${s.category.toUpperCase()}) - Duration: ${s.duration} - Price: Rs. ${s.price}
   Description: ${s.description}
   Benefits: ${s.benefits ? s.benefits.join(", ") : "N/A"}`;
      }).join("\n\n");
    } else {
      db = loadDB();
      metadataTitle = db.metadata.title;
      metadataTagline = db.metadata.tagline;
      metadataAddress = db.metadata.address;
      metadataPhone = db.metadata.phone;
      metadataEmail = db.metadata.email;

      liveServicesList = db.services.map((s: any, index: number) => {
        return `${index + 1}. "${s.name}" (${s.category.toUpperCase()}) - Duration: ${s.duration} - Price: Rs. ${s.price}
   Description: ${s.description}
   Benefits: ${s.benefits ? s.benefits.join(", ") : "N/A"}`;
      }).join("\n\n");
    }

    const systemInstruction = `You are "Aura", the lead holistic therapist and wellness advisor at ${metadataTitle} in Indore, India.
Your tone is deeply calming, warm, welcoming, and knowledgeable about holistic health, traditional Ayurveda, and modern spa therapies.
You are helping a customer find the perfect treatments, massage techniques, or spa packages based on their wellness goals, stress levels, body aches, skin concerns, or lifestyle (e.g., long desk hours, high-stress jobs).

The current spa details are:
Name: ${metadataTitle}
Tagline: ${metadataTagline}
Address: ${metadataAddress}
Hotline: ${metadataPhone}
Email: ${metadataEmail}

We offer the following live signature therapies dynamically loaded from our service menu:
${liveServicesList}

When suggesting treatments:
- Recommend 1 or 2 specific therapies from the live list above that directly address the user's symptoms or requests. Mention their prices (in Rupees) and durations as listed.
- Explain WHY these therapies will help them (e.g., how the warm oil calms a vata imbalance or how the facial counters Indore's urban dust, heat, and dryness).
- Incorporate subtle cultural elements of Indore (like recommending a relaxing session after a busy day exploring Chappan Dukan, Sarafa Bazaar, or shopping in Vijay Nagar, or addressing the dry Indore climate).
- Keep your responses structured, clean, and elegant. Write short paragraphs, use bullet points for suggestions, and encourage them to book a session at our premium Vijay Nagar, Indore center.
- Always be professional, compassionate, and focused on wellness. Never give medical advice; if they mention severe pain, gently advise them to consult a medical specialist besides enjoying a relaxing spa treatment.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text || msg.message }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate recommendation" });
  }
});


// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error setting up server:", err);
});

