/**
 * Wizard Chat Hook
 * Manages chat messages and input state for AI refinement
 */

import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseWizardChatReturn {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatInput: string;
  setChatInput: (input: string) => void;
  isSendingChat: boolean;
  setIsSendingChat: (sending: boolean) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChat: () => void;
}

/**
 * Custom hook for managing wizard chat state
 */
export function useWizardChat(): UseWizardChatReturn {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Add a message
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setChatMessages(prev => [...prev, { role, content }]);
  };

  // Clear chat
  const clearChat = () => {
    setChatMessages([]);
    setChatInput('');
    setIsSendingChat(false);
  };

  return {
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isSendingChat,
    setIsSendingChat,
    addMessage,
    clearChat,
  };
}

