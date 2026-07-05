import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { Jimp } from "jimp";
import { GoogleGenAI } from "@google/genai";
import { isSupabaseConfigured, supabase, supabaseDb } from "./server_supabase";
import { REVIEWS } from "./src/data";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Error handling middleware to ensure any parsing, body size limits or payload errors return strictly valid JSON instead of HTML
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error("Express body-parsing / payload error intercepted:", err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: err.message || "An error occurred processing the request payload",
      code: err.code || "PAYLOAD_ERROR",
      success: false
    });
    return;
  }
  next();
});

// Interceptor for brand asset images to serve dynamically from DB/Cache
app.get("/assets/:filename", async (req, res, next) => {
  const filename = req.params.filename;
  const logoFiles = [
    "logo-large.png", "logo-medium.png", "logo-small.png",
    "logo-large.jpg", "logo-medium.jpg", "logo-small.jpg",
    "logo-large.webp", "logo-medium.webp", "logo-small.webp",
    "favicon-32x32.png", "favicon-16x16.png", "favicon.svg"
  ];
  
  if (logoFiles.includes(filename)) {
    try {
      const assets = await loadLogoCache();
      if (assets) {
        let base64Data = null;
        let contentType = "image/png";
        
        if (filename === "logo-large.png") { base64Data = assets.logoLarge; contentType = "image/png"; }
        else if (filename === "logo-medium.png") { base64Data = assets.logoMedium; contentType = "image/png"; }
        else if (filename === "logo-small.png") { base64Data = assets.logoSmall; contentType = "image/png"; }
        else if (filename === "logo-large.jpg") { base64Data = assets.logoLargeJpg; contentType = "image/jpeg"; }
        else if (filename === "logo-medium.jpg") { base64Data = assets.logoMediumJpg; contentType = "image/jpeg"; }
        else if (filename === "logo-small.jpg") { base64Data = assets.logoSmallJpg; contentType = "image/jpeg"; }
        else if (filename === "logo-large.webp") { base64Data = assets.logoLargeWebp; contentType = "image/webp"; }
        else if (filename === "logo-medium.webp") { base64Data = assets.logoMediumWebp; contentType = "image/webp"; }
        else if (filename === "logo-small.webp") { base64Data = assets.logoSmallWebp; contentType = "image/webp"; }
        else if (filename === "favicon-32x32.png") { base64Data = assets.favicon32; contentType = "image/png"; }
        else if (filename === "favicon-16x16.png") { base64Data = assets.favicon16; contentType = "image/png"; }
        else if (filename === "favicon.svg") { base64Data = assets.faviconSvg; contentType = "image/svg+xml"; }
        
        if (base64Data) {
          let buffer: Buffer;
          if (base64Data.startsWith("data:") && base64Data.includes(";base64,")) {
            const parts = base64Data.split(";base64,");
            const rawBase64 = parts[1] ? parts[1].trim() : "";
            buffer = Buffer.from(rawBase64, "base64");
          } else {
            buffer = Buffer.from(base64Data.trim(), contentType === "image/svg+xml" ? "utf-8" : "base64");
          }
          res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "public, max-age=31536000");
          return res.send(buffer);
        }
      }
    } catch (err) {
      console.error(`Error dynamically serving logo asset ${filename}:`, err);
    }
  }
  next();
});

