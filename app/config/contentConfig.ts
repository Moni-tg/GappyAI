// Content Library Configuration
// This file shows examples of how to customize your content library

import { addFAQ, addProductInfo, addCompanyInfo, initializeSampleContent, addContent } from '../services/contentManager';

// Initialize sample content (uncomment to enable)
initializeSampleContent();

// Example: Add custom FAQs
addFAQ(
  "What are your business hours?",
  "Our business hours are Monday to Friday, 9 AM to 6 PM EST. We are closed on weekends and public holidays.",
  ["hours", "business", "schedule", "time"]
);

addFAQ(
  "How do I contact customer support?",
  "You can reach our customer support through: 1) Live chat on our website, 2) Email at support@yourcompany.com, 3) Phone at 1-800-SUPPORT",
  ["contact", "support", "customer service", "help"]
);

addFAQ(
  "How do I reset my password?",
  "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password', 3) Enter your email address, 4) Follow the instructions in the email.",
  ["password", "reset", "forgot", "login", "account"]
);

// Example: Add product information
addProductInfo(
  "Premium Plan",
  "Our most popular plan with advanced features and priority support",
  ["Unlimited AI queries", "Priority support", "Advanced analytics", "Custom integrations", "24/7 availability"]
);

addProductInfo(
  "Basic Plan",
  "Perfect for getting started with AI assistance",
  ["100 AI queries per month", "Email support", "Basic analytics", "Standard response time"]
);

// Example: Add company information
addCompanyInfo(
  "Your Company Name",
  "We are a leading provider of AI-powered solutions that help businesses automate and optimize their operations.",
  ["AI Integration", "Business Automation", "Data Analytics", "Customer Support", "Consulting Services"]
);

// Example: Add technical documentation
addContent({
  title: "API Rate Limits",
  content: "Our API has the following rate limits: 100 requests per minute for free tier, 1000 requests per minute for premium tier. Rate limits reset every 60 seconds.",
  category: "technical",
  keywords: ["api", "rate limit", "requests", "limits", "technical"],
  priority: 8
});

addContent({
  title: "Data Privacy Policy",
  content: "We take privacy seriously. All data is encrypted in transit and at rest. We never share personal information with third parties without explicit consent.",
  category: "legal",
  keywords: ["privacy", "data", "security", "policy", "legal"],
  priority: 9
});

// Example: Add troubleshooting guides
addContent({
  title: "App Crashes Frequently",
  content: "If the app crashes frequently: 1) Update to the latest version, 2) Clear app cache in settings, 3) Restart your device, 4) Contact support if issues persist.",
  category: "troubleshooting",
  keywords: ["crash", "error", "app", "freeze", "problem"],
  priority: 8
});

addContent({
  title: "Slow Response Times",
  content: "If responses are slow: 1) Check your internet connection, 2) Try refreshing the app, 3) Clear app cache, 4) Contact support for premium users.",
  category: "troubleshooting",
  keywords: ["slow", "lag", "response time", "performance"],
  priority: 7
});

// Example: Add feature explanations
addContent({
  title: "Custom Content Library",
  content: "The custom content library allows you to provide specific knowledge and context to the AI assistant. You can add FAQs, product information, company details, and more.",
  category: "features",
  keywords: ["content", "library", "knowledge", "custom", "features"],
  priority: 7
});

addContent({
  title: "AI Response Quality",
  content: "Our AI responses are powered by Google's Gemini model with custom context integration. The system searches your content library to provide relevant and accurate information.",
  category: "features",
  keywords: ["ai", "gemini", "response", "quality", "accuracy"],
  priority: 8
});

// Example: Add custom FAQs
/*
addFAQ(
  "What are your business hours?",
  "Our business hours are Monday to Friday, 9 AM to 6 PM EST. We are closed on weekends and public holidays.",
  ["hours", "business", "schedule", "time"]
);

addFAQ(
  "How do I contact customer support?",
  "You can reach our customer support through: 1) Live chat on our website, 2) Email at support@yourcompany.com, 3) Phone at 1-800-SUPPORT",
  ["contact", "support", "customer service", "help"]
);
*/

// Example: Add product information
/*
addProductInfo(
  "Premium Plan",
  "Our most popular plan with advanced features and priority support",
  ["Unlimited AI queries", "Priority support", "Advanced analytics", "Custom integrations", "24/7 availability"]
);

addProductInfo(
  "Basic Plan",
  "Perfect for getting started with AI assistance",
  ["100 AI queries per month", "Email support", "Basic analytics", "Standard response time"]
);
*/

// Example: Add company information
/*
addCompanyInfo(
  "Your Company Name",
  "We are a leading provider of AI-powered solutions that help businesses automate and optimize their operations.",
  ["AI Integration", "Business Automation", "Data Analytics", "Customer Support", "Consulting Services"]
);
*/

// Example: Add technical documentation
/*
addContent({
  title: "API Rate Limits",
  content: "Our API has the following rate limits: 100 requests per minute for free tier, 1000 requests per minute for premium tier. Rate limits reset every 60 seconds.",
  category: "technical",
  keywords: ["api", "rate limit", "requests", "limits", "technical"],
  priority: 8
});

addContent({
  title: "Data Privacy Policy",
  content: "We take privacy seriously. All data is encrypted in transit and at rest. We never share personal information with third parties without explicit consent.",
  category: "legal",
  keywords: ["privacy", "data", "security", "policy", "legal"],
  priority: 9
});
*/

// Example: Add troubleshooting guides
/*
addContent({
  title: "App Crashes Frequently",
  content: "If the app crashes frequently: 1) Update to the latest version, 2) Clear app cache in settings, 3) Restart your device, 4) Contact support if issues persist.",
  category: "troubleshooting",
  keywords: ["crash", "error", "app", "freeze", "problem"],
  priority: 8
});
*/

// Example: Add feature explanations
/*
addContent({
  title: "Custom Content Library",
  content: "The custom content library allows you to provide specific knowledge and context to the AI assistant. You can add FAQs, product information, company details, and more.",
  category: "features",
  keywords: ["content", "library", "knowledge", "custom", "features"],
  priority: 7
});
*/

// Export configuration for easy customization
export const contentConfig = {
  // Maximum number of content items to include in AI responses
  maxContextItems: 3,

  // Enable content search logging
  enableLogging: true,

  // Categories that should have higher priority
  priorityCategories: ['troubleshooting', 'legal', 'company'],

  // Keywords that trigger specific content types
  triggerKeywords: {
    help: ['general'],
    pricing: ['products'],
    company: ['company'],
    technical: ['technical'],
    error: ['troubleshooting']
  }
};
