// Custom Content Library for the AI Assistant
// This file contains predefined knowledge, FAQs, and contextual information
// that the AI can reference when responding to users.

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  priority: number; // Higher priority items are more likely to be included
  language?: string; // Support for multiple languages
}

export interface ContentLibrary {
  [category: string]: ContentItem[];
}

// Main content library with Gappy AI specific content
export const contentLibrary: ContentLibrary = {
  "about": [
    {
      id: "gappy_concept",
      title: "About Gappy AI",
      content: "Gappy AI is a smart automation system designed for aquariums and fish farms, combining AI, IoT, and data analytics to reduce labor, automate tasks, and increase efficiency.",
      category: "about",
      keywords: ["gappy ai", "concept", "smart automation", "aquarium", "fish farm", "ai", "iot", "analytics"],
      priority: 10,
      language: "english"
    },
    {
      id: "gappy_description",
      title: "Gappy AI Description",
      content: "Gappy AI is a smart aquarium monitoring and automation system that helps fish farmers and aquarium owners cut costs, reduce labor, and boost efficiency.",
      category: "about",
      keywords: ["description", "monitoring", "automation", "fish farmer", "aquarium owner", "cost reduction", "efficiency"],
      priority: 9,
      language: "english"
    }
  ],

  "taglines": [
    {
      id: "tagline_main",
      title: "Main Tagline",
      content: "Cut Costs, Reduce Labor, Boost Efficiency in Fish Farming 💧🐠",
      category: "taglines",
      keywords: ["tagline", "slogan", "fish farming", "cost", "labor", "efficiency"],
      priority: 8,
      language: "english"
    },
    {
      id: "tagline_automation",
      title: "Automation Tagline",
      content: "Automation meets aquaculture — powered by Gappy AI.",
      category: "taglines",
      keywords: ["automation", "aquaculture", "technology", "ai"],
      priority: 8,
      language: "english"
    },
    {
      id: "tagline_smart",
      title: "Smart System Tagline",
      content: "AI-powered smart aquarium system for effortless fish care.",
      category: "taglines",
      keywords: ["ai-powered", "smart aquarium", "fish care", "effortless"],
      priority: 8,
      language: "english"
    }
  ],

  "industry": [
    {
      id: "industry_info",
      title: "Industry Information",
      content: "Industry: Aquaculture Technology / IoT Automation / AI Solutions. AI-powered automation for smart aquariums and fish farms — efficient, affordable, and intelligent.",
      category: "industry",
      keywords: ["aquaculture", "technology", "iot", "automation", "ai solutions", "industry"],
      priority: 8,
      language: "english"
    }
  ],

  "features": [
    {
      id: "feature_monitoring",
      title: "Water Quality Monitoring",
      content: "Automatic water quality monitoring with real-time sensors for pH, temperature, and water clarity.",
      category: "features",
      keywords: ["water quality", "monitoring", "sensors", "ph", "temperature", "clarity"],
      priority: 9,
      language: "english"
    },
    {
      id: "feature_feeding",
      title: "Smart Feeding System",
      content: "Automated feeding system that dispenses the right amount of food at optimal times based on fish behavior and water conditions.",
      category: "features",
      keywords: ["smart feeding", "automated", "food dispenser", "fish behavior", "feeding schedule"],
      priority: 9,
      language: "english"
    },
    {
      id: "feature_uv_control",
      title: "UV and Temperature Control",
      content: "Automatic UV sterilization and temperature regulation to maintain optimal water conditions for fish health.",
      category: "features",
      keywords: ["uv sterilization", "temperature control", "water conditions", "fish health", "regulation"],
      priority: 8,
      language: "english"
    },
    {
      id: "feature_interface",
      title: "Display and Mobile App",
      content: "User-friendly display interface and mobile app for real-time monitoring and control of your aquarium system.",
      category: "features",
      keywords: ["display", "mobile app", "interface", "monitoring", "control", "real-time"],
      priority: 8,
      language: "english"
    },
    {
      id: "feature_integration",
      title: "Firebase Integration",
      content: "Seamless integration with Firebase for real-time data synchronization and cloud storage of aquarium metrics.",
      category: "features",
      keywords: ["firebase", "integration", "real-time", "data sync", "cloud storage"],
      priority: 7,
      language: "english"
    }
  ],

  "hardware": [
    {
      id: "hardware_esp32",
      title: "ESP32 Integration",
      content: "ESP32 microcontroller serves as the central brain of the system, connecting all sensors and actuators with reliable WiFi connectivity.",
      category: "hardware",
      keywords: ["esp32", "microcontroller", "wifi", "connectivity", "sensors", "actuators"],
      priority: 8,
      language: "english"
    },
    {
      id: "hardware_sensors",
      title: "Sensor Suite",
      content: "Comprehensive sensor array including Dallas Temperature Sensor for water temperature, Ultrasonic Sensor for water level monitoring, and pH sensors for water quality assessment.",
      category: "hardware",
      keywords: ["sensors", "temperature", "ultrasonic", "water level", "ph", "water quality"],
      priority: 8,
      language: "english"
    },
    {
      id: "hardware_display",
      title: "Display System",
      content: "Integrated display system for local monitoring and control, providing real-time status updates and system information.",
      category: "hardware",
      keywords: ["display", "local monitoring", "control", "status", "real-time"],
      priority: 7,
      language: "english"
    },
    {
      id: "hardware_servo",
      title: "Servo Integration",
      content: "Precision servo motors for automated feeding mechanisms and other mechanical operations in the aquarium system.",
      category: "hardware",
      keywords: ["servo", "motors", "feeding", "automation", "mechanical"],
      priority: 7,
      language: "english"
    }
  ],

  "technical": [
    {
      id: "technical_firebase",
      title: "Firebase Integration",
      content: "Firebase integration enables real-time data synchronization between ESP32 devices and the mobile application, ensuring all stakeholders have access to current aquarium conditions.",
      category: "technical",
      keywords: ["firebase", "esp32", "real-time", "synchronization", "mobile app"],
      priority: 8,
      language: "english"
    },
    {
      id: "technical_calibration",
      title: "Sensor Calibration",
      content: "Advanced sensor calibration system for UV, water level, temperature, and pH sensors ensures accurate measurements and reliable system operation.",
      category: "technical",
      keywords: ["calibration", "sensors", "uv", "water level", "temperature", "ph", "accuracy"],
      priority: 7,
      language: "english"
    }
  ],

  "setup": [
    {
      id: "setup_process",
      title: "Setup Process",
      content: "Setting up Gappy AI involves: 1) Hardware assembly with ESP32 and sensors, 2) Firebase project configuration, 3) Mobile app installation, 4) Network configuration and testing.",
      category: "setup",
      keywords: ["setup", "installation", "hardware", "esp32", "firebase", "mobile app", "network"],
      priority: 9,
      language: "english"
    },
    {
      id: "setup_requirements",
      title: "System Requirements",
      content: "System requirements: ESP32 development board, compatible sensors (temperature, ultrasonic, pH), stable WiFi connection, Firebase account, and mobile device with app support.",
      category: "setup",
      keywords: ["requirements", "esp32", "sensors", "wifi", "firebase", "mobile"],
      priority: 8,
      language: "english"
    }
  ],

  "troubleshooting": [
    {
      id: "trouble_connection",
      title: "Connection Issues",
      content: "Connection problems can be resolved by: 1) Checking WiFi credentials, 2) Verifying Firebase configuration, 3) Ensuring proper power supply, 4) Restarting the ESP32 device.",
      category: "troubleshooting",
      keywords: ["connection", "wifi", "firebase", "power", "esp32", "restart"],
      priority: 9,
      language: "english"
    },
    {
      id: "trouble_sensors",
      title: "Sensor Issues",
      content: "If sensors are not reading correctly: 1) Check sensor connections, 2) Calibrate sensors in the app, 3) Clean sensor probes, 4) Verify sensor compatibility.",
      category: "troubleshooting",
      keywords: ["sensors", "calibration", "connections", "cleaning", "compatibility"],
      priority: 8,
      language: "english"
    },
    {
      id: "trouble_firebase",
      title: "Firebase Sync Issues",
      content: "Firebase synchronization problems: 1) Check API keys, 2) Verify project configuration, 3) Ensure proper authentication, 4) Check network connectivity.",
      category: "troubleshooting",
      keywords: ["firebase", "sync", "api keys", "authentication", "network"],
      priority: 8,
      language: "english"
    }
  ],

  "pricing": [
    {
      id: "pricing_basic",
      title: "Basic Package",
      content: "Basic package includes: ESP32 board, basic sensors (temperature, water level), mobile app access, and standard support. Perfect for small aquariums and beginners.",
      category: "pricing",
      keywords: ["basic", "package", "esp32", "sensors", "mobile app", "beginners"],
      priority: 7,
      language: "english"
    },
    {
      id: "pricing_premium",
      title: "Premium Package",
      content: "Premium package includes: Advanced sensor suite (pH, UV, turbidity), automated feeding system, priority support, and custom configuration options.",
      category: "pricing",
      keywords: ["premium", "advanced", "sensors", "feeding", "support", "custom"],
      priority: 8,
      language: "english"
    }
  ],

  "faq": [
    {
      id: "faq_what_is_gappy",
      title: "What is Gappy AI?",
      content: "Gappy AI is a smart automation system designed for aquariums and fish farms, combining AI, IoT, and data analytics to reduce labor, automate tasks, and increase efficiency.",
      category: "faq",
      keywords: ["what is", "gappy ai", "what is gappy", "smart system", "automation"],
      priority: 10,
      language: "english"
    },
    {
      id: "faq_sinhala_what_is_gappy",
      title: "Gappy AI මොකක්ද? - What is Gappy AI?",
      content: "Gappy AI යනු මාළු ටැංකි සහ මාළු ගොවිපල සඳහා නිර්මාණය කර ඇති ස්මාර්ට් ස්වයංක්‍රීයකරණ පද්ධතියකි. AI, IoT සහ දත්ත විශ්ලේෂණ ඒකාබද්ධ කර කම්කරු බලකාය අඩු කිරීම, කාර්යයන් ස්වයංක්‍රීයකරණය සහ කාර්යක්ෂමතාව වැඩි කිරීම සිදු කරයි.",
      category: "faq",
      keywords: ["gappy ai", "මොකක්ද", "what is", "sinhala", "සිංහල"],
      priority: 10,
      language: "sinhala"
    },
    {
      id: "faq_tamil_what_is_gappy",
      title: "Gappy AI என்றால் என்ன? - What is Gappy AI?",
      content: "Gappy AI என்பது மீன் தொட்டிகள் மற்றும் மீன் பண்ணைகளுக்காக வடிவமைக்கப்பட்ட ஸ்மார்ட் ஆட்டோமேஷன் சிஸ்டம். AI, IoT மற்றும் தரவு பகுப்பாய்வை இணைத்து தொழிலாளர் சக்தியை குறைத்து, பணிகளை தானியங்குபடுத்தி, செயல்திறனை அதிகரிக்கிறது.",
      category: "faq",
      keywords: ["gappy ai", "என்றால் என்ன", "what is", "tamil", "தமிழ்"],
      priority: 10,
      language: "tamil"
    }
  ],

  "fish_care": [
    {
      id: "fish_water_quality",
      title: "Water Quality for Fish",
      content: "Fish need clean, properly filtered water. Key parameters: pH 6.5-7.5, temperature 24-28°C, ammonia 0 ppm, nitrite 0 ppm, nitrate <20 ppm. Change 20-30% water weekly.",
      category: "fish_care",
      keywords: ["water quality", "ph", "temperature", "ammonia", "nitrite", "nitrate", "fish care"],
      priority: 8,
      language: "english"
    },
    {
      id: "fish_feeding",
      title: "Fish Feeding Guidelines",
      content: "Feed fish 1-2 times daily, only what they eat in 2-3 minutes. Overfeeding causes poor water quality. Use high-quality fish food appropriate for species.",
      category: "fish_care",
      keywords: ["feeding", "fish food", "overfeeding", "feeding schedule", "fish nutrition"],
      priority: 8,
      language: "english"
    },
    {
      id: "fish_tank_size",
      title: "Aquarium Size Guidelines",
      content: "General rule: 1 gallon per inch of fish. Small fish (1-2 inches) need 5-10 gallons minimum. Larger fish need 20-50 gallons. Consider swimming space and territory needs.",
      category: "fish_care",
      keywords: ["tank size", "aquarium size", "fish space", "gallon per inch"],
      priority: 7,
      language: "english"
    },
    {
      id: "fish_compatibility",
      title: "Fish Compatibility",
      content: "Research fish compatibility before adding to tank. Consider: water parameters, swimming levels, temperament, adult size. Avoid mixing aggressive and peaceful fish.",
      category: "fish_care",
      keywords: ["fish compatibility", "tank mates", "aggressive fish", "peaceful fish"],
      priority: 7,
      language: "english"
    },
    {
      id: "fish_disease",
      title: "Common Fish Diseases",
      content: "Common issues: Ich (white spots), fin rot (torn fins), swim bladder disease (floating/sinking problems). Quarantine new fish for 2-4 weeks. Maintain good water quality to prevent disease.",
      category: "fish_care",
      keywords: ["fish disease", "ich", "fin rot", "swim bladder", "quarantine", "fish health"],
      priority: 8,
      language: "english"
    },
    {
      id: "fish_water_quality_sinhala",
      title: "මාළු සඳහා ජල ගුණාත්මකභාවය - Water Quality for Fish",
      content: "මාළුවන්ට පිරිත් ජලය සහ නිසි ලෙස පෙරහන් කළ ජලය අවශ්‍යයි. ප්‍රධාන පරාමිතීන්: pH 6.5-7.5, උෂ්ණත්වය 24-28°C, ඇමෝනියා 0 ppm, නයිට්‍රයිට් 0 ppm, නයිට්‍රේට් <20 ppm. සතියකට ජලයෙන් 20-30% වෙනස් කරන්න.",
      category: "fish_care",
      keywords: ["water quality", "ph", "temperature", "ammonia", "nitrite", "nitrate", "fish care", "ජල ගුණාත්මකභාවය"],
      priority: 8,
      language: "sinhala"
    },
    {
      id: "fish_water_quality_tamil",
      title: "மீன்களுக்கான நீர் தரம் - Water Quality for Fish",
      content: "மீன்களுக்கு சுத்தமான, சரியாக வடிகட்டப்பட்ட நீர் தேவை. முக்கிய அளவுருக்கள்: pH 6.5-7.5, வெப்பநிலை 24-28°C, அம்மோனியா 0 ppm, நைட்ரைட் 0 ppm, நைட்ரேட் <20 ppm. வாரத்திற்கு 20-30% நீரை மாற்றவும்.",
      category: "fish_care",
      keywords: ["water quality", "ph", "temperature", "ammonia", "nitrite", "nitrate", "fish care", "நீர் தரம்"],
      priority: 8,
      language: "tamil"
    }
  ],

  "multilingual": [
    {
      id: "lang_english",
      title: "English Language Support",
      content: "Gappy AI provides full support in English for all documentation, customer service, and user interface elements.",
      category: "multilingual",
      keywords: ["english", "language", "support", "documentation", "interface"],
      priority: 9,
      language: "english"
    },
    {
      id: "lang_sinhala",
      title: "Sinhala Language Support - සිංහල භාෂා සහාය",
      content: "Gappy AI සිංහල භාෂාවෙන් සම්පූර්ණ සහාය ලබා දේ. දැනට සිංහල භාෂා අතුරු මුහුණත සංවර්ධනය වෙමින් පවතී.",
      category: "multilingual",
      keywords: ["sinhala", "සිංහල", "language", "support", "interface"],
      priority: 9,
      language: "sinhala"
    },
    {
      id: "lang_tamil",
      title: "Tamil Language Support - தமிழ் மொழி ஆதரவு",
      content: "Gappy AI தமிழில் முழு ஆதரவை வழங்குகிறது. தற்போது தமிழ் இடைமுகம் உருவாக்கம் நடைபெற்று வருகிறது.",
      category: "multilingual",
      keywords: ["tamil", "தமிழ்", "language", "support", "interface"],
      priority: 9,
      language: "tamil"
    }
  ]
};

