/**
 * AI Chatbot Generator Service
 * Generates AI-powered chatbots for websites with FAQ automation and lead qualification
 */

import OpenAI from 'openai';

export interface BusinessInfo {
  name: string;
  industry: string;
  services?: string[];
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ChatbotConfig {
  businessInfo: BusinessInfo;
  faqData?: FAQ[];
  enableLeadQualification?: boolean;
  enableAppointmentScheduling?: boolean;
  welcomeMessage?: string;
  colorScheme?: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export interface GeneratedChatbot {
  html: string;
  javascript: string;
  css: string;
  trainingData: string;
}

/**
 * Create OpenAI client for chatbot
 */
function createOpenAIClient(): OpenAI | null {
  // Try Replit AI Integration keys first (preferred)
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  
  // Fallback to direct OpenAI key
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  // No keys available - will use mock mode
  return null;
}

/**
 * Generate chatbot training data from business info and FAQ
 */
async function generateChatbotTrainingData(
  config: ChatbotConfig
): Promise<string> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    return generateMockTrainingData(config);
  }

  try {
    const faqText = config.faqData
      ? config.faqData.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')
      : '';

    const prompt = `You are a helpful customer service chatbot for ${config.businessInfo.name}, a ${config.businessInfo.industry} business.

${config.businessInfo.services ? `Services offered: ${config.businessInfo.services.join(', ')}` : ''}
${config.businessInfo.contactEmail ? `Contact email: ${config.businessInfo.contactEmail}` : ''}
${config.businessInfo.contactPhone ? `Contact phone: ${config.businessInfo.contactPhone}` : ''}

${faqText ? `\n\nFrequently Asked Questions:\n${faqText}` : ''}

Your role:
- Answer questions about ${config.businessInfo.name} and their services
- Be friendly, professional, and helpful
- If you don't know something, offer to connect them with a human representative
- ${config.enableLeadQualification ? 'Qualify leads by asking about their needs and budget' : ''}
- ${config.enableAppointmentScheduling ? 'Help schedule appointments or consultations' : ''}

Generate a comprehensive training dataset (JSON format) with example conversations that demonstrate:
1. Greeting and introduction
2. Answering common questions
3. Providing information about services
4. Handling inquiries
5. Lead qualification (if enabled)
6. Appointment scheduling (if enabled)
7. Escalation to human support

Output format: JSON array of conversation examples, each with "user" and "assistant" messages.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating chatbot training datasets. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const trainingData = JSON.parse(response.choices[0]?.message?.content || '{}');
    return JSON.stringify(trainingData, null, 2);
  } catch (error) {
    console.error('[Chatbot Generator] Error generating training data:', error);
    return generateMockTrainingData(config);
  }
}

/**
 * Generate mock training data
 */
function generateMockTrainingData(config: ChatbotConfig): string {
  return JSON.stringify({
    conversations: [
      {
        user: 'Hello',
        assistant: `Hello! Welcome to ${config.businessInfo.name}. How can I help you today?`,
      },
      {
        user: 'What services do you offer?',
        assistant: `${config.businessInfo.name} offers ${config.businessInfo.services?.join(', ') || 'professional services'}. Would you like to know more about any specific service?`,
      },
      {
        user: 'How can I contact you?',
        assistant: `You can reach us at ${config.businessInfo.contactEmail || 'our contact page'}. ${config.businessInfo.contactPhone ? `Or call us at ${config.businessInfo.contactPhone}.` : ''} Is there anything specific I can help you with?`,
      },
    ],
  }, null, 2);
}

/**
 * Generate chatbot HTML
 */
function generateChatbotHTML(config: ChatbotConfig): string {
  const primaryColor = config.colorScheme?.primary || '#3B82F6';
  const secondaryColor = config.colorScheme?.secondary || '#10B981';
  const backgroundColor = config.colorScheme?.background || '#ffffff';

  return `
<div id="ai-chatbot-container" class="ai-chatbot-container" style="display: none;">
  <div class="ai-chatbot-window">
    <div class="ai-chatbot-header" style="background: ${primaryColor}; color: white; padding: 1rem; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">${config.businessInfo.name} Assistant</h3>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; opacity: 0.9;">We're here to help</p>
      </div>
      <button id="chatbot-close" class="chatbot-close" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">×</button>
    </div>
    <div class="ai-chatbot-messages" id="chatbot-messages" style="height: 400px; overflow-y: auto; padding: 1.5rem; background: ${backgroundColor}; display: flex; flex-direction: column; gap: 1rem;">
      <div class="chatbot-message chatbot-assistant" style="background: #f3f4f6; padding: 1rem; border-radius: 12px; max-width: 80%; align-self: flex-start;">
        <p style="margin: 0; color: #1f2937;">${config.welcomeMessage || `Hello! I'm the ${config.businessInfo.name} assistant. How can I help you today?`}</p>
      </div>
    </div>
    <div class="ai-chatbot-input" style="padding: 1rem; background: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
      <form id="chatbot-form" style="display: flex; gap: 0.5rem;">
        <input 
          type="text" 
          id="chatbot-input" 
          placeholder="Type your message..." 
          style="flex: 1; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s;"
          onfocus="this.style.borderColor='${primaryColor}'"
          onblur="this.style.borderColor='#e5e7eb'"
        />
        <button 
          type="submit" 
          style="background: ${primaryColor}; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;"
          onmouseover="this.style.background='${secondaryColor}'"
          onmouseout="this.style.background='${primaryColor}'"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</div>
<button 
  id="chatbot-toggle" 
  class="chatbot-toggle"
  style="position: fixed; bottom: 2rem; right: 2rem; width: 60px; height: 60px; border-radius: 50%; background: ${primaryColor}; color: white; border: none; font-size: 1.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center;"
  onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)'"
  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
>
  💬
</button>
  `.trim();
}

/**
 * Generate chatbot JavaScript
 */
function generateChatbotJavaScript(config: ChatbotConfig, trainingData: string): string {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  
  return `
<script>
(function() {
  const chatbotContainer = document.getElementById('ai-chatbot-container');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotMessages = document.getElementById('chatbot-messages');
  
  let isOpen = false;
  
  // Toggle chatbot
  chatbotToggle.addEventListener('click', function() {
    isOpen = !isOpen;
    chatbotContainer.style.display = isOpen ? 'block' : 'none';
    if (isOpen) {
      chatbotInput.focus();
    }
  });
  
  // Close chatbot
  chatbotClose.addEventListener('click', function() {
    isOpen = false;
    chatbotContainer.style.display = 'none';
  });
  
  // Send message
  chatbotForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    chatbotInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addMessage('...', 'assistant', true);
    
    try {
      // Call AI API
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: {
            businessName: '${config.businessInfo.name}',
            industry: '${config.businessInfo.industry}',
            services: ${JSON.stringify(config.businessInfo.services || [])},
            ${config.businessInfo.contactEmail ? `contactEmail: '${config.businessInfo.contactEmail}',` : ''}
            ${config.businessInfo.contactPhone ? `contactPhone: '${config.businessInfo.contactPhone}',` : ''}
          },
          ${config.enableLeadQualification ? 'enableLeadQualification: true,' : ''}
          ${config.enableAppointmentScheduling ? 'enableAppointmentScheduling: true,' : ''}
        }),
      });
      
      const data = await response.json();
      
      // Remove typing indicator
      typingIndicator.remove();
      
      // Add AI response
      addMessage(data.response || 'I apologize, but I encountered an error. Please try again.', 'assistant');
    } catch (error) {
      console.error('Chatbot error:', error);
      typingIndicator.remove();
      addMessage('I apologize, but I encountered an error. Please try again or contact us directly.', 'assistant');
    }
  });
  
  function addMessage(text, sender, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = \`chatbot-message chatbot-\${sender}\`;
    messageDiv.style.cssText = sender === 'user' 
      ? 'background: ${config.colorScheme?.primary || '#3B82F6'}; color: white; padding: 1rem; border-radius: 12px; max-width: 80%; align-self: flex-end;'
      : 'background: #f3f4f6; padding: 1rem; border-radius: 12px; max-width: 80%; align-self: flex-start;';
    
    const p = document.createElement('p');
    p.style.margin = '0';
    p.style.color = sender === 'user' ? 'white' : '#1f2937';
    p.textContent = text;
    messageDiv.appendChild(p);
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    return messageDiv;
  }
})();
</script>
  `.trim();
}

