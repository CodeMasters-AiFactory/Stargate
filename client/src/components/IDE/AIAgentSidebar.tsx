import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Sparkles,
  Code,
  FileText,
  Bug,
  Zap,
  MessageSquare,
  History,
  Settings,
} from 'lucide-react';

interface AIAgentSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'code' | 'text' | 'suggestion';
}

export function AIAgentSidebar({ isCollapsed = false, onToggle }: AIAgentSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm your AI coding assistant. I can help you with code generation, debugging, explanations, and optimization. What would you like to work on?",
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { icon: Code, label: 'Generate Code', action: 'code' },
    { icon: Bug, label: 'Debug Code', action: 'debug' },
    { icon: FileText, label: 'Explain Code', action: 'explain' },
    { icon: Zap, label: 'Optimize', action: 'optimize' },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want help with: "${inputMessage}". Let me analyze your code and provide assistance...`,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const prompts = {
      code: 'Generate code for my current file',
      debug: 'Help me debug this code',
      explain: 'Explain what this code does',
      optimize: 'Optimize this code for better performance',
    };
    setInputMessage(prompts[action as keyof typeof prompts]);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-slate-900/95 border-r border-slate-700 flex flex-col items-center py-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          <Bot className="h-5 w-5" />
        </Button>
        <Separator className="w-8 bg-slate-700" />
        <Button variant="ghost" size="icon" className="text-slate-400">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400">
          <History className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-900/95 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <span className="font-medium text-slate-200">AI Assistant</span>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              GPT-4o
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-200"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-700">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(action => (
            <Button
              key={action.action}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.action)}
              className="flex items-center gap-2 text-xs bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-300"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">AI Assistant</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">AI Assistant</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your code..."
            className="flex-1 min-h-[80px] bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-400 resize-none"
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>Press Shift+Enter for new line</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Multi-model AI
          </span>
        </div>
      </div>
    </div>
  );
}