// Function to search content library based on user input
export function searchContentLibrary(userInput: string, maxResults: number = 3): ContentItem[] {
  const searchTerms = userInput.toLowerCase().split(' ');
  const relevantContent: { item: ContentItem; score: number }[] = [];

  // Search through all content items
  Object.values(contentLibrary).forEach(category => {
    category.forEach(item => {
      let score = item.priority; // Base score from priority

      // Check title match
      if (item.title.toLowerCase().includes(userInput.toLowerCase())) {
        score += 10;
      }

      // Check keyword matches
      item.keywords.forEach(keyword => {
        searchTerms.forEach(term => {
          if (keyword.toLowerCase().includes(term) || term.includes(keyword.toLowerCase())) {
            score += 5;
          }
        });
      });

      // Check content match
      if (item.content.toLowerCase().includes(userInput.toLowerCase())) {
        score += 3;
      }

      // Boost score for language matches (if user specifies language preference)
      if (userInput.toLowerCase().includes('sinhala') || userInput.includes('සිංහල')) {
        if (item.language === 'sinhala') score += 10;
      }
      if (userInput.toLowerCase().includes('tamil') || userInput.includes('தமிழ்')) {
        if (item.language === 'tamil') score += 10;
      }
      if (userInput.toLowerCase().includes('english')) {
        if (item.language === 'english') score += 5;
      }

      if (score > 0) {
        relevantContent.push({ item, score });
      }
    });
  });

  // Sort by score and return top results
  return relevantContent
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(result => result.item);
}