app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// Initialize Gemini SDK lazily to prevent startup crashes when GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "placeholder_api_key_to_prevent_constructor_crash",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

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
    id: "fullbody45",
    name: "Full Body Massage Promo",
    duration: "45 Mins",
    price: 999,
    category: "massage",
    description: "A comprehensive full body therapeutic massage designed to relax all major muscle groups and relieve stress at an exclusive, budget-friendly promotional price.",
    benefits: [
      "Improves blood circulation",
      "Relieves overall body fatigue",
      "Relaxes tight muscles",
      "Promotes deep, sound sleep"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "swedish60",
    name: "Swedish Massage",
    duration: "60 Mins",
    price: 1999,
    category: "massage",
    description: "Classic Swedish massage using long gliding strokes, kneading, and friction techniques on the more superficial layers of muscles.",
    benefits: [
      "Promotes full-body relaxation",
      "Reduces physical and mental stress",
      "Eases superficial muscle tension",
      "Improves oxygen flow in blood"
    ],
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "deeptissue60",
    name: "Deep Tissue Massage",
    duration: "60 Mins",
    price: 2499,
    category: "massage",
    description: "Focuses on realigning deeper layers of muscles and connective tissue. Highly recommended for chronically tense and contracted areas like stiff necks and sore shoulders.",
    benefits: [
      "Releases chronic muscle tightness and knots",
      "Reduces pain and muscle spasms",
      "Improves blood flow to muscle tissues",
      "Aids in athletic recovery and posture"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "balinese60",
    name: "Balinese Massage",
    duration: "60 Mins",
    price: 2499,
    category: "massage",
    description: "A traditional Indonesian holistic treatment combining gentle stretches, acupressure, reflexology, and aromatherapy to stimulate the flow of blood and energy.",
    benefits: [
      "Stimulates blood and lymph circulation",
      "Deeply relaxing, soothing, and calming",
      "Relieves joint and muscle stiffness",
      "Uplifts energy and mental clarity"
    ],
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "aroma45",
    name: "Aromatherapy Massage",
    duration: "45 Mins",
    price: 2199,
    category: "massage",
    description: "Combines the physiological benefits of professional massage therapy with the healing, balancing effects of premium therapeutic essential oils.",
    benefits: [
      "Calms the nervous system and mind",
      "Uplifts mood and reduces anxiety",
      "Aromatherapy benefits via inhalation and absorption",
      "Promotes absolute mental peace"
    ],
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "thai45",
    name: "Thai Massage",
    duration: "45 Mins",
    price: 2999,
    category: "massage",
    description: "An interactive, energizing therapy using passive stretching, gentle rhythmic pressure, and yoga-like postures to improve flexibility and energy flow.",
    benefits: [
      "Increases flexibility and range of motion",
      "Boosts whole-body energy levels",
      "Relieves tight joints and back tension",
      "Improves overall posture"
    ],
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "hotstone90",
    name: "Hot Stone Therapy",
    duration: "90 Mins",
    price: 3999,
    category: "massage",
    description: "Smooth, heated volcanic basalt stones are strategically placed on key energy meridians and used to slide along muscles, dissolving deep stiffness.",
    benefits: [
      "Melts away chronic muscle tension",
      "Incredibly grounding for mental fatigue",
      "Improves sleep patterns",
      "Enhances deep blood flow"
    ],
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "foot30",
    name: "Foot Reflexology",
    duration: "30 Mins",
    price: 799,
    category: "wellness",
    description: "Focused stimulation of specific reflex points on the feet corresponding to internal body systems, restoring physical equilibrium.",
    benefits: [
      "Relieves tired, aching feet",
      "Improves lower leg circulation",
      "Promotes full-body relaxation",
      "Reduces everyday stress and anxiety"
    ],
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "headneck30",
    name: "Head, Neck & Shoulder Massage",
    duration: "30 Mins",
    price: 899,
    category: "massage",
    description: "A highly targeted, stress-relieving massage focusing on the primary areas holding tension from desk work and heavy device use.",
    benefits: [
      "Relieves neck and shoulder stiffness",
      "Alleviates tension headaches",
      "Improves upper body alignment and comfort",
      "Highly relaxing in a short 30-minute window"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "bodyscrub45",
    name: "Body Scrub",
    duration: "45 Mins",
    price: 1499,
    category: "wellness",
    description: "A gentle yet effective full-body exfoliation treatment using herbal and natural scrubs to remove dead skin cells and reveal healthy skin.",
    benefits: [
      "Exfoliates dead skin cells thoroughly",
      "Improves skin elasticity and local circulation",
      "Leaves skin silky, soft, and glowing",
      "Prepares skin to absorb moisturizing oils"
    ],
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "bodypolishing60",
    name: "Body Polishing",
    duration: "60 Mins",
    price: 2499,
    category: "wellness",
    description: "A premium full-body hydration and polishing ritual that exfoliates, hydrates, and leaves your skin with a beautiful, satin-smooth gleam.",
    benefits: [
      "Deeply hydrates and nourishes skin layers",
      "Evens skin tone and smoothens texture",
      "Promotes cell renewal",
      "Leaves a gorgeous luminous, radiant shine"
    ],
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "couple90",
    name: "Couple Spa Package",
    duration: "90 Mins",
    price: 4999,
    category: "package",
    description: "A luxurious shared wellness escape. Enjoy side-by-side aromatherapy massages with custom relaxing music, Private ambient lighting, and organic teas.",
    benefits: [
      "Shared relaxing experience in a private couple's suite",
      "Relieves stress, muscle tension, and travel fatigue",
      "Includes organic fruit platters and herbal tea",
      "Perfect premium wellness gift for partners in Indore"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "aromaspa45",
    name: "Aroma Spa",
    duration: "45 Mins",
    price: 1200,
    category: "massage",
    description: "A soothing, aromatic lighter therapy using pure herbal essential oils to relieve immediate stress and ease muscle fatigue.",
    benefits: [
      "Soothes nervous tension and mental strain",
      "Calming lavender and eucalyptus essential oil aroma",
      "Excellent high-value, budget-friendly wellness option",
      "Restores calm and energy to a busy mind"
    ],
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "somaspa60",
    name: "Soma Spa Therapy",
    duration: "60 Mins",
    price: 2199,
    category: "massage",
    description: "Our signature full-body treatment combining special custom oils with personalized deep massage strokes for complete rejuvenation.",
    benefits: [
      "Exclusive signature therapeutic experience",
      "Relieves persistent body aches and joint pain",
      "Balances inner flow and relieves anxiety",
      "Promotes absolute physical and mental harmony"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "abhyanga",
    name: "Abhyanga – Full Body Ayurvedic Oil Massage",
    duration: "60 Mins",
    price: 2200,
    category: "ayurveda",
    description: "A deeply restorative full-body massage using warm herbal oils custom-blended according to your Ayurvedic Dosha.",
    benefits: [
      "Pacifies Vata, Pitta, and Kapha imbalances",
      "Increases lymphatic circulation and flushes toxins",
      "Improves skin texture and physical stability",
      "Promotes deep, sound sleep"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "shirodhara",
    name: "Shirodhara – Warm Herbal Oil Therapy for Relaxation",
    duration: "45 Mins",
    price: 2500,
    category: "ayurveda",
    description: "A unique treatment where warm medicated herbal oil is poured in a continuous, gentle stream over the forehead (third eye).",
    benefits: [
      "Ultimate stress, anxiety, and mental tension relief",
      "Improves sleep quality and combats chronic insomnia",
      "Deeply calms the central nervous system",
      "Enhances mental clarity, concentration, and focus"
    ],
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "shiroabhyanga",
    name: "Shiro Abhyanga – Head & Scalp Massage",
    duration: "30 Mins",
    price: 999,
    category: "ayurveda",
    description: "Focused scalp, head, and neck massage with specialized cooling Ayurvedic herbs and oils to release mental pressure.",
    benefits: [
      "Combats mental fatigue, stress, and tension headaches",
      "Nourishes hair roots and dry scalp deeply",
      "Improves sleep quality and patterns",
      "Induces a high state of calm and clarity"
    ],
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "padabhyanga",
    name: "Padabhyanga – Ayurvedic Foot Massage",
    duration: "30 Mins",
    price: 899,
    category: "ayurveda",
    description: "An ancient Ayurvedic foot massage using warm herbal oils or medicated ghee on vital energy points of the feet.",
    benefits: [
      "Relieves stiffness and fatigue in feet and calf muscles",
      "Calms the nervous system and improves sleep patterns",
      "Stimulates internal organ wellness via reflex points",
      "Enhances vision and eyes wellness according to classics"
    ],
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mukhabhyanga",
    name: "Mukhabhyanga – Ayurvedic Face Massage",
    duration: "30 Mins",
    price: 1199,
    category: "ayurveda",
    description: "A traditional Ayurvedic facial massage utilizing specialized herbal oils to nourish skin and relax facial muscles.",
    benefits: [
      "Brings a natural radiant glow to facial skin",
      "Relieves local facial muscle tension and stress",
      "Improves local circulation and skin suppleness",
      "Nourishes dry skin layers deeply"
    ],
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "pizhichil",
    name: "Pizhichil – Warm Medicated Oil Bath Therapy",
    duration: "60 Mins",
    price: 3500,
    category: "ayurveda",
    description: "Often called the 'King of Ayurvedic Therapies', this combines synchronized massage with a continuous pour of warm medicated oils all over the body.",
    benefits: [
      "Highly beneficial for joint pain, stiffness, and arthritis",
      "Strengthens muscles and tones nervous pathways",
      "Deeply detoxifies and rejuvenates cells",
      "Combats persistent body fatigue and stiffness"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "elakizhi",
    name: "Elakizhi – Herbal Poultice Massage",
    duration: "45 Mins",
    price: 2199,
    category: "ayurveda",
    description: "A therapeutic massage using warm herbal bags containing fresh medicinal leaves fried in herbal oils, patted over the body.",
    benefits: [
      "Relieves chronic back pain and muscle/joint pain",
      "Combats muscle cramps, spasms, and stiffness",
      "Improves blood circulation and skin tone",
      "Highly effective for nerve-related stiffness"
    ],
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "njavarakizhi",
    name: "Njavarakizhi – Rice Bolus Rejuvenation Therapy",
    duration: "60 Mins",
    price: 2600,
    category: "ayurveda",
    description: "A unique rejuvenation process where the body is massaged using warm linen bags containing cooked Njavara medicinal rice with herbal decoctions.",
    benefits: [
      "Strengthens body tissues, muscles, and nerves",
      "Slows down physical aging and rejuvenates skin cells",
      "Improves skin luster, texture, and smoothness",
      "Eases chronic physical weakness and joint stiffness"
    ],
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "udwarthanam",
    name: "Udwarthanam – Herbal Powder Body Massage",
    duration: "45 Mins",
    price: 1999,
    category: "ayurveda",
    description: "A dynamic dry deep massage using warm herbal powders rubbed upwards to break down subcutaneous fat and stimulate circulation.",
    benefits: [
      "Excellent for healthy weight management and cellulite reduction",
      "Exfoliates dead skin cells and cleanses pores deeply",
      "Improves skin complexion and muscle firmness",
      "Eliminates body odors and heavy toxins"
    ],
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "katibasti",
    name: "Kati Basti – Lower Back Oil Therapy",
    duration: "30 Mins",
    price: 1299,
    category: "ayurveda",
    description: "A reservoir of warm medicated herbal oil is created over the lower back region using a herbal dough boundary.",
    benefits: [
      "Alleviates lower back pain, spasms, and stiffness",
      "Nourishes the lumbar spine, discs, and nerves",
      "Relieves sciatic nerve irritation and pain",
      "Increases mobility and strength of the lower back"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "greevabasti",
    name: "Greeva Basti – Neck Oil Therapy",
    duration: "30 Mins",
    price: 1299,
    category: "ayurveda",
    description: "Warm medicated oil is pooled over the neck region in a custom herbal dough ring to nourish the cervical spine.",
    benefits: [
      "Relieves cervical spondylosis stiffness and pain",
      "Eases severe neck and upper shoulder tension",
      "Reduces tension headaches from long screen hours",
      "Lubricates and relaxes neck joints and ligaments"
    ],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "janubasti",
    name: "Janu Basti – Knee Oil Therapy",
    duration: "30 Mins",
    price: 1299,
    category: "ayurveda",
    description: "Warm medicated oil is retained over the knee joint inside a herbal dough border to lubricate and strengthen knee structures.",
    benefits: [
      "Relieves knee pain and osteoarthritis stiffness",
      "Improves knee joint mobility and flexibility",
      "Strengthens knee joint tissues, ligaments, and cartilage",
      "Increases local circulation to the knee joint"
    ],
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "netratarpana",
    name: "Netra Tarpana – Eye Rejuvenation Therapy",
    duration: "30 Mins",
    price: 1499,
    category: "ayurveda",
    description: "A pool of warm, highly purified medicated ghee is retained over the eyes using a dough barrier to wash and nourish the eyes.",
    benefits: [
      "Relieves severe eye strain from computer screens and devices",
      "Improves dry eyes, redness, and itching sensations",
      "Enhances vision clarity and eye muscle wellness",
      "Highly relaxing for the entire ocular region"
    ],
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "marmatherapy",
    name: "Marma Therapy – Vital Energy Point Massage",
    duration: "45 Mins",
    price: 1999,
    category: "ayurveda",
    description: "Ancient energy point stimulation using custom herbal essential oils to release physical and emotional blocks.",
    benefits: [
      "Stimulates the 107 vital energy points of the body",
      "Balances Prana flow and harmonizes mind-body",
      "Combats general fatigue, anxiety, and stress",
      "Strengthens the nervous system and immunity"
    ],
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "swedana",
    name: "Herbal Steam Therapy (Swedana) – Herbal",
    duration: "20 Mins",
    price: 699,
    category: "ayurveda",
    description: "A therapeutic steam bath using custom fresh herbal decoctions to open up body sweat pores and flush deep toxins.",
    benefits: [
      "Flushes deep cellular toxins through active sweating",
      "Reduces physical stiffness, pain, and soreness",
      "Improves blood circulation and softens skin",
      "Complements and enhances other Ayurvedic body massages"
    ],
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
  }
];

const DEFAULT_LEADS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Rajesh Sharma",
    email: "rajesh@example.com",
    phone: "9876543210",
    service: "Abhyanga – Full Body Ayurvedic Oil Massage",
    date: "2026-07-05",
    time: "11:00 AM",
    therapist: "Siddharth Nair",
    status: "Confirmed",
    notes: "Prefers medium pressure, warm herbal tea post-therapy.",
    createdAt: "2026-07-01T10:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Priyanka Joshi",
    email: "priyanka@example.com",
    phone: "9823456789",
    service: "Mukhabhyanga – Ayurvedic Face Massage",
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
      const parsed = JSON.parse(raw);
      if (!parsed.bills) {
        parsed.bills = [];
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
      }
      return parsed;
    }
  } catch (err) {
    console.error("Failed to read server_db.json, recreating...", err);
  }
  const initial = {
    metadata: { ...DEFAULT_METADATA },
    employees: [...DEFAULT_EMPLOYEES],
    services: [...DEFAULT_SERVICES],
    leads: [...DEFAULT_LEADS],
    bills: []
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
      let reviews = await supabaseDb.getReviews();

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
      if (reviews.length === 0) {
        for (const r of REVIEWS) {
          await supabaseDb.addReview(r as any);
        }
        reviews = await supabaseDb.getReviews();
      }
      res.json({ metadata, employees, services, leads, reviews, dbType: "supabase", isSupabaseConfigured: true, supabaseError: null });
    } else {
      db = loadDB();
      res.json({ ...db, dbType: "local", isSupabaseConfigured: false, supabaseError: null });
    }
  } catch (err: any) {
    console.error("Failed to load DB state:", err);
    db = loadDB();
    res.json({ ...db, dbType: "local", isSupabaseConfigured: isSupabaseConfigured, supabaseError: err.message || String(err) });
  }
});

// Reset database to default seeds
app.post("/api/db/reset", async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      // Clear existing records from Supabase tables
      await supabase!.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase!.from("employees").delete().neq("id", "");
      await supabase!.from("services").delete().neq("id", "");
      await supabase!.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase!.from("spa_metadata").delete().neq("id", "00000000-0000-0000-0000-000000000001");

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
      for (const r of REVIEWS) {
        await supabaseDb.addReview(r as any);
      }

      const services = await supabaseDb.getServices();
      const employees = await supabaseDb.getEmployees();
      const leads = await supabaseDb.getLeads();
      const reviews = await supabaseDb.getReviews();

      res.json({
        success: true,
        db: { metadata, employees, services, leads, reviews }
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

// Brand Logo Helpers for DB & Cache Persistence
let logoCache: any = null;

async function loadLogoCache() {
  if (logoCache) return logoCache;
  
  // 1. First, check database if Supabase is configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("spa_metadata")
        .select("*")
        .eq("id", "a55e7100-1090-1090-1090-109010901090")
        .maybeSingle();
        
      if (data && data.hours) {
        logoCache = data.hours;
        console.log("Successfully loaded brand logo kit from Supabase.");
        return logoCache;
      }
    } catch (err) {
      console.error("Error fetching logo from Supabase on load:", err);
    }
  }

  // 2. Check local JSON database if we store it there
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, "utf-8");
      const tempDb = JSON.parse(fileContent);
      if (tempDb && tempDb.customLogos) {
        logoCache = tempDb.customLogos;
        console.log("Successfully loaded brand logo kit from local database.");
        return logoCache;
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Check filesystem fallback (for compatibility with existing assets)
  const assetsDir = path.join(process.cwd(), "assets");
  const logoLargePath = path.join(assetsDir, "logo-large.png");
  if (fs.existsSync(logoLargePath)) {
    try {
      const readBase64 = (file: string, mime: string) => {
        const filePath = path.join(assetsDir, file);
        if (fs.existsSync(filePath)) {
          return `data:${mime};base64,` + fs.readFileSync(filePath).toString("base64");
        }
        return null;
      };
      
      logoCache = {
        logoLarge: readBase64("logo-large.png", "image/png"),
        logoMedium: readBase64("logo-medium.png", "image/png"),
        logoSmall: readBase64("logo-small.png", "image/png"),
        logoLargeJpg: readBase64("logo-large.jpg", "image/jpeg"),
        logoMediumJpg: readBase64("logo-medium.jpg", "image/jpeg"),
        logoSmallJpg: readBase64("logo-small.jpg", "image/jpeg"),
        logoLargeWebp: readBase64("logo-large.webp", "image/webp"),
        logoMediumWebp: readBase64("logo-medium.webp", "image/webp"),
        logoSmallWebp: readBase64("logo-small.webp", "image/webp"),
        favicon32: readBase64("favicon-32x32.png", "image/png"),
        favicon16: readBase64("favicon-16x16.png", "image/png"),
        faviconSvg: fs.existsSync(path.join(assetsDir, "favicon.svg")) 
          ? fs.readFileSync(path.join(assetsDir, "favicon.svg"), "utf-8")
          : null
      };
      console.log("Successfully loaded brand logo kit from local filesystem.");
      return logoCache;
    } catch (e) {
      console.error("Failed to load logo assets from filesystem:", e);
    }
  }

  return null;
}

async function processAndResizeBase64(
  base64Data: string | null | undefined,
  width: number,
  height: number,
  mimeType: string
): Promise<string | null> {
  if (!base64Data) return null;
  try {
    let buffer: Buffer;
    if (base64Data.startsWith("data:") && base64Data.includes(";base64,")) {
      const parts = base64Data.split(";base64,");
      const rawBase64 = parts[1] ? parts[1].trim() : "";
      buffer = Buffer.from(rawBase64, "base64");
    } else {
      buffer = Buffer.from(base64Data.trim(), "base64");
    }

    const image = await Jimp.read(buffer);
    
    // Perform crop or resize to exact specific dimensions
    if (typeof image.resize === "function") {
      image.resize({ w: width, h: height });
    } else if (typeof (image as any).resize === "function") {
      (image as any).resize(width, height);
    }
    
    let outputBuffer: Buffer;
    if (typeof image.getBuffer === "function") {
      outputBuffer = await image.getBuffer(mimeType as any);
    } else {
      outputBuffer = await (image as any).getBufferAsync(mimeType);
    }
    
    return `data:${mimeType};base64,` + outputBuffer.toString("base64");
  } catch (err) {
    console.warn(`Jimp processing failed for ${width}x${height} (${mimeType}), falling back to original:`, err);
    return base64Data;
  }
}

async function saveLogoCache(assets: any) {
  // We perform a database transaction to ensure the image upload and database record update are atomic.
  // 1. First, process and resize all incoming base64 images server-side to ensure specific dimensions
  console.log("Starting server-side image processing and resizing...");
  
  const processedAssets: any = {
    version: Date.now(),
    faviconSvg: assets.faviconSvg // SVGs are vector XML, keep as-is
  };

  // Perform server-side resizing to specific dimensions
  // PNG formats
  processedAssets.logoLarge = await processAndResizeBase64(assets.logoLarge, 512, 512, "image/png");
  processedAssets.logoMedium = await processAndResizeBase64(assets.logoMedium, 180, 180, "image/png");
  processedAssets.logoSmall = await processAndResizeBase64(assets.logoSmall, 64, 64, "image/png");
  processedAssets.favicon32 = await processAndResizeBase64(assets.favicon32, 32, 32, "image/png");
  processedAssets.favicon16 = await processAndResizeBase64(assets.favicon16, 16, 16, "image/png");

  // JPEG formats
  processedAssets.logoLargeJpg = await processAndResizeBase64(assets.logoLargeJpg || assets.logoLarge, 512, 512, "image/jpeg");
  processedAssets.logoMediumJpg = await processAndResizeBase64(assets.logoMediumJpg || assets.logoMedium, 180, 180, "image/jpeg");
  processedAssets.logoSmallJpg = await processAndResizeBase64(assets.logoSmallJpg || assets.logoSmall, 64, 64, "image/jpeg");

  // WebP formats (Optional, if Jimp fails on webp, processAndResizeBase64 gracefully falls back to original webp)
  processedAssets.logoLargeWebp = await processAndResizeBase64(assets.logoLargeWebp, 512, 512, "image/webp");
  processedAssets.logoMediumWebp = await processAndResizeBase64(assets.logoMediumWebp, 180, 180, "image/webp");
  processedAssets.logoSmallWebp = await processAndResizeBase64(assets.logoSmallWebp, 64, 64, "image/webp");

  console.log("Server-side image processing completed. Initiating atomic transaction across databases...");

  // Keep backups for rollback in case of failure (implements an atomic transaction)
  let backupLocalDb: any = null;
  let localDbUpdated = false;
  let backupSupabaseData: any = null;
  let supabaseUpdated = false;
  
  const assetsDir = path.join(process.cwd(), "assets");
  const filesystemBackups: { [filename: string]: Buffer | null } = {};
  const writtenFiles: string[] = [];

  // A. Back up existing local assets from disk if they exist, so we can restore them on failure
  try {
    const filesToManage = [
      "logo-large.png", "logo-medium.png", "logo-small.png",
      "logo-large.jpg", "logo-medium.jpg", "logo-small.jpg",
      "logo-large.webp", "logo-medium.webp", "logo-small.webp",
      "favicon-32x32.png", "favicon-16x16.png", "favicon.svg"
    ];
    for (const filename of filesToManage) {
      const filePath = path.join(assetsDir, filename);
      if (fs.existsSync(filePath)) {
        filesystemBackups[filename] = fs.readFileSync(filePath);
      } else {
        filesystemBackups[filename] = null;
      }
    }
  } catch (fsErr) {
    console.warn("Could not read local filesystem for logo backups (expected on read-only hosting):", fsErr);
  }

  try {
    // B. Update Local JSON DB representation
    let fileContent = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        fileContent = fs.readFileSync(DB_FILE, "utf-8");
      } catch (dbReadErr) {
        console.warn("Could not read local JSON database file:", dbReadErr);
      }
    }

    if (fileContent) {
      try {
        backupLocalDb = JSON.parse(fileContent);
        
        const tempDb = JSON.parse(fileContent);
        tempDb.customLogos = processedAssets;
        
        const tempDbPath = `${DB_FILE}.tmp`;
        fs.writeFileSync(tempDbPath, JSON.stringify(tempDb, null, 2), "utf-8");
        fs.renameSync(tempDbPath, DB_FILE);
        
        db = tempDb;
        localDbUpdated = true;
        console.log("Local JSON database file updated atomically.");
      } catch (dbWriteErr) {
        console.warn("Could not write to local JSON database file (expected on read-only hosting):", dbWriteErr);
        // Fall back to updating the in-memory db object anyway
        if (db) {
          db.customLogos = processedAssets;
        }
      }
    } else {
      // If we couldn't read/load DB file, at least update the memory reference
      if (db) {
        db.customLogos = processedAssets;
      }
    }

    // C. Back up and Update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data: backupRow, error: fetchErr } = await supabase
        .from("spa_metadata")
        .select("*")
        .eq("id", "a55e7100-1090-1090-1090-109010901090")
        .maybeSingle();
      
      if (fetchErr) {
        console.warn("Could not fetch backup metadata from Supabase:", fetchErr);
      } else {
        backupSupabaseData = backupRow;
      }

      const payload = {
        id: "a55e7100-1090-1090-1090-109010901090",
        title: "Soma Brand Assets",
        tagline: "Custom Brand Logo Assets",
        description: "Contains custom deployed logos and favicons in all required resolutions",
        address: "Database",
        phone: "N/A",
        email: "N/A",
        logo_palette: "N/A",
        hours: processedAssets
      };
      
      const { error: upsertErr } = await supabase
        .from("spa_metadata")
        .upsert(payload);
        
      if (upsertErr) {
        throw new Error(`Supabase logo update failed: ${upsertErr.message}`);
      }
      
      supabaseUpdated = true;
      console.log("Supabase metadata table updated atomically.");
    }

    // D. Update Filesystem Assets (Non-blocking fallback)
    try {
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const saveBase64FileAtomically = (base64Data: string | null | undefined, filename: string) => {
        if (!base64Data) return;
        
        let buffer: Buffer;
        if (base64Data.startsWith("data:") && base64Data.includes(";base64,")) {
          const parts = base64Data.split(";base64,");
          buffer = Buffer.from(parts[1].trim(), "base64");
        } else {
          buffer = Buffer.from(base64Data.trim(), "base64");
        }
        
        const targetPath = path.join(assetsDir, filename);
        const tempPath = `${targetPath}.tmp`;
        
        fs.writeFileSync(tempPath, buffer);
        fs.renameSync(tempPath, targetPath);
        writtenFiles.push(filename);
      };

      if (processedAssets.logoLarge) saveBase64FileAtomically(processedAssets.logoLarge, "logo-large.png");
      if (processedAssets.logoMedium) saveBase64FileAtomically(processedAssets.logoMedium, "logo-medium.png");
      if (processedAssets.logoSmall) saveBase64FileAtomically(processedAssets.logoSmall, "logo-small.png");
      
      if (processedAssets.logoLargeJpg) saveBase64FileAtomically(processedAssets.logoLargeJpg, "logo-large.jpg");
      if (processedAssets.logoMediumJpg) saveBase64FileAtomically(processedAssets.logoMediumJpg, "logo-medium.jpg");
      if (processedAssets.logoSmallJpg) saveBase64FileAtomically(processedAssets.logoSmallJpg, "logo-small.jpg");
      
      if (processedAssets.logoLargeWebp) saveBase64FileAtomically(processedAssets.logoLargeWebp, "logo-large.webp");
      if (processedAssets.logoMediumWebp) saveBase64FileAtomically(processedAssets.logoMediumWebp, "logo-medium.webp");
      if (processedAssets.logoSmallWebp) saveBase64FileAtomically(processedAssets.logoSmallWebp, "logo-small.webp");
      
      if (processedAssets.favicon32) saveBase64FileAtomically(processedAssets.favicon32, "favicon-32x32.png");
      if (processedAssets.favicon16) saveBase64FileAtomically(processedAssets.favicon16, "favicon-16x16.png");
      
      if (processedAssets.faviconSvg) {
        const targetPath = path.join(assetsDir, "favicon.svg");
        const tempPath = `${targetPath}.tmp`;
        if (processedAssets.faviconSvg.startsWith("data:")) {
          saveBase64FileAtomically(processedAssets.faviconSvg, "favicon.svg");
        } else {
          fs.writeFileSync(tempPath, processedAssets.faviconSvg, "utf-8");
          fs.renameSync(tempPath, targetPath);
          writtenFiles.push("favicon.svg");
        }
      }

      console.log("Filesystem brand assets written atomically.");
    } catch (fsWriteErr) {
      console.warn("Could not write logo files to local filesystem (expected on read-only hosting like Vercel):", fsWriteErr);
    }

    // Update the in-memory cache on complete transaction success
    logoCache = processedAssets;
    console.log("Brand logo transaction fully completed and verified.");

  } catch (err: any) {
    console.error("Logo upload transaction failed! Rolling back database and filesystem to original state...", err);
    
    // 1. Rollback filesystem files
    try {
      for (const filename of Object.keys(filesystemBackups)) {
        const backupBuffer = filesystemBackups[filename];
        const targetPath = path.join(assetsDir, filename);
        if (backupBuffer) {
          try {
            fs.writeFileSync(targetPath, backupBuffer);
          } catch (fsRbErr) {
            console.error(`Failed to rollback file ${filename}:`, fsRbErr);
          }
        } else if (fs.existsSync(targetPath)) {
          try {
            fs.unlinkSync(targetPath);
          } catch (fsRbErr) {
            console.error(`Failed to delete added file ${filename} during rollback:`, fsRbErr);
          }
        }
      }
    } catch (fsRollbackErr) {
      console.error("Error rolling back filesystem files:", fsRollbackErr);
    }

    // 2. Rollback Local JSON DB
    if (localDbUpdated && backupLocalDb) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(backupLocalDb, null, 2), "utf-8");
        db = backupLocalDb;
        console.log("Local JSON database rolled back successfully.");
      } catch (dbRbErr) {
        console.error("Local JSON database rollback failed:", dbRbErr);
      }
    }

    // 3. Rollback Supabase
    if (supabaseUpdated && isSupabaseConfigured && supabase) {
      try {
        if (backupSupabaseData) {
          await supabase.from("spa_metadata").upsert(backupSupabaseData);
        } else {
          await supabase.from("spa_metadata").delete().eq("id", "a55e7100-1090-1090-1090-109010901090");
        }
        console.log("Supabase rolled back successfully.");
      } catch (sbRbErr) {
        console.error("Supabase rollback failed:", sbRbErr);
      }
    }

    throw new Error(`Logo deployment transaction failed: ${err.message || err}`);
  }
}

