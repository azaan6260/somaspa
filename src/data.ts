import { Service, Therapist, Review } from "./types";

export const SERVICES: Service[] = [
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

export const THERAPISTS: Therapist[] = [
  {
    id: "siddharth",
    name: "Siddharth Nair",
    specialty: "Ayurvedic Treatments & Pain Management",
    experience: "8 Years",
    rating: 4.9,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" // placeholder clean portrait
  },
  {
    id: "aarti",
    name: "Aarti Holkar",
    specialty: "Organic Skin Facials & Aromatherapy",
    experience: "6 Years",
    rating: 4.8,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "manoj",
    name: "Manoj Yadav",
    specialty: "Deep Tissue & Nirvana Hot Stones",
    experience: "7 Years",
    rating: 4.9,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "elena",
    name: "Elena Gonsalves",
    specialty: "Aroma Harmony & Swedish Relaxation",
    experience: "5 Years",
    rating: 4.7,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  }
];

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Amit Patel",
    location: "Vijay Nagar, Indore",
    rating: 5,
    comment: "Simply the best spa experience in Indore. The Abhyanga Shanti was magical. The therapists are extremely professional and the atmosphere is so calm and fragrant.",
    date: "June 25, 2026",
    service: "Abhyanga Shanti Ayurvedic Massage"
  },
  {
    id: "rev-2",
    name: "Neha Agrawal",
    location: "Saket, Indore",
    rating: 5,
    comment: "I went for the Indori Royal Soundarya facial after a stressful work week. The sandalwood and saffron smells so authentic, and my skin felt refreshed instantly. Highly recommended!",
    date: "June 28, 2026",
    service: "Indori Royal Soundarya Facial"
  },
  {
    id: "rev-3",
    name: "Vikram Rathore",
    location: "Bicholi Mardana, Indore",
    rating: 5,
    comment: "Being a fitness enthusiast, my shoulders are always stiff. The Deep Tissue Mukti massage by Manoj was amazing. He really knew how to work on the trigger points.",
    date: "July 01, 2026",
    service: "Deep Tissue Mukti Massage"
  }
];
