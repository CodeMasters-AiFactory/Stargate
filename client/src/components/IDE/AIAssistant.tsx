import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Bot, User, Send, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AIMessage } from '@/types/ide';

export function AIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "I've analyzed your React app. Here are some improvements I can make:",
      timestamp: new Date(),
      suggestions: [
        {
          type: 'improvement',
          text: 'Add loading states for better UX',
          confidence: 0.9,
        },
        {
          type: 'improvement',
          text: 'Implement error boundaries',
          confidence: 0.85,
        },
        {
          type: 'improvement',
          text: 'Add TypeScript for type safety',
          confidence: 0.8,
        },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', {
        message,
        context: { currentFile: 'src/App.jsx' },
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: data => {
      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions?.map((text: string) => ({
          type: 'improvement' as const,
          text,
          confidence: 0.8,
        })),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const applySuggestion = (suggestion: string) => {
    // In a real implementation, this would modify the code
    console.log('Applying suggestion:', suggestion);

    // Show feedback
    const feedback: AIMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Applied suggestion: "${suggestion}". The code has been updated!`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, feedback]);
  };

  return (
    <div className="w-80 bg-card border-l border flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">AI ASSISTANT</h2>
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            title="Clear Chat"
            onClick={handleClearChat}
            data-testid="button-clear-chat"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Agent Active</span>
          <div className="ml-auto">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs px-2 py-1"
              data-testid="model-selector"
            >
              GPT-4
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
            data-testid={`message-${message.id}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'ai'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              {message.type === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className="flex-1">
              <div
                className={`text-sm p-3 rounded-lg ${
                  message.type === 'ai'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {message.content}

                {message.suggestions && (
                  <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <button
                          className="text-left hover:underline"
                          onClick={() => applySuggestion(suggestion.text)}
                          data-testid={`suggestion-${index}`}
                        >
                          {suggestion.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {message.type === 'ai' && message.suggestions && (
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      message.suggestions?.forEach(s => applySuggestion(s.text));
                    }}
                    data-testid="button-apply-all"
                  >
                    Apply All
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1" data-testid="button-thumbs-up">
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    data-testid="button-thumbs-down"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask AI to help with your code..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={chatMutation.isPending}
              data-testid="ai-input"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || chatMutation.isPending}
            title="Send Message"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-3">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setInputMessage('Explain this code')}
            data-testid="quick-explain"
          >
            Explain Code
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setInputMessage('Find and fix bugs')}
            data-testid="quick-fix"
          >
            Fix Bugs
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setInputMessage('Optimize performance')}
            data-testid="quick-optimize"
          >
            Optimize
          </Button>
        </div>
      </div>
    </div>
  );
}
