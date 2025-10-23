// Content Management Utilities
// This file provides functions to manage and update the content library

import { contentLibrary, ContentItem, ContentLibrary, getAllCategories, getContentByCategory } from './contentLibrary';

// Function to add new content to the library
export function addContent(content: Omit<ContentItem, 'id'>): ContentItem {
  const newItem: ContentItem = {
    ...content,
    id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  };

  if (!contentLibrary[content.category]) {
    contentLibrary[content.category] = [];
  }

  contentLibrary[content.category].push(newItem);
  return newItem;
}

// Function to update existing content
export function updateContent(id: string, updates: Partial<ContentItem>): boolean {
  for (const category of Object.keys(contentLibrary)) {
    const itemIndex = contentLibrary[category].findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      contentLibrary[category][itemIndex] = {
        ...contentLibrary[category][itemIndex],
        ...updates
      };
      return true;
    }
  }
  return false;
}

// Function to remove content from the library
export function removeContent(id: string): boolean {
  for (const category of Object.keys(contentLibrary)) {
    const itemIndex = contentLibrary[category].findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      contentLibrary[category].splice(itemIndex, 1);
      return true;
    }
  }
  return false;
}

// Function to get content statistics
export function getContentStats() {
  const categories = getAllCategories();
  let totalItems = 0;

  categories.forEach((category: string) => {
    totalItems += contentLibrary[category].length;
  });

  return {
    totalCategories: categories.length,
    totalItems,
    categories: categories.map((category: string) => ({
      name: category,
      count: contentLibrary[category].length
    }))
  };
}

// Function to export content library (for backup)
export function exportContentLibrary(): ContentLibrary {
  return JSON.parse(JSON.stringify(contentLibrary));
}

// Function to import content library (for restore)
export function importContentLibrary(library: ContentLibrary): void {
  // Clear existing content
  Object.keys(contentLibrary).forEach(category => {
    delete contentLibrary[category];
  });

  // Import new content
  Object.keys(library).forEach(category => {
    contentLibrary[category] = library[category];
  });
}

// Example function to add common Q&A pairs
export function addFAQ(question: string, answer: string, keywords: string[] = []): ContentItem {
  return addContent({
    title: question,
    content: answer,
    category: 'faq',
    keywords: [...keywords, 'faq', 'question', 'answer'],
    priority: 7
  });
}

// Example function to add product information
export function addProductInfo(productName: string, description: string, features: string[]): ContentItem {
  const content = `Product: ${productName}\n\nDescription: ${description}\n\nFeatures:\n${features.map(f => `• ${f}`).join('\n')}`;

  return addContent({
    title: `${productName} Information`,
    content,
    category: 'products',
    keywords: [productName.toLowerCase(), ...features.map(f => f.toLowerCase()), 'product', 'information'],
    priority: 8
  });
}

// Example function to add company information
export function addCompanyInfo(companyName: string, description: string, services: string[]): ContentItem {
  const content = `Company: ${companyName}\n\nAbout: ${description}\n\nServices:\n${services.map(s => `• ${s}`).join('\n')}`;

  return addContent({
    title: `${companyName} Company Information`,
    content,
    category: 'company',
    keywords: [companyName.toLowerCase(), ...services.map(s => s.toLowerCase()), 'company', 'business'],
    priority: 9
  });
}

// Initialize with some sample content (optional)
export function initializeSampleContent(): void {
  // Only add if categories don't exist or are empty
  if (!contentLibrary.faq || contentLibrary.faq.length === 0) {
    addFAQ(
      "How do I reset my password?",
      "To reset your password, go to Settings > Account > Reset Password. Follow the instructions sent to your email.",
      ["password", "reset", "account", "login"]
    );
  }

  if (!contentLibrary.products || contentLibrary.products.length === 0) {
    addProductInfo(
      "AI Assistant Pro",
      "Advanced AI assistant with custom content library integration",
      ["Custom knowledge base", "Context-aware responses", "Real-time search", "Multi-category support"]
    );
  }

  if (!contentLibrary.company || contentLibrary.company.length === 0) {
    addCompanyInfo(
      "TechCorp Solutions",
      "Leading provider of AI-powered solutions for modern businesses",
      ["AI Integration", "Custom Development", "Consulting", "Support"]
    );
  }
}
