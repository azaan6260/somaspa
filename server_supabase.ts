import { createClient } from "@supabase/supabase-js";
import { SpaMetadata, Employee, Service, Booking, Review } from "./src/types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// Constant UUID for single-record spa metadata row to match uuid type constraints
const METADATA_UUID = "00000000-0000-0000-0000-000000000000";

// Helper to convert DB rows to app types
const mapMetadataFromDb = (row: any): SpaMetadata | null => {
  if (!row) return null;
  return {
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logoPalette: row.logo_palette,
    hours: row.hours || []
  };
};

const mapMetadataToDb = (meta: SpaMetadata) => {
  return {
    id: METADATA_UUID,
    title: meta.title,
    tagline: meta.tagline,
    description: meta.description,
    address: meta.address,
    phone: meta.phone,
    email: meta.email,
    logo_palette: meta.logoPalette,
    hours: meta.hours
  };
};

const mapEmployeeFromDb = (row: any): Employee => {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    specialty: row.specialty || "",
    experience: row.experience || "",
    rating: Number(row.rating) || 5.0,
    avatarUrl: row.avatar_url || "",
    salary: Number(row.salary) || 0,
    status: row.status || "Active",
    attendance: row.attendance || {},
    salariesPaid: row.salaries_paid || {}
  };
};

const mapEmployeeToDb = (emp: Employee) => {
  return {
    id: emp.id,
    name: emp.name,
    role: emp.role,
    specialty: emp.specialty,
    experience: emp.experience,
    rating: emp.rating,
    avatar_url: emp.avatarUrl,
    salary: emp.salary,
    status: emp.status,
    attendance: emp.attendance || {},
    salaries_paid: emp.salariesPaid || {}
  };
};

const mapServiceFromDb = (row: any): Service => {
  return {
    id: row.id,
    name: row.name,
    duration: row.duration || "",
    price: Number(row.price) || 0,
    category: row.category,
    description: row.description || "",
    benefits: row.benefits || [],
    imageUrl: row.image_url || ""
  };
};

const mapServiceToDb = (svc: Service) => {
  return {
    id: svc.id,
    name: svc.name,
    duration: svc.duration,
    price: svc.price,
    category: svc.category,
    description: svc.description,
    benefits: svc.benefits,
    image_url: svc.imageUrl
  };
};

const mapLeadFromDb = (row: any): Booking => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    date: row.date,
    time: row.time,
    therapist: row.therapist || "Any Available Therapist",
    status: row.status || "Confirmed",
    notes: row.notes || "",
    createdAt: row.created_at
  };
};

const mapLeadToDb = (lead: Booking) => {
  return {
    id: lead.id || undefined, // UUID primary key
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    service: lead.service,
    date: lead.date,
    time: lead.time,
    therapist: lead.therapist,
    status: lead.status || "Confirmed",
    notes: lead.notes || "",
    created_at: lead.createdAt || new Date().toISOString()
  };
};

const mapReviewFromDb = (row: any): Review => {
  return {
    id: row.id,
    name: row.name,
    location: row.location || "Indore",
    rating: Number(row.rating) || 5,
    comment: row.comment || "",
    date: row.date || new Date().toISOString().split("T")[0],
    service: row.service || ""
  };
};

const mapReviewToDb = (rev: Review) => {
  return {
    id: rev.id && rev.id.startsWith("rev-") ? undefined : rev.id, // Auto-generate UUID in DB if client sent temporary id
    name: rev.name,
    location: rev.location || "Indore",
    rating: rev.rating,
    comment: rev.comment,
    date: rev.date || new Date().toISOString().split("T")[0],
    service: rev.service
  };
};

