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
  AlertCircle,
  FileText,
  Receipt,
  Printer,
  Download,
  Ticket
} from "lucide-react";
import { Employee, Service, Booking, SpaMetadata, OperatingHour, Bill, BillItem } from "../types";

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
    dbType?: "supabase" | "local";
    isSupabaseConfigured?: boolean;
    supabaseError?: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "services" | "settings" | "leads" | "billing">("overview");

  // Billing & Invoices state
  const [bills, setBills] = useState<Bill[]>([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billSearch, setBillSearch] = useState("");
  const [billForm, setBillForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    items: [] as BillItem[],
    therapistId: "",
    therapistName: "",
    date: new Date().toISOString().split("T")[0],
    discount: 0,
    tax: 0,
    paymentMethod: "Cash" as "Cash" | "UPI" | "Card" | "Net Banking",
    status: "Paid" as "Paid" | "Pending"
  });
  const [tempSelectedItem, setTempSelectedItem] = useState({
    serviceId: "",
    qty: 1
  });

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
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  // Logo brand kit state
  const [logoStatus, setLogoStatus] = useState<any>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [processingLogo, setProcessingLogo] = useState(false);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDims, setImgDims] = useState<{ width: number; height: number } | null>(null);

  const fetchLogoStatus = async () => {
    try {
      const res = await fetch("/api/logo-status");
      if (res.ok) {
        const data = await res.json();
        setLogoStatus(data);
      }
    } catch (err) {
      console.error("Error fetching logo status:", err);
    }
  };

  useEffect(() => {
    fetchLogoStatus();
  }, []);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        showFeedback("error", "Invalid file type. Please upload a JPEG or PNG logo image.");
        return;
      }
      setSelectedLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
      setCropZoom(1.0);
      setCropOffset({ x: 0, y: 0 });
      setImgDims(null);
    }
  };

  const handleCropperImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgDims({ width: naturalWidth, height: naturalHeight });
    setCropZoom(1.0);
    setCropOffset({ x: 0, y: 0 });
  };

  const handleLogoMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(true);
    setDragStart({
      x: e.clientX - cropOffset.x,
      y: e.clientY - cropOffset.y
    });
  };

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingLogo) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleLogoMouseUp = () => {
    setIsDraggingLogo(false);
  };

  const handleLogoTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDraggingLogo(true);
      setDragStart({
        x: e.touches[0].clientX - cropOffset.x,
        y: e.touches[0].clientY - cropOffset.y
      });
    }
  };

  const handleLogoTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingLogo || e.touches.length !== 1) return;
    setCropOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const getCropperImageStyle = () => {
    if (!imgDims) return { display: "none" };
    
    const VP_SIZE = 240;
    const baseScale = Math.min(VP_SIZE / imgDims.width, VP_SIZE / imgDims.height);
    const baseWidth = imgDims.width * baseScale;
    const baseHeight = imgDims.height * baseScale;
    
    const currentWidth = baseWidth * cropZoom;
    const currentHeight = baseHeight * cropZoom;
    
    const left = (VP_SIZE - currentWidth) / 2 + cropOffset.x;
    const top = (VP_SIZE - currentHeight) / 2 + cropOffset.y;
    
    return {
      width: `${currentWidth}px`,
      height: `${currentHeight}px`,
      left: `${left}px`,
      top: `${top}px`,
      position: "absolute" as const,
      maxWidth: "none",
      maxHeight: "none",
      pointerEvents: "none" as const
    };
  };

  const processImageToSizes = (
    file: File,
    zoom: number,
    offset: { x: number; y: number }
  ): Promise<{
    logoLarge: string;
    logoMedium: string;
    logoSmall: string;
    logoLargeJpg: string;
    logoMediumJpg: string;
    logoSmallJpg: string;
    logoLargeWebp: string;
    logoMediumWebp: string;
    logoSmallWebp: string;
    favicon32: string;
    favicon16: string;
    faviconSvg: string;
  }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width || 240;
        const height = img.naturalHeight || img.height || 240;

        const sizes = {
          logoLarge: 512,
          logoMedium: 180,
          logoSmall: 64,
          favicon32: 32,
          favicon16: 16
        };
        const results: any = {};
        const VP_SIZE = 240;
        
        // Match the layout calculations exactly
        const baseScale = Math.min(VP_SIZE / width, VP_SIZE / height);
        const baseWidth = width * baseScale;
        const baseHeight = height * baseScale;
        
        const currentWidth = baseWidth * zoom;
        const currentHeight = baseHeight * zoom;
        
        Object.entries(sizes).forEach(([key, size]) => {
          const scaleFactor = size / VP_SIZE;
          
          // 1. Render PNG with transparent background
          const pngCanvas = document.createElement("canvas");
          pngCanvas.width = size;
          pngCanvas.height = size;
          const pngCtx = pngCanvas.getContext("2d");
          
          if (pngCtx) {
            const drawWidth = currentWidth * scaleFactor;
            const drawHeight = currentHeight * scaleFactor;
            const drawX = (size - drawWidth) / 2 + offset.x * scaleFactor;
            const drawY = (size - drawHeight) / 2 + offset.y * scaleFactor;
            
            // Clear to transparency
            pngCtx.clearRect(0, 0, size, size);
            pngCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            results[key] = pngCanvas.toDataURL("image/png");
            
            // WebP supporting transparency
            if (key === "logoLarge" || key === "logoMedium" || key === "logoSmall") {
              results[`${key}Webp`] = pngCanvas.toDataURL("image/webp", 0.9);
            }
          }
          
          // 2. Render JPEG with a white background to prevent transparent areas from turning black
          if (key === "logoLarge" || key === "logoMedium" || key === "logoSmall") {
            const jpgCanvas = document.createElement("canvas");
            jpgCanvas.width = size;
            jpgCanvas.height = size;
            const jpgCtx = jpgCanvas.getContext("2d");
            
            if (jpgCtx) {
              jpgCtx.fillStyle = "#FFFFFF";
              jpgCtx.fillRect(0, 0, size, size);
              
              const drawWidth = currentWidth * scaleFactor;
              const drawHeight = currentHeight * scaleFactor;
              const drawX = (size - drawWidth) / 2 + offset.x * scaleFactor;
              const drawY = (size - drawHeight) / 2 + offset.y * scaleFactor;
              
              jpgCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
              results[`${key}Jpg`] = jpgCanvas.toDataURL("image/jpeg", 0.9);
            }
          }
        });
        
        // Wrap the base64 PNG in a valid SVG document for favicon.svg so it renders properly in browsers
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <image href="${results.logoSmall}" x="0" y="0" width="100" height="100" />
</svg>`;
        
        resolve({
          ...results,
          faviconSvg: svgString
        });
      };
      img.onerror = () => {
        reject(new Error("Could not load image file. Ensure it is a valid JPEG/PNG."));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleProcessAndDeployLogo = async () => {
    if (!selectedLogoFile) return;
    setProcessingLogo(true);
    try {
      const sizes = await processImageToSizes(selectedLogoFile, cropZoom, cropOffset);
      
      const response = await fetch("/api/save-logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          logoLarge: sizes.logoLarge,
          logoMedium: sizes.logoMedium,
          logoSmall: sizes.logoSmall,
          logoLargeJpg: sizes.logoLargeJpg,
          logoMediumJpg: sizes.logoMediumJpg,
          logoSmallJpg: sizes.logoSmallJpg,
          logoLargeWebp: sizes.logoLargeWebp,
          logoMediumWebp: sizes.logoMediumWebp,
          logoSmallWebp: sizes.logoSmallWebp,
          favicon32: sizes.favicon32,
          favicon16: sizes.favicon16,
          faviconSvg: sizes.faviconSvg
        })
      });
      
      if (response.ok) {
        showFeedback("success", "Custom brand logo processed and deployed successfully!");
        setSelectedLogoFile(null);
        setLogoPreviewUrl(null);
        await fetchLogoStatus();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to deploy processed brand assets.");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to process logo file.");
    } finally {
      setProcessingLogo(false);
    }
  };

  const handleDeleteCustomLogo = async () => {
    if (!window.confirm("Are you sure you want to delete the custom logo assets and revert to SOMA's default vector brand?")) {
      return;
    }
    setProcessingLogo(true);
    try {
      const res = await fetch("/api/delete-logo", { method: "POST" });
      if (res.ok) {
        showFeedback("success", "Custom logo assets deleted. Reverted to default vector logo.");
        setSelectedLogoFile(null);
        setLogoPreviewUrl(null);
        await fetchLogoStatus();
        onRefreshApp();
      } else {
        showFeedback("error", "Failed to delete custom logo assets.");
      }
    } catch (err: any) {
      showFeedback("error", "Failed to connect to logo delete service.");
    } finally {
      setProcessingLogo(false);
    }
  };

  // Fetch bills from backend
  const fetchBills = async () => {
    try {
      const res = await fetch("/api/bills");
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch (err) {
      console.error("Failed to load bills", err);
    }
  };

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
        await fetchBills();
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

  // Add item to bill form
  const handleAddItemToBill = () => {
    if (!tempSelectedItem.serviceId) {
      showFeedback("error", "Please select a service to add");
      return;
    }
    const service = dbState?.services.find((s) => s.id === tempSelectedItem.serviceId);
    if (!service) return;

    // Check if item already exists, if so increment qty
    const existingIdx = billForm.items.findIndex((item) => item.serviceId === service.id);
    if (existingIdx > -1) {
      const updatedItems = [...billForm.items];
      updatedItems[existingIdx].qty += Number(tempSelectedItem.qty || 1);
      setBillForm({ ...billForm, items: updatedItems });
    } else {
      const newItem: BillItem = {
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        qty: Number(tempSelectedItem.qty || 1)
      };
      setBillForm({ ...billForm, items: [...billForm.items, newItem] });
    }
    // reset selection
    setTempSelectedItem({ serviceId: "", qty: 1 });
  };

  // Remove item from bill form
  const handleRemoveItemFromBill = (serviceId: string) => {
    const updatedItems = billForm.items.filter((item) => item.serviceId !== serviceId);
    setBillForm({ ...billForm, items: updatedItems });
  };

  // Calculate invoice subtotal dynamically
  const calculateBillSubtotal = () => {
    return billForm.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  // Submit and create the bill
  const handleCreateBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.customerName || !billForm.customerPhone) {
      showFeedback("error", "Customer name and phone number are required");
      return;
    }
    if (billForm.items.length === 0) {
      showFeedback("error", "At least one service must be added to the invoice");
      return;
    }

    try {
      setLoading(true);
      const subtotal = calculateBillSubtotal();
      // Match therapist name if therapistId is set
      let tName = "";
      if (billForm.therapistId) {
        const therapist = dbState?.employees.find((e) => e.id === billForm.therapistId);
        if (therapist) tName = therapist.name;
      }

      const payload = {
        customerName: billForm.customerName,
        customerPhone: billForm.customerPhone,
        customerEmail: billForm.customerEmail,
        items: billForm.items,
        therapistId: billForm.therapistId,
        therapistName: tName,
        date: billForm.date,
        discount: Number(billForm.discount || 0),
        tax: Number(billForm.tax || 0),
        paymentMethod: billForm.paymentMethod,
        status: billForm.status
      };

      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdBill = await res.json();
        showFeedback("success", "Invoice generated successfully");
        // Update local state
        await fetchBills();
        // Open the generated invoice details for viewing/printing!
        setSelectedBill(createdBill);
        // Reset form
        setBillForm({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          items: [],
          therapistId: "",
          therapistName: "",
          date: new Date().toISOString().split("T")[0],
          discount: 0,
          tax: 0,
          paymentMethod: "Cash",
          status: "Paid"
        });
        setShowBillForm(false);
      } else {
        const errData = await res.json();
        showFeedback("error", errData.error || "Failed to generate invoice");
      }
    } catch (err) {
      showFeedback("error", "Network error generating invoice");
    } finally {
      setLoading(false);
    }
  };

  // Delete invoice
  const handleDeleteBill = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete/void this invoice?")) return;
    try {
      const res = await fetch(`/api/bills/${id}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback("success", "Invoice deleted/voided successfully");
        await fetchBills();
      } else {
        showFeedback("error", "Failed to delete invoice");
      }
    } catch (err) {
      showFeedback("error", "Network error deleting invoice");
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
          { id: "leads", label: `Leads Inbox (${totalLeads})`, icon: Mail },
          { id: "billing", label: "Billing & Invoices", icon: Receipt }
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

              {/* Database Connection & Diagnostics status */}
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      dbState.dbType === "supabase" && !dbState.supabaseError
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : dbState.supabaseError
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      <ShieldCheck className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        Database Engine Connectivity
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        Operational state diagnostics for SOMA Spa databases
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dbState.dbType === "supabase" && !dbState.supabaseError ? (
                      <>
                        <span className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          SUPABASE ACTIVE
                        </span>
                        <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20 font-mono">
                          CLOUD MODE
                        </span>
                      </>
                    ) : dbState.supabaseError ? (
                      <>
                        <span className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          CONNECTION ERROR
                        </span>
                        <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 font-mono">
                          LOCAL FALLBACK ACTIVE
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          DEMO SANDBOX MODE
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 font-mono">
                          LOCAL JSON FILE
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {dbState.dbType === "supabase" && !dbState.supabaseError ? (
                    <div className="text-sm text-slate-300 leading-relaxed font-sans max-w-4xl space-y-2">
                      <p>
                        Your backoffice is <strong className="text-green-400">fully connected to your production Supabase database</strong>. All customer reviews, booked ayurvedic leads, therapist registrations, timing updates, and menu adjustments are live, secure, and globally distributed.
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        • Verified tables: `spa_metadata`, `employees`, `services`, `bookings`, `reviews` are fully synchronized.
                      </p>
                    </div>
                  ) : dbState.supabaseError ? (
                    <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-2xl space-y-3">
                      <div className="flex items-start space-x-2.5 text-red-300 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-semibold">Supabase Connection Attempt Failed</strong>
                          <p className="mt-1 text-xs text-red-400/90 font-mono whitespace-pre-wrap">
                            Error description: {dbState.supabaseError}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Your Supabase credentials (<code className="text-indigo-300">SUPABASE_URL</code> and <code className="text-indigo-300">SUPABASE_ANON_KEY</code>) are present in your environment secrets, but the database client threw an error. This almost always means the **required database tables do not exist yet** in your Supabase project. To resolve this, run the SQL setup schema script below in your Supabase SQL editor.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-300 leading-relaxed font-sans max-w-4xl space-y-3">
                      <p>
                        The application is currently running in <strong className="text-amber-400">Demo Sandbox Mode</strong> using a local database (<code className="font-mono text-indigo-300">server_db.json</code>). While fully functional for testing, modifications will not be saved permanently to a cloud database if the container restarts.
                      </p>
                      <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                        <strong className="text-indigo-400 font-mono uppercase tracking-wider block">How to connect your live Supabase database:</strong>
                        <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                          <li>Create a free account or project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300">Supabase.com</a>.</li>
                          <li>Open your Supabase **Project Settings** &gt; **API** to copy your **Project URL** and **anon public Key**.</li>
                          <li>Open the **Secrets Panel** (or Settings Gear) in your Google AI Studio workspace and add:
                            <code className="block bg-slate-900 border border-slate-800 text-indigo-300 px-2.5 py-1 rounded mt-1 font-mono font-bold whitespace-pre-wrap">
{`SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_public_key`}
                            </code>
                          </li>
                          <li>Click **Sync DB** or restart the development server to activate the cloud connection instantly!</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => setShowSqlSchema(!showSqlSchema)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{showSqlSchema ? "Hide SQL Setup Script" : "View Supabase SQL Setup Schema"}</span>
                    </button>
                  </div>

                  {showSqlSchema && (
                    <div className="space-y-3 animate-scale-up pt-2">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Copy and execute the following SQL statement in the **SQL Editor** tab inside your Supabase dashboard to create all required database tables and seed SOMA's default Indore branch details instantly:
                      </p>
                      <div className="relative">
                        <pre className="bg-slate-950 text-indigo-300 border border-slate-800 rounded-2xl p-5 text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed whitespace-pre select-all">
{`-- 1. Create spa_metadata table
CREATE TABLE IF NOT EXISTS spa_metadata (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_palette TEXT,
  hours JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  experience TEXT,
  rating NUMERIC DEFAULT 5.0,
  avatar_url TEXT,
  salary NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  attendance JSONB DEFAULT '{}'::jsonb,
  salaries_paid JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT,
  price NUMERIC DEFAULT 0,
  category TEXT,
  description TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  therapist TEXT,
  status TEXT DEFAULT 'Confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  rating NUMERIC DEFAULT 5,
  comment TEXT,
  date TEXT,
  service TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default metadata row (Required)
INSERT INTO spa_metadata (id, title, tagline, description, address, phone, email, logo_palette, hours)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Soma Spa',
  'SPA & WELLNESS CENTRE',
  'Welcome to Soma spa and wellness center, a premium holistic oasis combining ancient healing modalities with modern sensory refinement. Indulge in warm customized oils, organic face treatments, and tailored aromatherapies designed to soothe and restore.',
  '19 GH, 2nd Floor, Mittal Kachori building, scheme no 54, Vijay nagar, Indore 452010',
  '+91 89823 71810',
  'hello@somaspaindore.com',
  'sunset-gold',
  '[
    {"day": "Monday", "open": "08:00 AM", "close": "09:30 PM"},
    {"day": "Tuesday", "open": "08:00 AM", "close": "09:30 PM"},
    {"day": "Wednesday", "open": "08:00 AM", "close": "09:30 PM"},
    {"day": "Thursday", "open": "08:00 AM", "close": "09:30 PM"},
    {"day": "Friday", "open": "08:00 AM", "close": "09:30 PM"},
    {"day": "Saturday", "open": "08:00 AM", "close": "09:30 PM"},
    {"day": "Sunday", "open": "08:00 AM", "close": "09:30 PM"}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;`}
                        </pre>
                      </div>
                    </div>
                  )}
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
            <>
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

              {/* BRAND KIT & LOGO UPLOADER CARD */}
              <div className="bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm space-y-6 mt-8 animate-fade-in">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span>Soma Brand Asset Kit & Logo Deployer</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your high-resolution corporate logo. Our system will automatically convert, optimize, and deploy it in all correct sizes (512px, 180px, 64px, and standard 32x32 & 16x16 favicons).
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Interactive Brand Logo Workspace */}
                  <div className="space-y-4">
                    <label className="block text-xs font-mono text-indigo-600 uppercase tracking-wider font-bold">
                      Brand Logo Workspace (PNG or JPEG)
                    </label>

                    {!selectedLogoFile ? (
                      <div 
                        className="border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer border-slate-200 hover:border-indigo-400 bg-slate-50/30"
                        onClick={() => document.getElementById("brand-logo-file-input")?.click()}
                      >
                        <input 
                          type="file" 
                          id="brand-logo-file-input"
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={handleLogoFileChange}
                        />
                        <div className="space-y-2">
                          <Download className="w-8 h-8 text-slate-400 mx-auto animate-bounce" />
                          <div>
                            <span className="text-xs font-bold text-indigo-600 block">Drag and drop or click to browse</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Supports high-res JPEG, JPG, PNG files</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col items-center">
                        <div className="text-center w-full pb-2 border-b border-slate-150 flex items-center justify-between text-xs text-slate-500 font-semibold">
                          <span>Interactive Cropper Tool</span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">1:1 Square</span>
                        </div>

                        {/* Draggable Viewport Container */}
                        <div 
                          className="relative w-[240px] h-[240px] bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-inner select-none cursor-move flex items-center justify-center"
                          onMouseDown={handleLogoMouseDown}
                          onMouseMove={handleLogoMouseMove}
                          onMouseUp={handleLogoMouseUp}
                          onMouseLeave={handleLogoMouseUp}
                          onTouchStart={handleLogoTouchStart}
                          onTouchMove={handleLogoTouchMove}
                          onTouchEnd={handleLogoMouseUp}
                        >
                          {logoPreviewUrl && (
                            <img
                              src={logoPreviewUrl}
                              alt="Crop source"
                              onLoad={handleCropperImageLoad}
                              draggable={false}
                              style={getCropperImageStyle()}
                            />
                          )}
                          
                          {/* Dark Outer Mask Ring to help visualize the Crop Boundary */}
                          <div className="absolute inset-0 border-[20px] border-black/35 rounded-xl pointer-events-none" />
                          
                          {/* Dashed Crop Square Selection Boundary */}
                          <div className="absolute inset-5 border-2 border-dashed border-white/90 rounded-lg pointer-events-none shadow-[0_0_0_999px_rgba(0,0,0,0.15)]" />
                          
                          {/* Inner Alignment Gridlines */}
                          <div className="absolute inset-5 pointer-events-none">
                            <div className="absolute inset-x-0 top-1/3 border-t border-white/30" />
                            <div className="absolute inset-x-0 top-2/3 border-t border-white/30" />
                            <div className="absolute inset-y-0 left-1/3 border-l border-white/30" />
                            <div className="absolute inset-y-0 left-2/3 border-l border-white/30" />
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 text-center leading-normal">
                          💡 <span className="font-bold">Drag and pan</span> the logo inside the frame. Use the slider below to zoom.
                        </div>

                        {/* Zoom Level Control Slider */}
                        <div className="space-y-1.5 w-full">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-mono uppercase tracking-wider text-[10px] font-bold">Zoom Scale</span>
                            <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{cropZoom.toFixed(2)}x</span>
                          </div>
                          <input 
                            type="range"
                            min="1.0"
                            max="4.0"
                            step="0.05"
                            value={cropZoom}
                            onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                          />
                        </div>

                        {/* Preset Crop Boundaries Shortcuts */}
                        <div className="flex w-full gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => { setCropZoom(1.0); setCropOffset({ x: 0, y: 0 }); }}
                            className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg py-1.5 px-2 transition-all cursor-pointer shadow-sm text-center"
                          >
                            Fit Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (imgDims) {
                                const VP_SIZE = 240;
                                const containScale = Math.min(VP_SIZE / imgDims.width, VP_SIZE / imgDims.height);
                                const coverScale = Math.max(VP_SIZE / imgDims.width, VP_SIZE / imgDims.height);
                                const ratio = coverScale / containScale;
                                setCropZoom(Math.max(1.0, ratio));
                                setCropOffset({ x: 0, y: 0 });
                              }
                            }}
                            className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg py-1.5 px-2 transition-all cursor-pointer shadow-sm text-center"
                          >
                            Fill Area
                          </button>
                          <button
                            type="button"
                            onClick={() => setCropOffset({ x: 0, y: 0 })}
                            className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg py-1.5 px-2 transition-all cursor-pointer shadow-sm text-center"
                          >
                            Recenter
                          </button>
                        </div>

                        {/* Loaded Image metadata details block */}
                        <div className="flex items-center justify-between bg-white border border-slate-100 px-3 py-2 rounded-xl text-[10px] w-full text-slate-500">
                          <div className="truncate font-semibold text-slate-700 max-w-[150px]">
                            {selectedLogoFile.name}
                          </div>
                          <div className="font-mono">
                            {imgDims ? `${imgDims.width}×${imgDims.height} px` : "loading..."} • {(selectedLogoFile.size / 1024).toFixed(1)} KB
                          </div>
                          <button 
                            type="button" 
                            onClick={() => { setSelectedLogoFile(null); setLogoPreviewUrl(null); setImgDims(null); }}
                            className="text-red-500 hover:text-red-700 font-bold uppercase tracking-wider text-[9px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={!selectedLogoFile || processingLogo}
                        onClick={handleProcessAndDeployLogo}
                        className={`flex-1 min-w-[200px] rounded-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                          selectedLogoFile && !processingLogo
                            ? "bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        {processingLogo ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Deploying Brand Assets...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Crop & Deploy Brand Logo</span>
                          </>
                        )}
                      </button>

                      {logoStatus?.hasCustomLogo && (
                        <button
                          type="button"
                          disabled={processingLogo}
                          onClick={handleDeleteCustomLogo}
                          className="px-4 py-2.5 border border-red-100 hover:border-red-200 text-red-600 hover:bg-red-50/50 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Reset to Default
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Deployed Brand Status */}
                  <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">
                      Deployed Brand Asset Status
                    </h4>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">Large Corporate Logo</span>
                          <span className="text-[10px] font-mono text-slate-400 block">512 x 512 px • PNG</span>
                        </div>
                        {logoStatus?.hasCustomLogo ? (
                          <div className="flex items-center space-x-2.5">
                            <span className="bg-green-50 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-green-100 uppercase">Deployed</span>
                            <img referrerPolicy="no-referrer" src={logoStatus.logoLargeUrl} className="h-9 w-9 object-contain rounded-lg border bg-white shadow-sm" alt="Large Custom Logo" />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Default vector active</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">Medium Touch Icon</span>
                          <span className="text-[10px] font-mono text-slate-400 block">180 x 180 px • PNG</span>
                        </div>
                        {logoStatus?.hasCustomLogo ? (
                          <div className="flex items-center space-x-2.5">
                            <span className="bg-green-50 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-green-100 uppercase">Deployed</span>
                            <img referrerPolicy="no-referrer" src={logoStatus.logoMediumUrl} className="h-9 w-9 object-contain rounded-lg border bg-white shadow-sm" alt="Medium Custom Logo" />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Default vector active</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">Mini Navigation Icon</span>
                          <span className="text-[10px] font-mono text-slate-400 block">64 x 64 px • PNG</span>
                        </div>
                        {logoStatus?.hasCustomLogo ? (
                          <div className="flex items-center space-x-2.5">
                            <span className="bg-green-50 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-green-100 uppercase">Deployed</span>
                            <img referrerPolicy="no-referrer" src={logoStatus.logoSmallUrl} className="h-9 w-9 object-contain rounded-lg border bg-white shadow-sm" alt="Small Custom Logo" />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Default vector active</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">Browser & Apple Favicon</span>
                          <span className="text-[10px] font-mono text-slate-400 block">32x32 / 16x16 px • SVG fallback</span>
                        </div>
                        {logoStatus?.hasCustomFavicon ? (
                          <div className="flex items-center space-x-2.5">
                            <span className="bg-green-50 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-green-100 uppercase">Active</span>
                            <img referrerPolicy="no-referrer" src={logoStatus.favicon32Url} className="h-8 w-8 object-contain rounded-lg border bg-white shadow-sm" alt="Favicon Custom Logo" />
                          </div>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-indigo-100 uppercase">Standard SVG Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
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

          {/* TAB 6: BILLING & INVOICES */}
          {activeTab === "billing" && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-2 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Billing & Invoicing Ledger</h2>
                  <p className="text-xs text-slate-500 mt-1">Generate client billing receipts, track spa sales revenues, and manage payment records securely.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      value={billSearch}
                      onChange={(e) => setBillSearch(e.target.value)}
                      placeholder="Search bill ID, guest, phone..." 
                      className="bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none w-52 sm:w-64 font-semibold"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowBillForm(true);
                      setBillForm({
                        customerName: "",
                        customerPhone: "",
                        customerEmail: "",
                        items: [],
                        therapistId: "",
                        therapistName: "",
                        date: new Date().toISOString().split("T")[0],
                        discount: 0,
                        tax: 0,
                        paymentMethod: "Cash",
                        status: "Paid"
                      });
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-full px-4 py-2 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Bill</span>
                  </button>
                </div>
              </div>

              {/* Bill/Invoice Creation Form Modal overlay */}
              {showBillForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fade-in">
                  <div className="bg-white border border-indigo-50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up p-6 sm:p-8">
                    {/* Close button */}
                    <button
                      onClick={() => setShowBillForm(false)}
                      className="absolute top-4 right-4 bg-slate-50 hover:bg-indigo-600 hover:text-white p-2 rounded-full text-slate-700 transition-all duration-300 border border-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="mb-6">
                      <span className="text-[11px] font-mono tracking-widest text-indigo-600 uppercase font-bold">
                        Billing Engine
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-slate-900 tracking-wide mt-1">
                        Generate Guest Bill
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Select rendered therapies, assign the attending specialist, apply discounts, and process the invoice.</p>
                    </div>

                    <form onSubmit={handleCreateBillSubmit} className="space-y-6">
                      {/* Customer Info Section */}
                      <div className="bg-slate-50/50 p-4 border border-indigo-50/50 rounded-2xl space-y-4">
                        <h4 className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold mb-2">1. Guest Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="E.g., Anand Varma"
                              value={billForm.customerName}
                              onChange={(e) => setBillForm({ ...billForm, customerName: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone *</label>
                            <input
                              type="tel"
                              required
                              placeholder="E.g., 9823456780"
                              value={billForm.customerPhone}
                              onChange={(e) => setBillForm({ ...billForm, customerPhone: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Customer Email (Optional)</label>
                            <input
                              type="email"
                              placeholder="E.g., guest@email.com"
                              value={billForm.customerEmail}
                              onChange={(e) => setBillForm({ ...billForm, customerEmail: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Add Services Section */}
                      <div className="bg-slate-50/50 p-4 border border-indigo-50/50 rounded-2xl space-y-4">
                        <h4 className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold mb-2">2. Add Therapies Rendered</h4>
                        
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Select Spa Therapy</label>
                            <select
                              value={tempSelectedItem.serviceId}
                              onChange={(e) => setTempSelectedItem({ ...tempSelectedItem, serviceId: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                            >
                              <option value="">-- Choose Service --</option>
                              {dbState?.services.map((svc) => (
                                <option key={svc.id} value={svc.id}>
                                  {svc.name} (₹{svc.price} - {svc.duration})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full sm:w-24">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={tempSelectedItem.qty}
                              onChange={(e) => setTempSelectedItem({ ...tempSelectedItem, qty: Math.max(1, Number(e.target.value)) })}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddItemToBill}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold h-9 flex items-center justify-center space-x-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Item</span>
                          </button>
                        </div>

                        {/* Bill Items Table */}
                        <div className="overflow-x-auto border border-indigo-50/80 rounded-xl bg-white">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono font-bold uppercase">
                                <th className="p-3">Therapy Name</th>
                                <th className="p-3 text-right">Price per Unit</th>
                                <th className="p-3 text-center">Quantity</th>
                                <th className="p-3 text-right">Total (INR)</th>
                                <th className="p-3 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {billForm.items.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">No therapies added yet. Use the selector above to build the bill.</td>
                                </tr>
                              ) : (
                                billForm.items.map((item) => (
                                  <tr key={item.serviceId} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="p-3 font-semibold text-slate-800">{item.serviceName}</td>
                                    <td className="p-3 text-right text-slate-600">₹{item.price}</td>
                                    <td className="p-3 text-center text-slate-800 font-bold">{item.qty}</td>
                                    <td className="p-3 text-right font-bold text-indigo-600">₹{item.price * item.qty}</td>
                                    <td className="p-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveItemFromBill(item.serviceId)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Transaction and Financials Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/20 p-4 border border-indigo-50/50 rounded-2xl">
                        {/* Transaction Attributes */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">3. Service & Payment details</h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Attending Specialist</label>
                              <select
                                value={billForm.therapistId}
                                onChange={(e) => setBillForm({ ...billForm, therapistId: e.target.value })}
                                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                              >
                                <option value="">-- Any / None --</option>
                                {dbState?.employees.map((emp) => (
                                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Date</label>
                              <input
                                type="date"
                                value={billForm.date}
                                onChange={(e) => setBillForm({ ...billForm, date: e.target.value })}
                                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                              <select
                                value={billForm.paymentMethod}
                                onChange={(e) => setBillForm({ ...billForm, paymentMethod: e.target.value as any })}
                                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                              >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI / Digital</option>
                                <option value="Card">Credit/Debit Card</option>
                                <option value="Net Banking">Net Banking</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                              <select
                                value={billForm.status}
                                onChange={(e) => setBillForm({ ...billForm, status: e.target.value as any })}
                                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                              >
                                <option value="Paid">Paid (Complete)</option>
                                <option value="Pending">Unpaid (Pending)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Invoice Summary Maths */}
                        <div className="bg-white border border-indigo-100/50 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                          <h4 className="text-xs font-mono tracking-widest text-indigo-600 uppercase font-bold">4. Financial Summary</h4>
                          
                          <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span className="font-bold text-slate-800">₹{calculateBillSubtotal()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Discount (INR)</span>
                              <input
                                type="number"
                                min="0"
                                value={billForm.discount}
                                onChange={(e) => setBillForm({ ...billForm, discount: Math.max(0, Number(e.target.value)) })}
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-right font-semibold text-slate-800 w-24 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Tax / GST (INR)</span>
                              <input
                                type="number"
                                min="0"
                                value={billForm.tax}
                                onChange={(e) => setBillForm({ ...billForm, tax: Math.max(0, Number(e.target.value)) })}
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-right font-semibold text-slate-800 w-24 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                            </div>
                            
                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                              <span className="font-serif font-bold text-sm text-slate-800">Grand Total</span>
                              <span className="font-serif font-bold text-lg text-indigo-600">
                                ₹{Math.max(0, calculateBillSubtotal() - Number(billForm.discount) + Number(billForm.tax))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-4 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() => setShowBillForm(false)}
                          className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-full px-6 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>Generate & Save Invoice</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Bills Listing Ledger */}
              <div className="overflow-hidden border border-indigo-50/70 rounded-3xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-indigo-50/60 text-slate-500 font-mono font-bold uppercase text-[11px]">
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Guest Name & Phone</th>
                      <th className="p-4">Billing Date</th>
                      <th className="p-4">Items / Services</th>
                      <th className="p-4 text-right">Grand Total</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-16 text-center text-slate-400 italic bg-white">
                          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="font-semibold text-slate-600 text-sm">No transaction bills recorded</p>
                          <p className="text-xs text-slate-400 mt-1">Click "Create Bill" at the top right to generate your first client invoice.</p>
                        </td>
                      </tr>
                    ) : (
                      bills
                        .filter((b) => {
                          const query = billSearch.toLowerCase();
                          return (
                            b.id.toLowerCase().includes(query) ||
                            b.customerName.toLowerCase().includes(query) ||
                            b.customerPhone.includes(query) ||
                            (b.customerEmail && b.customerEmail.toLowerCase().includes(query))
                          );
                        })
                        .map((bill) => (
                          <tr key={bill.id} className="border-b border-indigo-50/40 hover:bg-slate-50/35 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-700">{bill.id}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{bill.customerName}</div>
                              <div className="text-slate-500 text-xs font-medium">{bill.customerPhone}</div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700">{bill.date}</td>
                            <td className="p-4 max-w-xs truncate">
                              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-700">
                                {bill.items.map(item => `${item.serviceName} (x${item.qty})`).join(", ")}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-indigo-600 font-serif">₹{bill.total}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                bill.status === "Paid" 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {bill.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedBill(bill)}
                                  className="px-2.5 py-1 text-[11px] font-bold border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all cursor-pointer flex items-center space-x-1 uppercase"
                                  title="View/Print Printable Spa Receipt Invoice"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Receipt</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteBill(bill.id)}
                                  className="p-1.5 border border-slate-100 hover:border-red-100 hover:text-red-600 text-slate-400 rounded-lg transition-all cursor-pointer"
                                  title="Void Invoice Record"
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
          )}

          {/* PRINTABLE / VIEWABLE INVOICE DETAIL MODAL */}
          {selectedBill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fade-in print:bg-white print:p-0">
              <div className="bg-white border border-indigo-100 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up p-8 flex flex-col justify-between print:border-none print:shadow-none print:max-h-full print:overflow-visible">
                {/* Modal close icon (hidden on print) */}
                <button
                  onClick={() => setSelectedBill(null)}
                  className="absolute top-4 right-4 bg-slate-50 hover:bg-slate-200 p-2 rounded-full text-slate-700 border border-slate-100 transition-colors print:hidden"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Receipt Wrapper (targeting for print) */}
                <div id="printable-spa-invoice" className="font-sans text-slate-800 space-y-6">
                  {/* Spa Header */}
                  <div className="text-center pb-6 border-b border-dashed border-slate-200 space-y-2">
                    {logoStatus?.hasCustomLogo ? (
                      <div className="flex flex-col items-center space-y-2 mb-1">
                        <img 
                          referrerPolicy="no-referrer"
                          src={logoStatus.logoMediumUrl} 
                          className="h-14 w-auto object-contain mx-auto rounded-xl shadow-sm" 
                          alt="Soma Custom Logo" 
                        />
                        <span className="font-serif font-bold text-lg tracking-widest text-slate-900 uppercase">SOMA</span>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center space-x-2">
                        <Ticket className="w-6 h-6 text-indigo-600 print:text-indigo-600" />
                        <span className="font-serif font-bold text-2xl tracking-widest text-slate-900 uppercase">SOMA</span>
                      </div>
                    )}
                    <p className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase font-bold">Spa & Wellness Centre</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      19 GH, Mittal Kachori building, Scheme 54, Vijay nagar, Indore 452010 | +91 89823 71810
                    </p>
                  </div>

                  {/* Metadata coordinates */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Invoiced Guest</p>
                      <p className="font-serif font-bold text-slate-900 text-sm leading-tight">{selectedBill.customerName}</p>
                      <p className="text-slate-600 font-medium">{selectedBill.customerPhone}</p>
                      {selectedBill.customerEmail && <p className="text-slate-500">{selectedBill.customerEmail}</p>}
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Receipt Summary</p>
                      <p className="font-mono font-bold text-slate-800">{selectedBill.id}</p>
                      <p className="text-slate-600 font-semibold">Date: {selectedBill.date}</p>
                      <p className="text-slate-500">Method: {selectedBill.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Staff attending */}
                  {selectedBill.therapistName && (
                    <div className="bg-slate-50 border border-slate-100/50 rounded-xl px-4 py-2 text-xs flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Attending Specialist:</span>
                      <span className="font-serif font-bold text-slate-800">{selectedBill.therapistName}</span>
                    </div>
                  )}

                  {/* Services List Table */}
                  <div className="space-y-2">
                    <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">Therapeutic Treatments Rendered</p>
                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20 text-xs">
                      <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-2 font-mono font-bold text-slate-500 border-b border-slate-100 uppercase text-[10px]">
                        <span className="col-span-6">Treatment</span>
                        <span className="col-span-2 text-right">Price</span>
                        <span className="col-span-2 text-center">Qty</span>
                        <span className="col-span-2 text-right">Total</span>
                      </div>
                      <div className="divide-y divide-slate-100 px-4">
                        {selectedBill.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 py-3">
                            <span className="col-span-6 font-semibold text-slate-800">{item.serviceName}</span>
                            <span className="col-span-2 text-right text-slate-500">₹{item.price}</span>
                            <span className="col-span-2 text-center text-slate-800 font-bold">{item.qty}</span>
                            <span className="col-span-2 text-right font-bold text-slate-900">₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Billing Maths Ledger */}
                  <div className="border-t border-slate-100 pt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal amount</span>
                      <span className="font-semibold text-slate-800">₹{selectedBill.subtotal}</span>
                    </div>
                    {selectedBill.discount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Corporate Discount applied</span>
                        <span className="font-semibold">- ₹{selectedBill.discount}</span>
                      </div>
                    )}
                    {selectedBill.tax > 0 && (
                      <div className="flex justify-between">
                        <span>GST / Service Surcharges</span>
                        <span className="font-semibold">+ ₹{selectedBill.tax}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                      <span className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider">Net Paid Amount</span>
                      <span className="font-serif font-bold text-xl text-indigo-600 print:text-indigo-600">₹{selectedBill.total}</span>
                    </div>
                  </div>

                  {/* Standard receipt footer */}
                  <div className="text-center pt-6 border-t border-dashed border-slate-200 space-y-2">
                    <p className="font-serif italic text-xs text-slate-500">
                      "Wishing you divine health, holistic balance, and absolute peace."
                    </p>
                    <p className="font-serif font-bold text-[10px] tracking-widest text-indigo-600 uppercase">
                      Namaste, SOMA Spa & Wellness
                    </p>
                  </div>
                </div>

                {/* Print Control buttons (hidden on print) */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-100 print:hidden">
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Close Window
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-2.5 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
