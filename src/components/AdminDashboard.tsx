import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  BookOpen, 
  MapPin, 
  Clock, 
  Trash2, 
  Edit, 
  Plus, 
  Check, 
  X, 
  Search, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  RefreshCw,
  Award,
  AlertCircle
} from "lucide-react";
import { Employee, Service, Booking, SpaMetadata, OperatingHour } from "../types";

interface AdminDashboardProps {
  onRefreshApp: () => void;
  logoPalette?: string;
}

export default function AdminDashboard({ onRefreshApp, logoPalette }: AdminDashboardProps) {
  // Authentication gate
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // DB State
  const [dbState, setDbState] = useState<{
    metadata: SpaMetadata;
    employees: Employee[];
    services: Service[];
    leads: Booking[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "services" | "settings" | "leads">("overview");

  // Error/Success banner
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [employeeForm, setEmployeeForm] = useState<Partial<Employee>>({
    name: "",
    role: "Therapist",
    specialty: "",
    experience: "",
    salary: 25000,
    status: "Active",
    avatarUrl: "",
    rating: 5.0
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  // Attendance tracker state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  // Salary tracker state
  const [salaryMonth, setSalaryMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Services form state
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    name: "",
    duration: "60 Mins",
    price: 2000,
    category: "massage",
    description: "",
    benefits: [],
    imageUrl: ""
  });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newBenefitText, setNewBenefitText] = useState("");

  // Settings metadata state
  const [settingsForm, setSettingsForm] = useState<SpaMetadata | null>(null);

  // Leads state
  const [leadsSearch, setLeadsSearch] = useState("");
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadNotesText, setLeadNotesText] = useState("");

  // Load database state
  const loadDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
        if (data.metadata) {
          setSettingsForm(data.metadata);
        }
      } else {
        showFeedback("error", "Failed to load database records");
      }
    } catch (err) {
      showFeedback("error", "Network error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDatabase();
    }
  }, [isAuthenticated]);

  // Helper to flash notifications
  const showFeedback = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Auth Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master pin is 1234
    if (pin === "1234" || pin === "1994") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid Admin PIN. Please check your credentials.");
    }
  };

  // Reset database state to defaults
  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to reset the database? This will revert all custom edits, services, employee records, and contact details back to original default settings.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/db/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDbState(data.db);
        setSettingsForm(data.db.metadata);
        showFeedback("success", "Database reset successfully to original seeds");
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to reset database");
      }
    } catch (err) {
      showFeedback("error", "Failed to reset database due to connection error");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Employees ---
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.role) {
      showFeedback("error", "Name and Role are required");
      return;
    }

    const payload = {
      ...employeeForm,
      salary: Number(employeeForm.salary),
      rating: Number(employeeForm.rating)
    };

    try {
      const url = editingEmployeeId ? `/api/employees/${editingEmployeeId}` : "/api/employees";
      const method = editingEmployeeId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showFeedback("success", editingEmployeeId ? "Employee updated successfully" : "Employee registered successfully");
        setShowEmployeeForm(false);
        setEditingEmployeeId(null);
        setEmployeeForm({
          name: "",
          role: "Therapist",
          specialty: "",
          experience: "",
          salary: 25000,
          status: "Active",
          avatarUrl: "",
          rating: 5.0
        });
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to save employee record");
      }
    } catch (err) {
      showFeedback("error", "Error saving employee");
    }
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setEmployeeForm(emp);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this employee record?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback("success", "Employee deleted successfully");
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to delete employee");
      }
    } catch (err) {
      showFeedback("error", "Error deleting employee");
    }
  };

  const handleMarkAttendance = async (id: string, status: "Present" | "Absent" | "Leave") => {
    try {
      const res = await fetch(`/api/employees/${id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: attendanceDate, status })
      });
      if (res.ok) {
        // Sync local state attendance
        if (dbState) {
          const updatedEmployees = dbState.employees.map(emp => {
            if (emp.id === id) {
              return {
                ...emp,
                attendance: {
                  ...emp.attendance,
                  [attendanceDate]: status
                }
              };
            }
            return emp;
          });
          setDbState({ ...dbState, employees: updatedEmployees });
        }
        showFeedback("success", `Marked attendance for today`);
      } else {
        showFeedback("error", "Failed to log attendance");
      }
    } catch (err) {
      showFeedback("error", "Connection error marking attendance");
    }
  };

  const handleRecordSalaryPayment = async (id: string, baseSalary: number, status: "Paid" | "Pending") => {
    try {
      const res = await fetch(`/api/employees/${id}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: salaryMonth, amount: baseSalary, status })
      });
      if (res.ok) {
        if (dbState) {
          const updatedEmployees = dbState.employees.map(emp => {
            if (emp.id === id) {
              return {
                ...emp,
                salariesPaid: {
                  ...emp.salariesPaid,
                  [salaryMonth]: {
                    amount: baseSalary,
                    date: new Date().toISOString().split("T")[0],
                    status
                  }
                }
              };
            }
            return emp;
          });
          setDbState({ ...dbState, employees: updatedEmployees });
        }
        showFeedback("success", `Recorded salary status for ${salaryMonth}`);
      } else {
        showFeedback("error", "Failed to record salary payment");
      }
    } catch (err) {
      showFeedback("error", "Connection error updating payroll");
    }
  };

  // --- CRUD Services ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price || !serviceForm.category) {
      showFeedback("error", "Name, Price, and Category are required");
      return;
    }

    const payload = {
      ...serviceForm,
      price: Number(serviceForm.price)
    };

    try {
      const url = editingServiceId ? `/api/services/${editingServiceId}` : "/api/services";
      const method = editingServiceId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showFeedback("success", editingServiceId ? "Service updated successfully" : "Service created successfully");
        setShowServiceForm(false);
        setEditingServiceId(null);
        setServiceForm({
          name: "",
          duration: "60 Mins",
          price: 2000,
          category: "massage",
          description: "",
          benefits: [],
          imageUrl: ""
        });
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to save service");
      }
    } catch (err) {
      showFeedback("error", "Connection error saving service");
    }
  };

  const handleEditService = (svc: Service) => {
    setEditingServiceId(svc.id);
    setServiceForm(svc);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this service from the menu?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback("success", "Service deleted from menu");
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to delete service");
      }
    } catch (err) {
      showFeedback("error", "Connection error deleting service");
    }
  };

  const handleAddBenefit = () => {
    if (!newBenefitText.trim()) return;
    setServiceForm({
      ...serviceForm,
      benefits: [...(serviceForm.benefits || []), newBenefitText.trim()]
    });
    setNewBenefitText("");
  };

  const handleRemoveBenefit = (idx: number) => {
    setServiceForm({
      ...serviceForm,
      benefits: (serviceForm.benefits || []).filter((_, i) => i !== idx)
    });
  };

  // --- Update Settings & Metadata ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const res = await fetch("/api/db/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm)
      });

      if (res.ok) {
        showFeedback("success", "Spa metadata and contact configurations saved");
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to save metadata settings");
      }
    } catch (err) {
      showFeedback("error", "Connection error saving metadata");
    }
  };

  const handleTimingChange = (day: string, field: "open" | "close", val: string) => {
    if (!settingsForm) return;
    const updatedHours = settingsForm.hours.map(h => {
      if (h.day === day) {
        return { ...h, [field]: val };
      }
      return h;
    });
    setSettingsForm({ ...settingsForm, hours: updatedHours });
  };

  // --- Manage Leads / Bookings ---
  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showFeedback("success", `Lead status updated to ${status}`);
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to update lead status");
      }
    } catch (err) {
      showFeedback("error", "Network error updating lead status");
    }
  };

  const handleSaveLeadNotes = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: leadNotesText })
      });
      if (res.ok) {
        showFeedback("success", "Saved lead administrative notes");
        setEditingLeadId(null);
        setLeadNotesText("");
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to save notes");
      }
    } catch (err) {
      showFeedback("error", "Network error saving notes");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback("success", "Lead deleted successfully");
        loadDatabase();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to delete lead");
      }
    } catch (err) {
      showFeedback("error", "Network error deleting lead");
    }
  };

  // Calculation statistics
  const totalEmployees = dbState?.employees.length || 0;
  const activeTherapists = dbState?.employees.filter(e => e.status === "Active").length || 0;
  const totalLeads = dbState?.leads.length || 0;
  const pendingLeads = dbState?.leads.filter(l => l.status === "Pending" || l.status === "Confirmed").length || 0;
  const totalMonthlyPayroll = dbState?.employees.reduce((acc, curr) => acc + (curr.status === "Active" ? curr.salary : 0), 0) || 0;

  // Filtered Leads
  const filteredLeads = dbState?.leads.filter(l => {
    const term = leadsSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.phone.includes(term) ||
      l.email.toLowerCase().includes(term) ||
      l.service.toLowerCase().includes(term) ||
      (l.therapist && l.therapist.toLowerCase().includes(term))
    );
  }) || [];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-indigo-50 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-slate-900">SOMA Backoffice Gate</h2>
          <p className="text-sm text-slate-500">
            Please enter your administrative PIN to access attendance logs, salon menu prices, contact details, and payroll metrics.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-left text-xs font-mono text-indigo-600 uppercase tracking-wider mb-2 font-bold">
              Administrative PIN Code
            </label>
            <input 
              type="password" 
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••" 
              className="w-full text-center tracking-[0.5em] bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-lg font-bold"
            />
          </div>

          {authError && (
            <div className="text-xs text-red-600 font-semibold flex items-center justify-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold py-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] text-sm uppercase tracking-wider cursor-pointer"
          >
            Authenticate Portal
          </button>
        </form>

        <p className="text-[10px] text-slate-400 font-mono">
          Demo Access PIN: <strong className="text-indigo-600">1234</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border border-indigo-500/30">
              Admin Backoffice
            </span>
            <span className="bg-green-500/20 text-green-300 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border border-green-500/30">
              Live DB Synced
            </span>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {dbState?.metadata.title || "Soma Spa"} Management Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-sans">
            Oversee corporate spa schedules, staff attendance, wage tracking, and therapeutic pricing models for Indore operations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button 
            onClick={loadDatabase}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full px-4 py-2 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>

          <button 
            onClick={handleResetDatabase}
            className="bg-red-950/40 hover:bg-red-900/40 text-red-200 border border-red-800/50 rounded-full px-4 py-2 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>

        {/* Decorative backdrop gradients */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Global Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-center font-semibold text-sm transition-all animate-scale-up ${
          message.type === "success" 
            ? "bg-green-50 border border-green-200 text-green-800" 
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* Admin Tabs Navigation */}
      <div className="border-b border-slate-200 flex flex-wrap gap-1 sm:gap-2">
        {[
          { id: "overview", label: "Overview Metrics", icon: LayoutDashboard },
          { id: "employees", label: "Employees & Payroll", icon: Users },
          { id: "services", label: "Spa Service Menu", icon: BookOpen },
          { id: "settings", label: "Timing & Address", icon: MapPin },
          { id: "leads", label: `Leads Inbox (${totalLeads})`, icon: Mail }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setShowEmployeeForm(false);
                setShowServiceForm(false);
              }}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isSelected 
                  ? "border-indigo-600 text-indigo-600" 
                  : "border-transparent text-slate-500 hover:text-indigo-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {loading && !dbState && (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Loading secure spa databases...</p>
        </div>
      )}

      {/* Tab Contents */}
      {dbState && (
        <div className="space-y-8">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Statistic Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">Total Employees</span>
                    <strong className="text-2xl font-semibold text-slate-900 block mt-0.5">{totalEmployees} Registered</strong>
                    <span className="text-[10px] text-green-600 font-bold block mt-0.5">● {activeTherapists} Active Therapists</span>
                  </div>
                </div>

                <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                  <div className="p-3.5 bg-teal-50 text-teal-600 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">Est. Monthly Payroll</span>
                    <strong className="text-2xl font-semibold text-slate-900 block mt-0.5">₹{totalMonthlyPayroll.toLocaleString()}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Based on active salaries</span>
                  </div>
                </div>

                <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                  <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">Customer Leads</span>
                    <strong className="text-2xl font-semibold text-slate-900 block mt-0.5">{totalLeads} Total</strong>
                    <span className="text-[10px] text-amber-600 font-bold block mt-0.5">● {pendingLeads} Pending/Confirmed</span>
                  </div>
                </div>

                <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                  <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">Active Therapy Menu</span>
                    <strong className="text-2xl font-semibold text-slate-900 block mt-0.5">{dbState.services.length} Live Items</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Dynamic in-app sync</span>
                  </div>
                </div>

              </div>

              {/* Operational Metadata Snippet Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span>Spa Branch Address & Contact Details</span>
                  </h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <p className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{dbState.metadata.address}</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Phone: <strong>{dbState.metadata.phone}</strong></span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Email: <strong>{dbState.metadata.email}</strong></span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Award className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Active Theme Palette: <strong className="capitalize text-indigo-600">{dbState.metadata.logoPalette || logoPalette}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>Active Daily Operating Timings</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 font-mono">
                    {dbState.metadata.hours.map((h, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-700">{h.day}</span>
                        <span>{h.open} - {h.close}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYEES & PAYROLL */}
          {activeTab === "employees" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Header block */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Spa Staff & Roster Ledger</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage core therapist records, salary structures, and check daily attendance rosters.</p>
                </div>
                {!showEmployeeForm && (
                  <button
                    onClick={() => {
                      setEditingEmployeeId(null);
                      setEmployeeForm({
                        name: "",
                        role: "Therapist",
                        specialty: "Soma Therapy Expert",
                        experience: "5 Years",
                        salary: 25000,
                        status: "Active",
                        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
                        rating: 4.8
                      });
                      setShowEmployeeForm(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Employee</span>
                  </button>
                )}
              </div>

              {/* Employee Registration Form */}
              {showEmployeeForm && (
                <form onSubmit={handleSaveEmployee} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span>{editingEmployeeId ? "Edit Employee Information" : "Register New Employee Card"}</span>
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => setShowEmployeeForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Employee Name</label>
                      <input 
                        type="text" 
                        required
                        value={employeeForm.name}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                        placeholder="E.g., Anand Varma" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Role Title</label>
                      <select
                        value={employeeForm.role}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                      >
                        <option value="Senior Therapist">Senior Therapist</option>
                        <option value="Therapist">Therapist</option>
                        <option value="Salon Manager">Salon Manager</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Wellness Consultant">Wellness Consultant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Specialty Focus</label>
                      <input 
                        type="text" 
                        value={employeeForm.specialty}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, specialty: e.target.value })}
                        placeholder="E.g., Ayurveda & Acupressure" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Experience Span</label>
                      <input 
                        type="text" 
                        value={employeeForm.experience}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, experience: e.target.value })}
                        placeholder="E.g., 5 Years" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Monthly Base Salary (INR)</label>
                      <input 
                        type="number" 
                        required
                        value={employeeForm.salary}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })}
                        placeholder="E.g., 25000" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Status Condition</label>
                      <select
                        value={employeeForm.status}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Staff Avatar URL</label>
                      <input 
                        type="text" 
                        value={employeeForm.avatarUrl}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, avatarUrl: e.target.value })}
                        placeholder="Image URL" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Star Rating</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        max="5"
                        value={employeeForm.rating}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, rating: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowEmployeeForm(false)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Save Employee File
                    </button>
                  </div>
                </form>
              )}

              {/* Roster list table */}
              <div className="bg-white border border-indigo-50 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-indigo-50 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">Registered Spa Staff ({dbState.employees.length})</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-mono text-xs uppercase border-b border-indigo-50 font-bold">
                        <th className="px-6 py-3.5">Employee</th>
                        <th className="px-6 py-3.5">Specialty & Role</th>
                        <th className="px-6 py-3.5">Monthly Salary</th>
                        <th className="px-6 py-3.5">Rating / Exp</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50">
                      {dbState.employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/40">
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <img 
                              src={emp.avatarUrl} 
                              alt={emp.name} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded-full border border-indigo-100 shadow-sm"
                            />
                            <div>
                              <strong className="text-slate-900 font-semibold text-sm">{emp.name}</strong>
                              <span className="block text-[11px] text-slate-400 font-mono">ID: {emp.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <strong className="text-slate-800 font-medium block text-xs uppercase font-mono tracking-wide text-indigo-600">{emp.role}</strong>
                            <span className="text-xs text-slate-500 mt-0.5 block">{emp.specialty}</span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-900">
                            ₹{emp.salary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            <p>Rating: <strong className="text-amber-500">★ {emp.rating}</strong></p>
                            <p className="mt-0.5">Exp: <strong className="text-slate-700">{emp.experience}</strong></p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              emp.status === "Active" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : emp.status === "On Leave"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleEditEmployee(emp)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 transition-colors"
                                title="Edit employee details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition-colors"
                                title="Remove employee card"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: ATTENDANCE TRACKER */}
              <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span>Staff Attendance Log Sheet</span>
                    </h3>
                    <p className="text-xs text-slate-500">Track and log daily attendance rosters for Active specialists.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-500 font-bold uppercase">Roster Date:</span>
                    <input 
                      type="date" 
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dbState.employees.filter(e => e.status === "Active").map((emp) => {
                    const currentAttendance = emp.attendance?.[attendanceDate] || "Absent";
                    return (
                      <div key={emp.id} className="border border-indigo-50 rounded-xl p-4 flex items-center justify-between bg-slate-50/20">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={emp.avatarUrl} 
                            alt={emp.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                          <div>
                            <strong className="text-slate-800 block font-semibold text-sm">{emp.name}</strong>
                            <span className="text-xs font-mono text-indigo-600 font-bold uppercase">{emp.role}</span>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          {(["Present", "Absent", "Leave"] as const).map((status) => {
                            const isSelected = currentAttendance === status;
                            let style = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
                            if (isSelected) {
                              if (status === "Present") style = "bg-green-600 text-white border-transparent shadow-sm";
                              if (status === "Absent") style = "bg-red-600 text-white border-transparent shadow-sm";
                              if (status === "Leave") style = "bg-amber-500 text-white border-transparent shadow-sm";
                            }
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleMarkAttendance(emp.id, status)}
                                className={`px-2.5 py-1 text-[11px] font-bold border rounded-lg transition-all cursor-pointer ${style}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: SALARY METRICS & PAYROLL */}
              <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-indigo-600" />
                      <span>Payroll & Wages Disbursement</span>
                    </h3>
                    <p className="text-xs text-slate-500">Record and review salary payout status files of registered employees.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-500 font-bold uppercase">Salary Month:</span>
                    <input 
                      type="month" 
                      value={salaryMonth}
                      onChange={(e) => setSalaryMonth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-mono text-[11px] uppercase border-b border-indigo-50 font-bold">
                        <th className="px-6 py-2.5">Staff Employee</th>
                        <th className="px-6 py-2.5">Base Wage (INR)</th>
                        <th className="px-6 py-2.5">Disbursed Date</th>
                        <th className="px-6 py-2.5">Payroll Status</th>
                        <th className="px-6 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50">
                      {dbState.employees.map((emp) => {
                        const paidInfo = emp.salariesPaid?.[salaryMonth];
                        const isPaid = paidInfo?.status === "Paid";
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/20">
                            <td className="px-6 py-3 font-semibold text-slate-800">{emp.name}</td>
                            <td className="px-6 py-3 font-mono font-bold text-slate-900">₹{emp.salary.toLocaleString()}</td>
                            <td className="px-6 py-3 text-slate-500 font-mono">{paidInfo ? paidInfo.date : "--"}</td>
                            <td className="px-6 py-3">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isPaid 
                                  ? "bg-green-50 text-green-700 border border-green-200" 
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}>
                                {isPaid ? "Disbursed" : "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleRecordSalaryPayment(emp.id, emp.salary, "Paid")}
                                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-full transition-all cursor-pointer ${
                                    isPaid 
                                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                                      : "bg-green-600 hover:bg-green-500 text-white border-transparent shadow-sm"
                                  }`}
                                  disabled={isPaid}
                                >
                                  Disburse Wage
                                </button>
                                {isPaid && (
                                  <button
                                    onClick={() => handleRecordSalaryPayment(emp.id, emp.salary, "Pending")}
                                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-full transition-all cursor-pointer"
                                  >
                                    Revert
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SERVICES MENU */}
          {activeTab === "services" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Active Healing Therapy Menu</h2>
                  <p className="text-xs text-slate-500 mt-1">Configure therapeutic service rates, duration periods, image assets, and target descriptions.</p>
                </div>
                {!showServiceForm && (
                  <button
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm({
                        name: "",
                        duration: "60 Mins",
                        price: 2200,
                        category: "massage",
                        description: "",
                        benefits: [],
                        imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
                      });
                      setShowServiceForm(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Service</span>
                  </button>
                )}
              </div>

              {/* Service Add/Edit Form */}
              {showServiceForm && (
                <form onSubmit={handleSaveService} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span>{editingServiceId ? "Modify Menu Service Details" : "Register New Healing Therapy"}</span>
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => setShowServiceForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Therapy/Service Name</label>
                      <input 
                        type="text" 
                        required
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        placeholder="E.g., Marma Points Aromatherapy" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Menu Rate price (INR)</label>
                      <input 
                        type="number" 
                        required
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                        placeholder="E.g., 2400" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Category Sector</label>
                      <select
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                      >
                        <option value="massage">Restorative Massages</option>
                        <option value="ayurveda">Traditional Ayurveda</option>
                        <option value="facial">Skin Rejuvenation</option>
                        <option value="package">Wellness Ritual Packages</option>
                        <option value="wellness">General Holistic Wellness</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Service Duration</label>
                      <input 
                        type="text" 
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                        placeholder="E.g., 60 / 90 Mins" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Service Banner Image URL</label>
                      <input 
                        type="text" 
                        value={serviceForm.imageUrl}
                        onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                        placeholder="Image URL" 
                        className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Therapeutic Commentary Description</label>
                    <textarea 
                      required
                      rows={3}
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      placeholder="Share details of therapy strokes, herbal oil mixtures, physical stress relief properties..."
                      className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                    />
                  </div>

                  {/* Benefits Array Manager */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Targeted Wellness Benefits (Bullet Points)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newBenefitText}
                        onChange={(e) => setNewBenefitText(e.target.value)}
                        placeholder="Add benefit points (e.g. Clears lymphatic blockages)" 
                        className="flex-1 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddBenefit}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 rounded-xl text-xs uppercase"
                      >
                        Add Point
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {serviceForm.benefits?.map((b, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full border border-indigo-100 flex items-center space-x-1">
                          <span>{b}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveBenefit(idx)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowServiceForm(false)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Commit Service
                    </button>
                  </div>
                </form>
              )}

              {/* Service Cards list for admin */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbState.services.map((svc) => (
                  <div key={svc.id} className="bg-white border border-indigo-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="relative h-40">
                        <img 
                          src={svc.imageUrl} 
                          alt={svc.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                          {svc.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif font-bold text-slate-900 text-lg leading-snug">{svc.name}</h4>
                          <strong className="text-indigo-600 font-mono text-base font-bold shrink-0">₹{svc.price}</strong>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                          {svc.description}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                          Duration: <strong className="text-slate-700">{svc.duration}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex gap-2 border-t border-slate-50 mt-4 pt-3">
                      <button
                        onClick={() => handleEditService(svc)}
                        className="flex-1 border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 font-semibold py-2 rounded-xl text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Therapy</span>
                      </button>
                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="p-2 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                        title="Delete Therapy Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: SETTINGS, TIMINGS & ADDRESS */}
          {activeTab === "settings" && settingsForm && (
            <form onSubmit={handleSaveSettings} className="space-y-8 animate-fade-in">
              
              <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <span>Contact Details & Meta Configurations</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Configure the main branding metadata, address line, support phone numbers, and theme.</p>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    Save Configuration
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Spa Title Name</label>
                    <input 
                      type="text" 
                      required
                      value={settingsForm.title}
                      onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Spa Slogan Tagline</label>
                    <input 
                      type="text" 
                      required
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Contact Hotline Number</label>
                    <input 
                      type="text" 
                      required
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Support Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Logo Theme Palette</label>
                    <select
                      value={settingsForm.logoPalette}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoPalette: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-semibold"
                    >
                      <option value="sunset-gold">Sunset Gold (Golden, Premium)</option>
                      <option value="cosmic-ocean">Cosmic Ocean (Deep Blue/Purple)</option>
                      <option value="teal-mint">Teal Mint (Relaxing Green)</option>
                      <option value="royal-indigo">Royal Indigo (Vibrant Indigo)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Corporate Physical Address (Full Line)</label>
                  <input 
                    type="text" 
                    required
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider mb-1 font-bold">Homepage Bio Description Summary</label>
                  <textarea 
                    required
                    rows={3}
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 leading-relaxed"
                  />
                </div>

              </div>

              {/* TIMINGS MANAGEMENT CARD */}
              <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>Daily Operating Timings Scheduler</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Configure exact business open and close timing profiles for Indore clients.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {settingsForm.hours.map((h, i) => (
                    <div key={i} className="border border-indigo-50 rounded-xl p-4 space-y-2 bg-slate-50/20">
                      <strong className="text-slate-800 block font-mono text-xs uppercase tracking-wide border-b border-slate-100 pb-1 font-bold">{h.day}</strong>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block font-bold">Open Time</label>
                          <input 
                            type="text" 
                            required
                            value={h.open}
                            onChange={(e) => handleTimingChange(h.day, "open", e.target.value)}
                            placeholder="E.g. 08:00 AM"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block font-bold">Close Time</label>
                          <input 
                            type="text" 
                            required
                            value={h.close}
                            onChange={(e) => handleTimingChange(h.day, "close", e.target.value)}
                            placeholder="E.g. 09:30 PM"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </form>
          )}

          {/* TAB 5: LEADS INBOX */}
          {activeTab === "leads" && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-2 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Spa Customer Leads & Inquiries</h2>
                  <p className="text-xs text-slate-500 mt-1">Review active online booking leads, update reservation files, and document operator feedback notes.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      value={leadsSearch}
                      onChange={(e) => setLeadsSearch(e.target.value)}
                      placeholder="Search name, phone, service..." 
                      className="bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none w-52 sm:w-64 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Leads Listing */}
              <div className="space-y-4">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-indigo-100 rounded-2xl bg-white space-y-2">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">No matching leads found</p>
                    <p className="text-xs text-slate-400">Try modifying your search filter query</p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const isEditingNotes = editingLeadId === lead.id;
                    return (
                      <div 
                        key={lead.id} 
                        className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-6"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-3">
                            {/* Lead ID & Timestamp */}
                            <div className="flex items-center space-x-2 flex-wrap gap-1">
                              <span className="font-mono text-xs uppercase text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                {lead.id}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "Prior Seed"}
                              </span>
                            </div>

                            {/* Guest main coordinates */}
                            <div className="space-y-1">
                              <h4 className="font-serif text-lg font-bold text-slate-900 font-semibold">{lead.name}</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                <span className="flex items-center space-x-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  <strong>{lead.phone}</strong>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{lead.email}</span>
                                </span>
                              </div>
                            </div>

                            {/* Booking specifics */}
                            <div className="bg-slate-50/50 border border-indigo-50/70 rounded-xl p-3.5 text-xs text-slate-600 space-y-1 sm:w-[480px]">
                              <p>Therapeutic Service: <strong className="text-slate-800">{lead.service}</strong></p>
                              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/50 mt-1.5 font-mono text-[11px] font-bold">
                                <p>Date: <span className="text-indigo-600">{lead.date}</span></p>
                                <p>Slot: <span className="text-indigo-600">{lead.time}</span></p>
                                <p>Staff: <span className="text-indigo-600">{lead.therapist}</span></p>
                              </div>
                            </div>
                          </div>

                          {/* Status and Action controls */}
                          <div className="space-y-3 sm:text-right w-full sm:w-auto shrink-0 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-1">Lead status</span>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                lead.status === "Pending" 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : lead.status === "Confirmed"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : lead.status === "Completed"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {lead.status || "Pending"}
                              </span>
                            </div>

                            <div className="flex gap-1">
                              {(["Pending", "Confirmed", "Completed", "Cancelled"] as const).map((status) => {
                                if (lead.status === status) return null;
                                return (
                                  <button
                                    key={status}
                                    onClick={() => handleUpdateLeadStatus(lead.id!, status)}
                                    className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-all cursor-pointer uppercase tracking-wider font-semibold"
                                  >
                                    {status}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Guest Request notes or admin notes */}
                        <div className="border-t border-slate-100 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="text-xs text-slate-600 flex-1 space-y-1.5">
                            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Admin/Guest Notes Log</p>
                            
                            {isEditingNotes ? (
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={leadNotesText}
                                  onChange={(e) => setLeadNotesText(e.target.value)}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs"
                                  placeholder="Type administrative action details..."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveLeadNotes(lead.id!)}
                                  className="bg-indigo-600 text-white font-bold text-[10px] px-3.5 py-1 rounded-lg uppercase"
                                >
                                  Save Log
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingLeadId(null)}
                                  className="border border-slate-200 text-slate-500 font-bold text-[10px] px-3.5 py-1 rounded-lg uppercase"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <p className="italic bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600 font-medium">
                                {lead.notes ? `"${lead.notes}"` : '"No specific customer commentary recorded"'}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 pt-4 sm:pt-0 self-end sm:self-auto">
                            {!isEditingNotes && (
                              <button
                                onClick={() => {
                                  setEditingLeadId(lead.id!);
                                  setLeadNotesText(lead.notes || "");
                                }}
                                className="px-3.5 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all cursor-pointer font-bold flex items-center space-x-1"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Modify Notes Log</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteLead(lead.id!)}
                              className="p-1.5 border border-slate-100 hover:border-red-100 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                              title="Delete Lead Reservation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
