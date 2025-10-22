# Custom Content Library System

## Overview
The Custom Content Library System allows you to provide your AI assistant with specific knowledge, FAQs, product information, and contextual data that it can reference when responding to users.

## How It Works

### 1. Content Structure
Content is organized into categories with searchable keywords and priority levels:

```typescript
interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  priority: number;
}
```

### 2. Automatic Content Discovery
When a user asks a question, the system:
- Searches through all content items
- Matches keywords and content relevance
- Selects the top 3 most relevant items
- Includes them as context in the AI prompt

### 3. AI Integration
The AI receives both system instructions and relevant context, allowing it to provide informed responses based on your custom content.

## Files Created

### 📁 `/app/services/contentLibrary.ts`
- **Core content library** with sample data
- **Search functions** to find relevant content
- **Content formatting** for AI prompts

### 📁 `/app/services/contentManager.ts`
- **Add new content** with `addContent()`
- **Update existing content** with `updateContent()`
- **Remove content** with `removeContent()`
- **Utility functions** for FAQs, products, company info

### 📁 `/app/config/contentConfig.ts`
- **Configuration examples** for different content types
- **Customization options** and settings
- **Sample content templates**

## How to Add Custom Content

### Method 1: Using Content Manager Functions

```typescript
import { addFAQ, addProductInfo, addCompanyInfo } from '../services/contentManager';

// Add FAQ
addFAQ(
  "What are your business hours?",
  "Monday to Friday, 9 AM to 6 PM EST",
  ["hours", "schedule", "time"]
);

// Add Product Information
addProductInfo(
  "Premium Plan",
  "Advanced features with priority support",
  ["Unlimited queries", "Priority support", "Analytics"]
);

// Add Company Information
addCompanyInfo(
  "Your Company",
  "We provide AI solutions for businesses",
  ["AI Integration", "Consulting", "Support"]
);
```

### Method 2: Direct Content Addition

```typescript
import { addContent } from '../services/contentManager';

addContent({
  title: "API Documentation",
  content: "Our API supports REST endpoints with JSON responses...",
  category: "technical",
  keywords: ["api", "documentation", "technical", "rest"],
  priority: 8
});
```

### Method 3: Using Configuration File

Edit `/app/config/contentConfig.ts` and uncomment the examples:

```typescript
// Add your custom content here
addFAQ(
  "How do I reset my password?",
  "Go to Settings > Account > Reset Password",
  ["password", "reset", "account"]
);
```

## Content Categories

### Available Categories:
- **general**: Welcome messages and basic information
- **technical**: API docs, technical specifications
- **troubleshooting**: Common issues and solutions
- **features**: Product features and capabilities
- **faq**: Frequently asked questions
- **products**: Product information and pricing
- **company**: Company details and services

### Adding New Categories:
```typescript
addContent({
  title: "Custom Category Example",
  content: "Your custom content here",
  category: "your_category_name", // New category
  keywords: ["custom", "example"],
  priority: 7
});
```

## Search and Matching

The system searches content using:
1. **Keyword matching**: Matches words in user input with content keywords
2. **Title matching**: Checks if user input appears in content titles
3. **Content matching**: Searches within the actual content text
4. **Priority scoring**: Higher priority items rank higher

## Best Practices

### 1. Use Clear Keywords
```typescript
keywords: ["refund", "policy", "return", "money back"]
```

### 2. Set Appropriate Priority
- **Priority 10**: Critical information (welcome, legal)
- **Priority 7-8**: Important content (products, FAQs)
- **Priority 5-6**: Supporting information (features, general)

### 3. Keep Content Concise
The AI will include the full content in its prompt, so keep it focused and relevant.

### 4. Use Natural Language
Write content as if speaking to a user, not as technical documentation.

## Testing Your Content

### 1. Ask Relevant Questions
Test with questions that should trigger your custom content:
```
"What are your business hours?"
"How do I reset my password?"
"Tell me about your premium plan"
```

### 2. Check Console Logs
The system logs how many relevant content items were found:
```
Relevant content found: 2 items
```

### 3. Verify AI Responses
Ensure the AI is using your custom content naturally in responses.

## Example Usage

```typescript
// Add comprehensive company information
addCompanyInfo(
  "Acme Corp",
  "Leading provider of business solutions with over 10 years of experience",
  ["Business Automation", "AI Solutions", "Consulting", "24/7 Support"]
);

// Add product pricing
addProductInfo(
  "Enterprise Plan",
  "Complete solution for large organizations",
  ["Unlimited users", "Advanced analytics", "Custom integration", "Dedicated support"]
);

// Add troubleshooting guide
addContent({
  title: "Login Issues",
  content: "If you can't log in: 1) Check your email address, 2) Reset password, 3) Clear browser cache, 4) Contact support",
  category: "troubleshooting",
  keywords: ["login", "signin", "authentication", "access"],
  priority: 9
});
```

## Next Steps

1. **Customize the content** in `/app/config/contentConfig.ts`
2. **Add your specific knowledge** using the content manager functions
3. **Test with real questions** to ensure content is being used
4. **Monitor the logs** to see which content is being matched
5. **Refine keywords and priority** based on what works best

The system will automatically include relevant content in AI responses, making your assistant more knowledgeable and helpful!
