import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Send,
  User,
  Brain,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  History,
} from 'lucide-react';

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  metadata?: any;
  timestamp: Date;
}

interface AgentMemoryContext {
  sessionId: string;
  userId: string;
  agentId: string;
  conversationContext: any;
  projectContext?: any;
  userPreferences?: any;
  workHistory?: any;
  codebase?: any;
}

interface MemoryAwareAgentProps {
  userId?: string;
  projectId?: string;
  agentId?: string;
  onProjectCreate?: (projectData: any) => void;
  className?: string;
}

export function MemoryAwareAgent({
  userId = 'default-user',
  projectId,
  agentId = 'memory-agent',
  onProjectCreate,
  className = '',
}: MemoryAwareAgentProps) {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecoveringMemory, setIsRecoveringMemory] = useState(false);
  const [memoryContext, setMemoryContext] = useState<AgentMemoryContext | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    initializeMemorySession();
  }, [sessionId, userId, agentId]);

  const initializeMemorySession = async () => {
    setIsRecoveringMemory(true);
    setConnectionStatus('reconnecting');

    try {
      // Simulate memory recovery API call
      const response = await fetch('/api/agent/memory/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          agentId,
          projectId,
        }),
      });

      if (response.ok) {
        const memoryData = await response.json();
        setMemoryContext(memoryData.context);

        // If we have conversation history, restore it
        if (memoryData.conversationHistory?.length > 0) {
          setMessages(memoryData.conversationHistory);

          // Add system message about memory recovery
          const recoveryMessage: ConversationMessage = {
            id: `recovery-${Date.now()}`,
            type: 'system',
            content: `🧠 **Memory Restored** - I remember our previous conversation and your project context. You can continue where we left off.`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, recoveryMessage]);
        } else {
          // Generate context-aware greeting
          const contextSummary = memoryData.contextSummary || '';
          const greeting = generateContextAwareGreeting(contextSummary);

          const greetingMessage: ConversationMessage = {
            id: `greeting-${Date.now()}`,
            type: 'agent',
            content: greeting,
            timestamp: new Date(),
          };
          setMessages([greetingMessage]);
        }

        setConnectionStatus('connected');
      } else {
        throw new Error('Failed to initialize memory session');
      }
    } catch (error) {
      console.error('Memory initialization failed:', error);

      // Fallback to basic greeting
      const fallbackMessage: ConversationMessage = {
        id: `fallback-${Date.now()}`,
        type: 'agent',
        content:
          "Hello! I'm your AI assistant. While I couldn't access our previous conversation history right now, I'm ready to help you with your project. What would you like to work on?",
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
      setConnectionStatus('disconnected');
    } finally {
      setIsRecoveringMemory(false);
    }
  };

  const generateContextAwareGreeting = (contextSummary: string): string => {
    if (contextSummary.includes('Project:')) {
      return `Welcome back! I can see you're working on a project. Based on our previous conversations and your coding patterns, I'm ready to help you continue building. What would you like to work on next?

${contextSummary}

How can I assist you today?`;
    }

    if (contextSummary.includes('Experience Level:')) {
      return `Hello! Based on your profile, I can see your coding preferences and experience level. I'm ready to help you create something amazing. What type of project are you thinking about?

${contextSummary}`;
    }

    return `Hello! I'm your persistent AI assistant. I maintain memory across sessions so I can provide better, more personalized help. What would you like to build today?`;
  };

  const processUserMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Save message to persistent memory
    try {
      await fetch('/api/agent/memory/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    // Process with AI and memory context
    setIsTyping(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userInput,
          memoryContext: memoryContext,
          projectId: projectId,
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();

        const agentMessage: ConversationMessage = {
          id: `agent-${Date.now()}`,
          type: 'agent',
          content: aiResponse.content,
          metadata: aiResponse.metadata,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, agentMessage]);

        // Update memory context if provided
        if (aiResponse.updatedContext) {
          setMemoryContext(aiResponse.updatedContext);
        }

        // Handle project creation if triggered
        if (aiResponse.projectData && onProjectCreate) {
          setTimeout(() => {
            onProjectCreate(aiResponse.projectData);
          }, 1000);
        }
      } else {
        throw new Error('AI response failed');
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);

      const errorMessage: ConversationMessage = {
        id: `error-${Date.now()}`,
        type: 'agent',
        content:
          "I apologize, but I'm having trouble processing your request right now. However, your message has been saved and I'll be able to reference it in our future conversations.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      processUserMessage(input);
    }
  };

  const handleReconnect = () => {
    initializeMemorySession();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'disconnected':
        return 'text-red-500';
      case 'reconnecting':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return CheckCircle;
      case 'disconnected':
        return AlertCircle;
      case 'reconnecting':
        return RefreshCw;
      default:
        return AlertCircle;
    }
  };

  const StatusIcon = getConnectionStatusIcon();

  return (
    <Card className={`h-full flex flex-col ${className}`} data-testid="memory-aware-agent">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                <Brain className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Memory-Aware AI Agent</h3>
              <p className="text-sm text-muted-foreground">Persistent across sessions</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getConnectionStatusColor()}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-xs capitalize">{connectionStatus}</span>
            </div>
            {connectionStatus === 'disconnected' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReconnect}
                data-testid="reconnect-button"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reconnect
              </Button>
            )}
          </div>
        </div>

        {memoryContext && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                <History className="w-3 h-3 mr-1" />
                Session Active
              </Badge>
              {memoryContext.projectContext && (
                <Badge variant="outline" className="text-xs">
                  Project: {memoryContext.projectContext.name}
                </Badge>
              )}
              {memoryContext.userPreferences && (
                <Badge variant="outline" className="text-xs">
                  Personalized
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Memory Recovery Status */}
        {isRecoveringMemory && (
          <Alert className="m-4">
            <Brain className="w-4 h-4" />
            <AlertDescription>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recovering conversation history and context...</span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : message.type === 'system' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : message.type === 'system'
                        ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                        : 'bg-muted'
                  }`}
                >
                  {message.content}
                  {message.metadata?.recovered && (
                    <div className="text-xs text-muted-foreground mt-1">
                      📝 Recovered from previous session
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <Brain className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Connection Status Alert */}
        {connectionStatus === 'disconnected' && (
          <Alert className="m-4 border-orange-200 bg-orange-50 dark:bg-orange-950">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Memory connection is offline. Your messages are still being saved locally, but I may
              not have access to previous conversations.
            </AlertDescription>
          </Alert>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message with persistent memory..."
              className="flex-1"
              disabled={isRecoveringMemory}
              data-testid="memory-message-input"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping || isRecoveringMemory}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>💾 All conversations are automatically saved</span>
            <span>🧠 Context preserved across restarts</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