// Function to detect user's language preference
export function detectLanguage(userInput: string): string {
  const input = userInput.toLowerCase();

  // Check for explicit language requests
  if (input.includes('sinhala') || input.includes('සිංහල') || input.includes('singhala')) {
    return 'sinhala';
  }
  if (input.includes('tamil') || input.includes('தமிழ்') || input.includes('tamil')) {
    return 'tamil';
  }

  // Check for Sinhala script
  if (/[\u0D80-\u0DFF]/.test(userInput)) {
    return 'sinhala';
  }

  // Check for Tamil script
  if (/[\u0B80-\u0BFF]/.test(userInput)) {
    return 'tamil';
  }

  // Default to English
  return 'english';
}

// Function to get content in specific language
export function getContentByLanguage(language: string): ContentItem[] {
  const languageContent: ContentItem[] = [];

  Object.values(contentLibrary).forEach(category => {
    category.forEach(item => {
      if (item.language === language || item.language === 'english') {
        languageContent.push(item);
      }
    });
  });

  return languageContent;
}

// Function to get content by category
export function getContentByCategory(category: string): ContentItem[] {
  return contentLibrary[category] || [];
}

// Function to get all available categories
export function getAllCategories(): string[] {
  return Object.keys(contentLibrary);
}

// Function to format content for AI prompt with language support
export function formatContentForAI(contentItems: ContentItem[], preferredLanguage?: string): string {
  if (contentItems.length === 0) return '';

  let formattedContent = '\n\n=== GAPPY AI KNOWLEDGE BASE ===\n';

  contentItems.forEach((item, index) => {
    formattedContent += `\n[${index + 1}] ${item.title}:\n${item.content}\n`;
  });

  formattedContent += '\n=== END KNOWLEDGE BASE ===\n\n';
  formattedContent += 'Use the above Gappy AI knowledge to provide SIMPLE, PRECISE, and DIRECT responses. Be brief and straight to the point. Focus only on essential information. Avoid unnecessary details. For fish and aquarium questions, use both the knowledge base AND general aquarium knowledge.';

  return formattedContent;
}
