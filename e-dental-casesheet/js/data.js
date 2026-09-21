/**
 * E-Dental CaseSheet Platform - Master Clinical Departments & Case Sheets Data
 * Academic Year 2026–2027 • College of Dentistry Clinical Information System
 */

const DENTAL_DEPARTMENTS = [
  {
    id: "omfs",
    code: "OMFS",
    nameAr: "فرع جراحة الفم والوجه والفكين",
    nameEn: "Department of Oral & Maxillofacial Surgery",
    icon: "scissors",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    gradient: "from-sky-500 to-blue-600",
    accentColor: "sky",
    descriptionAr: "يشمل التداخلات الجراحية الصغرى، القلع البسيط والجراحي، أمراض وجراحة اللثة، زراعة الأسنان، وتطبيقات الليزر.",
    descriptionEn: "Minor oral surgeries, tooth extractions, periodontal surgery, implantology, and surgical lasers.",
    caseSheets: [
      {
        id: "omfs-ext-01",
        code: "OMFS-EXT-01",
        titleAr: "شعبة جراحة الفم وقلع الأسنان",
        titleEn: "Oral Surgery & Tooth Extraction",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "12 حالة قلع سريرية",
        icon: "activity",
        keywords: ["قلع", "جراحة", "extraction", "forceps", "elevators", "anaesthesia", "تخدير"],
        summaryAr: "تقييم صعوبة القلع، التاريخ المرضي الطبي، التخدير الموضعي، تدابير مضاعفات ما بعد القلع.",
        clinicalFocus: ["ASA Physical Status", "Local Anesthesia Type & Cartridges", "Extraction Technique (Closed/Surgical)", "Post-Op Instructions & Suturing"]
      },
      {
        id: "perio-surg-02",
        code: "PERIO-SURG-02",
        titleAr: "شعبة أمراض وجراحة اللثة (التقليح والوقاية - صف رابع)",
        titleEn: "Periodontics & Preventive Scaling (4th Year BDS)",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "6 حالات تقليح وتلميع وفحص اللثة (Scaling & Polishing)",
        icon: "shield-alert",
        keywords: ["لثة", "تقليح", "تلميع", "scaling", "polishing", "gingivitis", "periodontitis", "pocket", "صف رابع", "رابع"],
        summaryAr: "استمارة الفحص اللثوي السريري، فحص الترسبات واللويحة (Plaque & Calculus)، التقليح والتلميع وتوجيهات العناية الفموية (OHI) لطلاب المرحلة الرابعة.",
        clinicalFocus: ["Plaque & Calculus Index", "Gingival Bleeding on Probing (BOP)", "Basic Periodontal Examination (BPE 0-4)", "Ultrasonic Scaling & Prophy Polishing Protocol"]
      },
      {
        id: "impl-03",
        code: "IMPL-03",
        titleAr: "شعبة زراعة الأسنان",
        titleEn: "Dental Implantology",
        stageAr: "المرحلة الخامسة - سريري متقدم",
        stageEn: "5th Year BDS (Advanced)",
        requirement: "3 حالات تخطيط وغرسات",
        icon: "anchor",
        keywords: ["زراعة", "غرسات", "implant", "osteotomy", "bone graft", "abutment"],
        summaryAr: "تقييم العظم المتبقي بالأشعة المقطعية CBCT، اختيار قياس الغرسة، وتخطيط التعويض النهائي.",
        clinicalFocus: ["CBCT Bone Density & Dimensions", "Implant System & Diameter", "Primary Stability Torque", "Prosthetic Connection"]
      },
      {
        id: "laser-04",
        code: "LASER-04",
        titleAr: "شعبة تطبيقات الليزر الجراحي",
        titleEn: "Surgical Laser Applications",
        stageAr: "المرحلة الخامسة / دراسات تخصصية",
        stageEn: "5th Year / Specialist",
        requirement: "حالتان سريريتان",
        icon: "zap",
        keywords: ["ليزر", "قص لثة", "laser", "gingivectomy", "frenectomy", "diode"],
        summaryAr: "استئصال اللجام (Frenectomy)، قص حواف اللثة بالليزر الثنائي (Diode Laser)، والتعقيم الحيوي.",
        clinicalFocus: ["Laser Wavelength (Diode 810/980nm)", "Power Setting (Watts/Continuous/Pulse)", "Tissue Hemostasis", "Safety Protocol"]
      }
    ]
  },
  {
    id: "odom",
    code: "ODOM",
    nameAr: "فرع التشخيص الفموي",
    nameEn: "Department of Oral Diagnosis & Medicine",
    icon: "stethoscope",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    gradient: "from-indigo-500 to-purple-600",
    accentColor: "indigo",
    descriptionAr: "المحطة الأولى لكل مريض: الفحص السريري الشامل، الأشعة السينية والفحوصات النسيجية، وتشخيص آفات الفم.",
    descriptionEn: "First gateway of dental patient care: oral pathology, panoramic/intraoral radiology, and clinical triage.",
    caseSheets: [
      {
        id: "omed-path-01",
        code: "OMED-PATH-01",
        titleAr: "شعبة طب وأمراض الفم",
        titleEn: "Oral Medicine & Pathology",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "8 حالات تشخيصية",
        icon: "clipboard-list",
        keywords: ["طب الفم", "قرحة", "أورام", "aphthous", "lichen planus", "lesion", "biopsy"],
        summaryAr: "تشخيص الآفات المخاطية، التقران الفموي، أمراض اللعاب، وطلب الفحوصات المخبرية والخزعات.",
        clinicalFocus: ["Lesion Morphology (Macule/Papule/Ulcer)", "Etiology & Differential Diagnosis", "Biopsy Indication", "Pharmacotherapy Plan"]
      },
      {
        id: "rad-img-02",
        code: "RAD-IMG-02",
        titleAr: "شعبة الأشعة السينية والتشخيص الشعاعي",
        titleEn: "Oral Radiology & Imaging",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "15 فحصاً شعاعياً معتمداً",
        icon: "eye",
        keywords: ["أشعة", "بانوراما", "periapical", "bitewing", "radiograph", "CBCT", "OPG"],
        summaryAr: "قراءة وتحليل الصور حول الذروية، الجناحية (Bitewing)، البانورامية، ورصد الامتصاص العظمي والتسوس الخفي.",
        clinicalFocus: ["Radiographic Technique (Bisecting/Paralleling)", "Radiolucency / Radiopacity Findings", "Lamina Dura & Bone Level", "Impacted Teeth Evaluation"]
      },
      {
        id: "diag-plan-03",
        code: "DIAG-PLAN-03",
        titleAr: "شعبة الفحص السريري ووضع خطة العلاج",
        titleEn: "Oral Diagnosis & Treatment Planning",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "10 مخططات علاجية متكاملة",
        icon: "file-check",
        keywords: ["فحص", "خطة علاج", "examination", "treatment plan", "triage", "charting"],
        summaryAr: "الفحص الشامل داخل وخارج الفم، ترتيب أولويات العلاج (إسعافي، وقائي، ترميمي، جراحي، تعويضي).",
        clinicalFocus: ["Extra-oral TMJ & Lymph Nodes Exam", "Intra-oral Soft & Hard Tissue Charting", "Phase I - IV Treatment Planning", "Referral Priorities"]
      }
    ]
  },
  {
    id: "pop",
    code: "POP",
    nameAr: "فرع البي أو بي (POP)",
    nameEn: "Department of POP (Pedodontics, Orthodontics & Preventive)",
    icon: "sparkles",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    gradient: "from-rose-500 to-pink-600",
    accentColor: "rose",
    descriptionAr: "الرعاية السنية للأطفال، تقويم الأسنان وتعديل نمو الفكين، والتدابير الوقائية لتطبيق الفلورايد وسادات الشقوق.",
    descriptionEn: "Pediatric dental management, interceptive orthodontics, and population oral disease prevention.",
    caseSheets: [
      {
        id: "ortho-01",
        code: "ORTHO-01",
        titleAr: "شعبة تقويم الأسنان والفكين",
        titleEn: "Orthodontics",
        stageAr: "المرحلة الخامسة",
        stageEn: "5th Year BDS",
        requirement: "4 دراسات تشخيصية وتقويمية",
        icon: "smile",
        keywords: ["تقويم", "سوء إطباق", "ortho", "malocclusion", "angle class", "crowding", "cephalometrics"],
        summaryAr: "تصنيف إنجل لسوء الإطباق (Angle's Class I, II, III)، تحليل القياسات الرأسية (Cephalometrics)، وتصميم الأجهزة التقويمية.",
        clinicalFocus: ["Angle's Classification (Molar/Canine)", "Overjet & Overbite (mm)", "Arch Length Discrepancy", "Removable / Fixed Appliance Design"]
      },
      {
        id: "pedo-02",
        code: "PEDO-02",
        titleAr: "شعبة طب أسنان الأطفال",
        titleEn: "Pediatric Dentistry - Pedo",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "8 حالات سريرية للأطفال",
        icon: "baby",
        keywords: ["أطفال", "أسنان لبنية", "pedo", "pulpotomy", "strip crown", "behavior", "فلورايد"],
        summaryAr: "إدارة سلوك الطفل (Frankl Scale)، بتر اللب الحيوي (Pulpotomy)، والتيجان الفولاذية مسبقة الصنع (SSC).",
        clinicalFocus: ["Frankl Behavior Rating Scale", "Primary Teeth Pulpotomy / Pulpectomy", "Stainless Steel Crowns (SSC)", "Space Maintainers"]
      },
      {
        id: "prev-03",
        code: "PREV-03",
        titleAr: "شعبة طب الأسنان الوقائي",
        titleEn: "Preventive Dentistry",
        stageAr: "المرحلة الثالثة والرابعة",
        stageEn: "3rd & 4th Year BDS",
        requirement: "6 إجراءات وقائية معتمدة",
        icon: "shield-check",
        keywords: ["وقاية", "فلورايد", "سادات الشقوق", "sealant", "fluoride varnish", "caries risk", "diet"],
        summaryAr: "تقييم مخاطر النخر (CAMBRA)، تطبيق الفلورايد الموضعي (Varnish)، ووضع سادات الشقوق والميازيب (Pit & Fissure Sealants).",
        clinicalFocus: ["CAMBRA Caries Risk Assessment", "Pit & Fissure Sealant Application", "Fluoride Varnish Protocol", "Dietary Counseling & OHI"]
      }
    ]
  },
  {
    id: "prosth",
    code: "PROSTH",
    nameAr: "فرع صناعة الأسنان والتعويضات",
    nameEn: "Department of Prosthodontics",
    icon: "layers",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    gradient: "from-amber-500 to-orange-600",
    accentColor: "amber",
    descriptionAr: "استعادة وظيفة المضغ والمظهر الجمالي بالتعويضات المتحركة الكاملة، والجزئية، والتعويضات الثابتة كالأطواق والجسور.",
    descriptionEn: "Complete dentures, removable partial dentures, metal-ceramic crowns, and fixed bridges.",
    caseSheets: [
      {
        id: "pros-cd-01",
        code: "PROS-CD-01",
        titleAr: "شعبة التعويضات المتحركة الكاملة",
        titleEn: "Complete Dentures",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "طقم كامل مكتمل (فكين)",
        icon: "box",
        keywords: ["طقم كامل", "أدرد", "complete denture", "edentulous", "impression", "vertical dimension", "try-in"],
        summaryAr: "فحص الفك الأدرد، الطبعات الأولية والنهائية، قياس البعد العمودي الإطباقي (VDO)، وتجربة الشمع والأسنان.",
        clinicalFocus: ["Ridge Anatomy & Arch Form", "Primary & Border Molded Secondary Impression", "Jaw Relation & VDO Measurement", "Wax Try-In & Occlusal Scheme"]
      },
      {
        id: "pros-rpd-02",
        code: "PROS-RPD-02",
        titleAr: "شعبة التعويضات الجزئية",
        titleEn: "Removable Partial Dentures",
        stageAr: "المرحلة الرابعة",
        stageEn: "4th Year BDS",
        requirement: "حالتا تعويض جزئي متحرك",
        icon: "grid",
        keywords: ["تعويض جزئي", "كندي", "partial denture", "Kennedy class", "surveying", "clasps", "rests"],
        summaryAr: "تصنيف كينيدي (Kennedy Classification)، مسح النموذج (Surveying)، تحديد خط الإدخال، وتصميم المشابك والدعامات.",
        clinicalFocus: ["Kennedy Classification (I-IV + Mods)", "Surveying & Guiding Planes", "Direct / Indirect Retainers Design", "Major & Minor Connectors"]
      },
      {
        id: "pros-fix-03",
        code: "PROS-FIX-03",
        titleAr: "شعبة التعويضات الثابتة والتيجان",
        titleEn: "Fixed Prosthodontics / Crown & Bridge",
        stageAr: "المرحلة الخامسة",
        stageEn: "5th Year BDS",
        requirement: "4 وحدات تاج وجسر (Units)",
        icon: "crown",
        keywords: ["تاج", "جسر", "crown", "bridge", "preparation", "zirconia", "PFM", "retraction cord"],
        summaryAr: "تحضير الدعامة السنية، خط الإنهاء (Chamfer / Shoulder)، خيط التبعيد اللثوي، طبعة السيليكون، والتثبيت النهائي.",
        clinicalFocus: ["Tooth Reduction & Margin Design", "Gingival Retraction & Elastomeric Impression", "Provisional Crown Fabrication", "Cementation Protocol (Resin/GIC)"]
      }
    ]
  },
  {
    id: "cons",
    code: "CONS",
    nameAr: "فرع طب الأسنان التحفظي والعلوم الأساسية",
    nameEn: "Department of Conservative Dentistry & Basic Sciences",
    icon: "hammer",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gradient: "from-emerald-500 to-teal-600",
    accentColor: "emerald",
    descriptionAr: "ترميم الأسنان المتسوسة بالحشوات التجميلية والمعدنية، معالجة الجذور والأعصاب، وهندسة بيئة العمل السريرية.",
    descriptionEn: "Operative composite & amalgam restorations, endodontic root canal treatments, and clinical ergonomics.",
    caseSheets: [
      {
        id: "oper-fill-01",
        code: "OPER-FILL-01",
        titleAr: "شعبة حشوات الأسنان والمداواة الترميمية",
        titleEn: "Operative Dentistry / Fillings",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "14 حشوة سريرية متنوعة",
        icon: "check-circle-2",
        keywords: ["حشوة", "كومبوزيت", "أملغم", "composite", "amalgam", "Class I", "Class II", "rubber dam"],
        summaryAr: "عزل السن بالحاجز المطاطي (Rubber Dam)، تجريف التسوس، تصنيف بلاك (Black's Cavity Class I-V)، وتطبيق الكومبوزيت المباشر.",
        clinicalFocus: ["Rubber Dam Isolation", "Cavity Classification (Black Class I-V)", "Etch, Prime & Bonding Protocol", "Finishing & Occlusion Adjustment"]
      },
      {
        id: "endo-rct-02",
        code: "ENDO-RCT-02",
        titleAr: "شعبة معالجة جذور الأسنان",
        titleEn: "Endodontics / Root Canal Treatment",
        stageAr: "المرحلة الرابعة والخامسة",
        stageEn: "4th & 5th Year BDS",
        requirement: "4 حالات معالجة عصب (أسنان مفردة ومتعددة القنوات)",
        icon: "flame",
        keywords: ["عصب", "جذور", "endo", "root canal", "working length", "obturation", "apex locator", "gutta percha"],
        summaryAr: "فحص حيوية اللب (Vitality)، قياس الطول العامل بالمحدد الذروي والأشعة، التوسيع الآلي أو اليدوي، والحشو بالكوتابيركا.",
        clinicalFocus: ["Pulp Vitality & Periapical Status", "Access Cavity & Working Length (WL)", "Instrumentation & Irrigation (NaOCl)", "3D Obturation & Master Cone Fit"]
      },
      {
        id: "basic-ergo-03",
        code: "BASIC-ERGO-03",
        titleAr: "شعبة العلوم الأساسية ومحيط العمل",
        titleEn: "Basic Dental Sciences & Ergonomics",
        stageAr: "المرحلة الثالثة والرابعة",
        stageEn: "3rd & 4th Year BDS",
        requirement: "تقييم سريري وإرجونوميكس دوري",
        icon: "user-check",
        keywords: ["أمان", "تعقيم", "ergonomics", "posture", "sterilization", "infection control", "PPE"],
        summaryAr: "وضعية الجلوس السريرية الصحيحة (Clock Concept 8–12)، بروتوكولات مكافحة العدوى والتعقيم، وحماية العمود الفقري.",
        clinicalFocus: ["Operator & Assistant Working Posture", "Infection Control & Cross-Contamination Barriers", "Instrument Transfer Ergonomics", "Biomedical Waste Disposal"]
      }
    ]
  }
];

// Student Profile Mock Data
const STUDENT_SESSION = {
  name: "د. علي حيدر الموسوي",
  nameEn: "Dr. Ali H. Al-Mousawi",
  studentId: "DEN-2022-8419",
  academicYear: "2026–2027",
  stageAr: "المرحلة الخامسة - بكالوريوس طب وجراحة الفم والأسنان",
  stageEn: "5th Year BDS Candidate",
  clinicRoom: "عيادة د - الكرسي رقم 14",
  supervisor: "أ.د. عبد الله الصالحي (استشاري جراحة وترميم)",
  stats: {
    todayCases: 3,
    savedDrafts: 2,
    approvedRequirements: 18,
    totalRequired: 25,
    attendanceStreak: "98%"
  }
};
