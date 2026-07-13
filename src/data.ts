import { Service, Therapist, Review } from "./types";

export const SERVICES: Service[] = [
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
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800"
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
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800"
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
    comment: "Simply the best spa experience in Indore. The Abhyanga Ayurvedic Massage was magical. The therapists are extremely professional and the atmosphere is so calm and fragrant.",
    date: "June 25, 2026",
    service: "Abhyanga – Full Body Ayurvedic Oil Massage"
  },
  {
    id: "rev-2",
    name: "Neha Agrawal",
    location: "Saket, Indore",
    rating: 5,
    comment: "I went for the Mukhabhyanga Ayurvedic facial massage after a stressful work week. The herbal oils smell so authentic, and my skin felt refreshed instantly. Highly recommended!",
    date: "June 28, 2026",
    service: "Mukhabhyanga – Ayurvedic Face Massage"
  },
  {
    id: "rev-3",
    name: "Vikram Rathore",
    location: "Bicholi Mardana, Indore",
    rating: 5,
    comment: "Being a fitness enthusiast, my shoulders are always stiff. The Deep Tissue massage by Manoj was amazing. He really knew how to work on the trigger points.",
    date: "July 01, 2026",
    service: "Deep Tissue Massage"
  }
];
