export const departments = [
  {
    slug: "cardiology",
    name: "Cardiology",
    short:
      "Focused on heart health, offering diagnostics, treatment, and long-term cardiovascular care.",
    description:
      "Cardiology specializes in heart and blood vessel conditions. We cover preventive screenings, ECG and echo support, hypertension care, and post-cardiac follow-up with personalized treatment plans.",
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80",
    topics: ["Heart Checkup", "Hypertension", "ECG & Echo", "Preventive Cardiac Care"],
    doctors: ["Dr. Meera Khanna", "Dr. Rajat Sharma", "Dr. Aisha Khan"],
    blogs: [
      "How to keep your heart healthy after 40",
      "Understanding blood pressure readings",
      "When chest pain needs urgent attention",
    ],
  },
  {
    slug: "neurology",
    name: "Neurology",
    short:
      "Diagnosis and treatment of nervous system disorders including migraines, epilepsy, and stroke.",
    description:
      "Neurology focuses on the brain, spine, and nerves. We help with headaches, seizures, movement issues, neuropathy, and stroke risk management through evidence-based evaluation and therapy.",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80",
    topics: ["Migraine Care", "Stroke Support", "Epilepsy Management", "Nerve Disorders"],
    doctors: ["Dr. Nikhil Verma", "Dr. Priya Nair", "Dr. S. Kulkarni"],
    blogs: [
      "Early warning signs of stroke",
      "How migraine triggers can be managed",
      "Neuropathy: symptoms and treatment options",
    ],
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology",
    short:
      "Comprehensive digestive care for acidity, liver health, IBS, and endoscopic evaluation.",
    description:
      "Gastroenterology treats digestive system disorders, including reflux, liver concerns, inflammatory bowel disease, and gut infections. Plans combine diagnostics, diet guidance, and clinical treatment.",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    topics: ["Acid Reflux", "Liver Function", "IBS/IBD", "Endoscopy Support"],
    doctors: ["Dr. Arvind Menon", "Dr. Swati Patel", "Dr. James Dsouza"],
    blogs: [
      "Gut health basics everyone should know",
      "Liver-friendly lifestyle habits",
      "Difference between IBS and IBD",
    ],
  },
  {
    slug: "orthopedics",
    name: "Orthopedics",
    short:
      "Bone, joint, and spine care for injuries, arthritis, sports recovery, and mobility support.",
    description:
      "Orthopedics addresses musculoskeletal conditions such as fractures, ligament injuries, chronic back pain, and arthritis. We provide non-surgical and surgical pathways to restore movement.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
    topics: ["Joint Pain", "Sports Injury", "Spine Care", "Arthritis Management"],
    doctors: ["Dr. Vivek Arora", "Dr. Shalini Joshi", "Dr. Rohan Batra"],
    blogs: [
      "How to protect knees during workouts",
      "Back pain: causes and prevention",
      "Recovery timeline after common fractures",
    ],
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    short:
      "Child-focused healthcare covering growth, immunity, nutrition, and routine pediatric concerns.",
    description:
      "Pediatrics provides complete medical support for infants, children, and adolescents. Our team covers vaccinations, growth monitoring, recurring infections, allergy care, and developmental guidance.",
    image:
      "https://images.unsplash.com/photo-1612276529731-4b21494e6d71?auto=format&fit=crop&w=800&q=80",
    topics: ["Child Immunization", "Growth Monitoring", "Allergy Care", "Nutrition Advice"],
    doctors: ["Dr. Neha Sethi", "Dr. Ajay Gupta", "Dr. Tanya Das"],
    blogs: [
      "Vaccination schedule explained for parents",
      "How to improve child immunity naturally",
      "Common childhood illnesses and home care",
    ],
  },
  {
    slug: "endocrinology",
    name: "Endocrinology",
    short:
      "Hormone and metabolism care for thyroid disorders, diabetes, PCOS, and adrenal conditions.",
    description:
      "Endocrinology manages hormone-related diseases that affect metabolism, growth, and energy. We provide evaluation and treatment for diabetes, thyroid imbalance, PCOS, and endocrine gland disorders.",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    topics: ["Diabetes Care", "Thyroid Disorders", "PCOS Management", "Metabolic Health"],
    doctors: ["Dr. Kavita Rao", "Dr. Imran Sheikh", "Dr. Leena Mathew"],
    blogs: [
      "Signs your thyroid needs a checkup",
      "Lifestyle tips for better blood sugar control",
      "Understanding hormonal imbalance symptoms",
    ],
  },
  {
    slug: "ophthalmology",
    name: "Ophthalmology",
    short:
      "Complete eye care for vision correction, cataract management, glaucoma screening, and retina health.",
    description:
      "Ophthalmology focuses on diagnosis and treatment of eye diseases and vision problems. Our services include routine eye exams, cataract care, glaucoma checks, retina evaluation, and preventive eye health plans.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    topics: ["Vision Checkup", "Cataract Care", "Glaucoma Screening", "Retina Evaluation"],
    doctors: ["Dr. Sneha Iyer", "Dr. Prakash Nanda", "Dr. Mehul Shah"],
    blogs: [
      "How often should you get an eye exam?",
      "Digital eye strain: prevention and relief",
      "Early signs of cataract and glaucoma",
    ],
  },
];

export const getDepartmentBySlug = (slug) =>
  departments.find((department) => department.slug === slug);