// Database operation interfaces
export const supabaseDb = {
  async getMetadata(): Promise<SpaMetadata | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("spa_metadata")
      .select("*")
      .eq("id", METADATA_UUID)
      .maybeSingle();
    
    if (error) {
      console.error("Supabase error fetching metadata:", error);
      throw error;
    }
    return data ? mapMetadataFromDb(data) : null;
  },

  async updateMetadata(meta: SpaMetadata): Promise<SpaMetadata> {
    if (!supabase) throw new Error("Supabase is not configured");
    const dbPayload = mapMetadataToDb(meta);
    const { data, error } = await supabase
      .from("spa_metadata")
      .upsert(dbPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error updating metadata:", error);
      throw error;
    }
    return mapMetadataFromDb(data)!;
  },

  async getEmployees(): Promise<Employee[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error fetching employees:", error);
      throw error;
    }
    return (data || []).map(mapEmployeeFromDb);
  },

  async addEmployee(emp: Employee): Promise<Employee> {
    if (!supabase) throw new Error("Supabase is not configured");
    const dbPayload = mapEmployeeToDb(emp);
    const { data, error } = await supabase
      .from("employees")
      .insert(dbPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error adding employee:", error);
      throw error;
    }
    return mapEmployeeFromDb(data);
  },

  async updateEmployee(id: string, emp: Partial<Employee>): Promise<Employee> {
    if (!supabase) throw new Error("Supabase is not configured");
    
    // Fetch original first to preserve fields
    const { data: original, error: fetchErr } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    const mappedOriginal = mapEmployeeFromDb(original);
    const merged = { ...mappedOriginal, ...emp } as Employee;
    const dbPayload = mapEmployeeToDb(merged);

    const { data, error } = await supabase
      .from("employees")
      .update(dbPayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error updating employee:", error);
      throw error;
    }
    return mapEmployeeFromDb(data);
  },

  async deleteEmployee(id: string): Promise<boolean> {
    if (!supabase) throw new Error("Supabase is not configured");
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting employee:", error);
      throw error;
    }
    return true;
  },

  async getServices(): Promise<Service[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error fetching services:", error);
      throw error;
    }
    return (data || []).map(mapServiceFromDb);
  },

  async addService(svc: Service): Promise<Service> {
    if (!supabase) throw new Error("Supabase is not configured");
    const dbPayload = mapServiceToDb(svc);
    const { data, error } = await supabase
      .from("services")
      .insert(dbPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error adding service:", error);
      throw error;
    }
    return mapServiceFromDb(data);
  },

  async updateService(id: string, svc: Partial<Service>): Promise<Service> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data: original, error: fetchErr } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    const mappedOriginal = mapServiceFromDb(original);
    const merged = { ...mappedOriginal, ...svc } as Service;
    const dbPayload = mapServiceToDb(merged);

    const { data, error } = await supabase
      .from("services")
      .update(dbPayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error updating service:", error);
      throw error;
    }
    return mapServiceFromDb(data);
  },

  async deleteService(id: string): Promise<boolean> {
    if (!supabase) throw new Error("Supabase is not configured");
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting service:", error);
      throw error;
    }
    return true;
  },

  async getLeads(): Promise<Booking[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching bookings:", error);
      throw error;
    }
    return (data || []).map(mapLeadFromDb);
  },

  async addLead(lead: Booking): Promise<Booking> {
    if (!supabase) throw new Error("Supabase is not configured");
    const dbPayload = mapLeadToDb(lead);
    const { data, error } = await supabase
      .from("bookings")
      .insert(dbPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error adding booking:", error);
      throw error;
    }
    return mapLeadFromDb(data);
  },

  async updateLead(id: string, lead: Partial<Booking>): Promise<Booking> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data: original, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    const mappedOriginal = mapLeadFromDb(original);
    const merged = { ...mappedOriginal, ...lead } as Booking;
    const dbPayload = mapLeadToDb(merged);

    const { data, error } = await supabase
      .from("bookings")
      .update(dbPayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error updating booking:", error);
      throw error;
    }
    return mapLeadFromDb(data);
  },

  async deleteLead(id: string): Promise<boolean> {
    if (!supabase) throw new Error("Supabase is not configured");
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting booking:", error);
      throw error;
    }
    return true;
  },

  async getReviews(): Promise<Review[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching reviews:", error);
      throw error;
    }
    return (data || []).map(mapReviewFromDb);
  },

  async addReview(rev: Review): Promise<Review> {
    if (!supabase) throw new Error("Supabase is not configured");
    const dbPayload = mapReviewToDb(rev);
    const { data, error } = await supabase
      .from("reviews")
      .insert(dbPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error adding review:", error);
      throw error;
    }
    return mapReviewFromDb(data);
  },

  async deleteReview(id: string): Promise<boolean> {
    if (!supabase) throw new Error("Supabase is not configured");
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting review:", error);
      throw error;
    }
    return true;
  }
};