async function deleteLogoCache() {
  logoCache = null;
  
  // 1. Delete from local JSON db
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, "utf-8");
      const tempDb = JSON.parse(fileContent);
      delete tempDb.customLogos;
      fs.writeFileSync(DB_FILE, JSON.stringify(tempDb, null, 2), "utf-8");
      db = tempDb;
    }
  } catch (err) {
    console.error("Failed to delete logos from local JSON database:", err);
  }

  // 2. Delete from Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("spa_metadata")
        .delete()
        .eq("id", "a55e7100-1090-1090-1090-109010901090");
        
      if (error) {
        console.error("Error deleting custom logo from Supabase:", error);
      } else {
        console.log("Successfully deleted custom logo from Supabase.");
      }
    } catch (err) {
      console.error("Error deleting custom logo from Supabase:", err);
    }
  }

  // 3. Delete from filesystem
  try {
    const assetsDir = path.join(process.cwd(), "assets");
    const filesToDelete = [
      "logo-large.png", "logo-medium.png", "logo-small.png",
      "logo-large.jpg", "logo-medium.jpg", "logo-small.jpg",
      "logo-large.webp", "logo-medium.webp", "logo-small.webp",
      "favicon-32x32.png", "favicon-16x16.png", "favicon.svg"
    ];
    for (const file of filesToDelete) {
      const filePath = path.join(assetsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (e) {
    console.warn("Could not delete logo files from filesystem:", e);
  }
}

// GET custom logo status and URL paths
app.get("/api/logo-status", async (req, res) => {
  try {
    const assets = await loadLogoCache();
    const hasCustomLogo = !!(assets && assets.logoLarge);
    const hasCustomFavicon = !!(assets && assets.favicon32);
    
    const version = assets?.version || Date.now();
    
    res.json({
      hasCustomLogo,
      hasCustomFavicon,
      logoLargeUrl: hasCustomLogo ? `/assets/logo-large.png?v=${version}` : null,
      logoMediumUrl: hasCustomLogo ? `/assets/logo-medium.png?v=${version}` : null,
      logoSmallUrl: hasCustomLogo ? `/assets/logo-small.png?v=${version}` : null,
      
      logoLargeJpgUrl: hasCustomLogo && assets.logoLargeJpg ? `/assets/logo-large.jpg?v=${version}` : null,
      logoMediumJpgUrl: hasCustomLogo && assets.logoMediumJpg ? `/assets/logo-medium.jpg?v=${version}` : null,
      logoSmallJpgUrl: hasCustomLogo && assets.logoSmallJpg ? `/assets/logo-small.jpg?v=${version}` : null,

      logoLargeWebpUrl: hasCustomLogo && assets.logoLargeWebp ? `/assets/logo-large.webp?v=${version}` : null,
      logoMediumWebpUrl: hasCustomLogo && assets.logoMediumWebp ? `/assets/logo-medium.webp?v=${version}` : null,
      logoSmallWebpUrl: hasCustomLogo && assets.logoSmallWebp ? `/assets/logo-small.webp?v=${version}` : null,

      favicon32Url: hasCustomFavicon ? `/assets/favicon-32x32.png?v=${version}` : null,
      favicon16Url: hasCustomFavicon ? `/assets/favicon-16x16.png?v=${version}` : null,
      version
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve logo status" });
  }
});

// POST save generated/uploaded logos in all required sizes and formats
app.post("/api/save-logo", async (req, res) => {
  try {
    const { 
      logoLarge, logoMedium, logoSmall, 
      logoLargeJpg, logoMediumJpg, logoSmallJpg, 
      logoLargeWebp, logoMediumWebp, logoSmallWebp, 
      favicon32, favicon16, faviconSvg 
    } = req.body;
    
    const assets = {
      logoLarge, logoMedium, logoSmall,
      logoLargeJpg, logoMediumJpg, logoSmallJpg,
      logoLargeWebp, logoMediumWebp, logoSmallWebp,
      favicon32, favicon16, faviconSvg,
      version: Date.now()
    };
    
    await saveLogoCache(assets);
    
    res.json({ success: true, message: "Logo files processed and saved successfully in all formats and sizes." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save logo files" });
  }
});

// POST delete custom logo and revert to original vector brand
app.post("/api/delete-logo", async (req, res) => {
  try {
    await deleteLogoCache();

    // Recreate default favicon.svg locally if possible
    try {
      const assetsDir = path.join(process.cwd(), "assets");
      const defaultSvgPath = path.join(assetsDir, "favicon.svg");
      const defaultSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
  <defs>
    <linearGradient id="soma-grad-default-teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0F4C5C" />
      <stop offset="100%" stopColor="#0B303B" />
    </linearGradient>
    <linearGradient id="soma-grad-default-gold-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#8A662D" />
      <stop offset="50%" stopColor="#D4A359" />
      <stop offset="100%" stopColor="#F9E7B9" />
    </linearGradient>
  </defs>
  <path d="M 33 46 C 26 44, 25 36, 33 34 C 32 38, 32 42, 33 46 Z" fill="url(#soma-grad-default-gold-grad)" opacity="0.9" />
  <path d="M 41 27 C 35 22, 38 13, 47 12 C 44 18, 43 23, 41 27 Z" fill="url(#soma-grad-default-gold-grad)" opacity="0.9" />
  <path d="M 59 27 C 65 22, 62 13, 53 12 C 56 18, 57 23, 59 27 Z" fill="url(#soma-grad-default-gold-grad)" opacity="0.9" />
  <path d="M 67 46 C 74 44, 75 36, 67 34 C 68 38, 68 42, 67 46 Z" fill="url(#soma-grad-default-gold-grad)" opacity="0.9" />
  <path d="M 35 48 C 24 43, 22 31, 33 29 C 34 34, 34 42, 35 48" fill="none" stroke="#0F4C5C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 65 48 C 76 43, 78 31, 67 29 C 66 34, 66 42, 65 48" fill="none" stroke="#0F4C5C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 50 16 C 43 25, 43 35, 50 42 C 57 35, 57 25, 50 16 Z" fill="none" stroke="#0F4C5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  <circle cx="50" cy="33.5" r="3.5" fill="url(#soma-grad-default-teal-grad)" />
  <path d="M 50 48 C 45 42, 38 41, 38 45.5 C 38 49.5, 46 51, 50 54.5" fill="none" stroke="#0F4C5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 50 48 C 55 42, 62 41, 62 45.5 C 62 49.5, 54 51, 50 54.5" fill="none" stroke="#0F4C5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 38 57 C 33 53, 41 49, 50 52 C 59 49, 67 53, 62 57 C 57 61, 43 61, 38 57 Z" fill="none" stroke="#0F4C5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 43 62 C 46 64, 54 64, 57 62" fill="none" stroke="#0F4C5C" strokeWidth="1.5" strokeLinecap="round" />
  <path d="M 46 65.5 C 48 67, 52 67, 54 65.5" fill="none" stroke="#0F4C5C" strokeWidth="1" strokeLinecap="round" />
</svg>`;
      fs.writeFileSync(defaultSvgPath, defaultSvgContent, "utf-8");
    } catch (e) {
      // ignore
    }

    res.json({ success: true, message: "Custom logo deleted, reverted to original default brand." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete custom logo" });
  }
});

// GET Bookings / Leads (compatibility with frontend booking fetch)
app.get("/api/bookings", async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      try {
        const leads = await supabaseDb.getLeads();
        return res.json(leads);
      } catch (subErr: any) {
        console.error("Supabase error fetching bookings, falling back to local:", subErr);
      }
    }
    db = loadDB();
    res.json(db.leads);
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
      try {
        const lead = await supabaseDb.addLead(newBooking);
        return res.status(201).json(lead);
      } catch (subErr: any) {
        console.error("Supabase error adding booking, falling back to local:", subErr);
      }
    }
    db.leads.unshift(newBooking);
    saveDB(db);
    res.status(201).json(newBooking);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to book appointment" });
  }
});

// CRUD - Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      try {
        const reviews = await supabaseDb.getReviews();
        return res.json(reviews);
      } catch (subErr: any) {
        console.error("Supabase error fetching reviews, falling back to local:", subErr);
      }
    }
    const localDb = loadDB();
    res.json(localDb.reviews || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch reviews" });
  }
});


app.post("/api/reviews", async (req, res) => {
  try {
    const { name, rating, comment, service, location } = req.body;
    if (!name || !rating || !comment || !service) {
      return res.status(400).json({ error: "Missing required review fields" });
    }
    const newRev = {
      id: `rev-${Date.now()}`,
      name,
      rating: Number(rating),
      comment,
      service,
      location: location || "Indore",
      date: new Date().toISOString().split("T")[0]
    };

    if (isSupabaseConfigured) {
      const rev = await supabaseDb.addReview(newRev as any);
      res.status(201).json(rev);
    } else {
      if (!db.reviews) {
        db.reviews = [];
      }
      db.reviews.unshift(newRev);
      saveDB(db);
      res.status(201).json(newRev);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit review" });
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
        .from("employees")
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
        .from("employees")
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

// CRUD - Bills & Invoices
app.get("/api/bills", async (req, res) => {
  try {
    db = loadDB();
    res.json(db.bills || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load bills" });
  }
});

app.post("/api/bills", async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, items, therapistId, therapistName, date, discount, tax, paymentMethod, status } = req.body;
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: "Customer details and at least one service item are required" });
    }

    db = loadDB();
    let subtotal = 0;
    const computedItems = items.map((item: any) => {
      const originalService = db.services.find((s: any) => s.id === item.serviceId || s.name === item.serviceName);
      const price = originalService ? originalService.price : Number(item.price);
      const qty = Number(item.qty || 1);
      subtotal += price * qty;
      return {
        serviceId: originalService ? originalService.id : (item.serviceId || `svc-custom-${Date.now()}`),
        serviceName: originalService ? originalService.name : item.serviceName,
        price,
        qty
      };
    });

    const disc = Number(discount || 0);
    const taxVal = Number(tax || 0);
    const total = subtotal - disc + taxVal;

    const newBill = {
      id: `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      items: computedItems,
      therapistId: therapistId || "",
      therapistName: therapistName || "",
      date: date || new Date().toISOString().split("T")[0],
      subtotal,
      discount: disc,
      tax: taxVal,
      total: Math.max(0, total),
      paymentMethod: paymentMethod || "Cash",
      status: status || "Paid",
      createdAt: new Date().toISOString()
    };

    if (!db.bills) db.bills = [];
    db.bills.unshift(newBill);
    saveDB(db);

    res.status(201).json(newBill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create invoice" });
  }
});

app.delete("/api/bills/:id", async (req, res) => {
  try {
    const { id } = req.params;
    db = loadDB();
    if (db.bills) {
      db.bills = db.bills.filter((b: any) => b.id !== id);
      saveDB(db);
    }
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete bill" });
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

    const response = await getGeminiClient().models.generateContent({
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
    const { createServer: createViteServer } = await import("vite");
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

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Error setting up server:", err);
  });
}

export default app;

