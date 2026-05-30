/* ========================================================================
   DataStore — localStorage-backed data layer for the portfolio
   ======================================================================== */

const DataStore = (() => {
  const STORAGE_KEY = 'portfolio_data_v2';

  const defaultData = {
    profile: {
      name: "Parth Saini",
      roles: ["Full Stack Developer", "AI/ML Engineer", "Software Developer"],
      bio: "Aspiring Full Stack Developer specializing in AI/ML. Proficient in Python, Java, and web technologies with hands-on experience developing AI models and functional web applications, evidenced by projects like a Voice Assistant and Hotel Management System.",
      avatar: "",
      resumeLink: "#",
      stats: [
        { label: "Projects Completed", value: 3 },
        { label: "AI Models Built", value: 4 },
        { label: "Technologies Mastered", value: 15 },
        { label: "Lines of Code", value: 50000 }
      ]
    },

    theme: {
      primaryColor: "#00d4ff",
      secondaryColor: "#7b2ff7",
      accentColor: "#ff2d75",
      bgColor: "#0a0a1a",
      surfaceColor: "#12122a",
      textColor: "#e0e0ff",
      fontHeading: "'Space Grotesk', sans-serif",
      fontBody: "'Inter', sans-serif"
    },

    skills: [
      { name: "Python",        category: "Backend",  level: 90 },
      { name: "Java",          category: "Backend",  level: 80 },
      { name: "C/C++",         category: "Backend",  level: 75 },
      { name: "R",             category: "Other",    level: 70 },
      { name: "HTML",          category: "Frontend", level: 85 },
      { name: "SQL",           category: "Database", level: 85 },
      { name: "PyTorch",       category: "AI/ML",    level: 85 },
      { name: "TensorFlow",    category: "AI/ML",    level: 80 },
      { name: "Scikit-learn",  category: "AI/ML",    level: 85 },
      { name: "NLP",           category: "AI/ML",    level: 80 },
      { name: "Generative AI", category: "AI/ML",    level: 75 },
      { name: "Django",        category: "Backend",  level: 80 },
      { name: "MySQL",         category: "Database", level: 85 }
    ],

    projects: [
      {
        id: 1,
        title: "Personal Desktop Voice Assistant",
        description: "Developed a low-latency voice assistant (STT/TTS) in Python with SpeechRecognition for offline verbal feedback. Implemented a Command Inference Engine with fuzzy-matching for native OS automation, achieving >90% accuracy in low-noise settings.",
        image: "",
        tags: ["Python", "SpeechRecognition", "NLP", "pyttsx3"],
        liveUrl: "",
        githubUrl: "",
        category: "AI / ML",
        featured: true
      },
      {
        id: 2,
        title: "2D to 3D Image Conversion",
        description: "Engineered a Client-Server application to transform single 2D images into interactive 3D models using a Deep Learning Inference Engine (CNN/GAN/NeRF). Designed an interactive 3D viewport (Three.js/WebGL) for real-time model manipulation using PyTorch/TensorFlow.",
        image: "",
        tags: ["PyTorch", "TensorFlow", "Three.js", "CNN", "GAN"],
        liveUrl: "",
        githubUrl: "",
        category: "AI / ML",
        featured: true
      },
      {
        id: 3,
        title: "Web-Based Hotel Management System",
        description: "Developed a secure web application to centralize core hotel operations, including dynamic booking, room allocation, and financial tracking. Implemented a robust Admin Dashboard to manage room inventory, update tariffs, and generate comprehensive reports.",
        image: "",
        tags: ["Flask/Django", "MySQL", "Web App"],
        liveUrl: "",
        githubUrl: "",
        category: "Web App",
        featured: true
      }
    ],

    experience: [
      {
        id: 1,
        role: "(BCA) Bachelor's in Computer Applications",
        company: "Maharishi Markandeshwar (Deemed To Be University)",
        period: "2023 — 2026",
        description: "Pursuing BCA with a specialization in AI & ML. Organizing tech events such as the coding relay at Technophilia 2025.",
        type: "education"
      },
      {
        id: 2,
        role: "X-XII (CBSE) Non-Medical",
        company: "Stephen International Public School",
        period: "2021 — 2023",
        description: "Completed secondary and higher secondary education with a focus on science and mathematics.",
        type: "education"
      },
      {
        id: 3,
        role: "AI & ML Technical Training",
        company: "Xplore",
        period: "2024",
        description: "Completed 4-week intensive training focusing on core ML concepts (Supervised/Unsupervised Learning), implementation using NumPy, Pandas, Scikit-Learn, and foundational math for AI (Linear Algebra, Calculus).",
        type: "education"
      },
      {
        id: 4,
        role: "Tech Event Coordinator",
        company: "Technophilia 2025",
        period: "2025",
        description: "Organized a coding relay event at the University.",
        type: "work"
      }
    ],

    testimonials: [],

    contact: {
      email: "sainiparth36@gmail.com",
      github: "",
      linkedin: "http://www.linkedin.com/in/parth-saini-a60b59299",
      twitter: "",
      location: "India"
    },

    settings: {
      password: "admin123",
      siteTitle: "Parth Saini — Portfolio"
    }
  };

  /* ---- helpers ---- */

  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /* ---- public API ---- */

  function getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return deepMerge(defaultData, JSON.parse(stored));
      }
    } catch (e) {
      console.warn('DataStore ▸ read error:', e);
    }
    return JSON.parse(JSON.stringify(defaultData));
  }

  function get(key) {
    return getAll()[key];
  }

  function set(key, value) {
    const all = getAll();
    all[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function setAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function exportData() {
    const data = getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      setAll(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function applyTheme(targetDoc) {
    const theme = get('theme');
    const root = (targetDoc || document).documentElement;
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--secondary', theme.secondaryColor);
    root.style.setProperty('--accent', theme.accentColor);
    root.style.setProperty('--bg', theme.bgColor);
    root.style.setProperty('--surface', theme.surfaceColor);
    root.style.setProperty('--text', theme.textColor);
    root.style.setProperty('--font-heading', theme.fontHeading);
    root.style.setProperty('--font-body', theme.fontBody);
  }

  function getDefaults() {
    return JSON.parse(JSON.stringify(defaultData));
  }

  function nextId(arrayKey) {
    const arr = get(arrayKey) || [];
    return arr.length ? Math.max(...arr.map(i => i.id || 0)) + 1 : 1;
  }

  return {
    getAll, get, set, setAll,
    exportData, importData,
    resetToDefaults, applyTheme,
    getDefaults, nextId
  };
})();