/**
 * Generate chatbot CSS
 */
function generateChatbotCSS(config: ChatbotConfig): string {
  const primaryColor = config.colorScheme?.primary || '#3B82F6';

  return `
<style>
.ai-chatbot-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 400px;
  max-width: calc(100vw - 4rem);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.ai-chatbot-window {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.ai-chatbot-messages {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 ${config.colorScheme?.background || '#ffffff'};
}

.ai-chatbot-messages::-webkit-scrollbar {
  width: 6px;
}

.ai-chatbot-messages::-webkit-scrollbar-track {
  background: ${config.colorScheme?.background || '#ffffff'};
}

.ai-chatbot-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.ai-chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.chatbot-message {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .ai-chatbot-container {
    width: calc(100vw - 2rem);
    right: 1rem;
    bottom: 1rem;
  }
  
  .chatbot-toggle {
    right: 1rem !important;
    bottom: 1rem !important;
  }
}
</style>
  `.trim();
}

/**
 * Generate complete AI chatbot
 */
export async function generateAIChatbot(
  config: ChatbotConfig
): Promise<GeneratedChatbot> {
  console.log(`[Chatbot Generator] Generating chatbot for ${config.businessInfo.name}`);

  // Generate training data
  const trainingData = await generateChatbotTrainingData(config);

  // Generate HTML, JavaScript, and CSS
  const html = generateChatbotHTML(config);
  const javascript = generateChatbotJavaScript(config, trainingData);
  const css = generateChatbotCSS(config);

  return {
    html,
    javascript,
    css,
    trainingData,
  };
}

