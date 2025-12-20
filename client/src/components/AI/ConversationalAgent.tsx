import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Sparkles, Brain, Code, Database, Palette } from 'lucide-react';
import {
  agentInstructions,
  ConversationMessage,
  ConversationContext,
} from './AgentInstructionsSystem';

interface ConversationalAgentProps {
  agentId?: string;
  onProjectCreate?: (projectData: any) => void;
  className?: string;
}

export function ConversationalAgent({
  agentId = 'fullstack-generalist',
  onProjectCreate,
  className = '',
}: ConversationalAgentProps) {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ConversationContext>();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation
    const initialContext = agentInstructions.initializeConversation(sessionId, agentId);
    setContext(initialContext);

    // Add greeting message
    const greeting = agentInstructions.generateGreeting(agentId);
    const greetingMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: 'agent',
      content: greeting,
      timestamp: new Date(),
    };

    setMessages([greetingMessage]);
    agentInstructions.addMessage(sessionId, greetingMessage);
  }, [sessionId, agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const agent = agentInstructions.getAgent(agentId);

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'frontend-specialist':
        return Palette;
      case 'backend-specialist':
        return Database;
      case 'ai-specialist':
        return Brain;
      case 'fullstack-generalist':
        return Code;
      default:
        return Bot;
    }
  };

  const simulateTyping = (callback: () => void, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const processUserMessage = async (userInput: string) => {
    if (!context || !userInput.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    agentInstructions.addMessage(sessionId, userMessage);

    // Analyze user response and update context
    const analysis = agentInstructions.analyzeUserResponse(userInput, context);

    const updatedContext = {
      ...context,
      ...analysis,
      currentPhase: (analysis.phase || context.currentPhase) as
        | 'greeting'
        | 'discovery'
        | 'planning'
        | 'building'
        | 'reviewing',
    };

    agentInstructions.updateConversationContext(sessionId, updatedContext);
    setContext(updatedContext);

    // Generate appropriate response based on current phase
    simulateTyping(() => {
      let agentResponse = '';

      switch (updatedContext.currentPhase) {
        case 'discovery':
          const questions = agentInstructions.generateDiscoveryQuestions(updatedContext, agentId);
          agentResponse = `Great! I can help you build that. Let me ask a few questions to understand your needs better:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
          break;

        case 'planning':
          agentResponse = agentInstructions.generatePlanProposal(updatedContext, agentId);
          break;

        case 'building':
          agentResponse = agentInstructions.generateProgressUpdate(
            updatedContext,
            'project setup',
            'core functionality'
          );
          break;

        default:
          // Default responses for clarification or continuation
          if (
            userInput.toLowerCase().includes('yes') ||
            userInput.toLowerCase().includes('sounds good')
          ) {
            agentResponse =
              "Perfect! Let me start building that for you. I'll create the project structure first and then work through each feature step by step.";

            // Trigger project creation
            if (onProjectCreate && updatedContext.projectType) {
              setTimeout(() => {
                onProjectCreate({
                  type: updatedContext.projectType,
                  preferences: updatedContext.preferences,
                  agentId: agentId,
                });
              }, 2000);
            }
          } else {
            agentResponse =
              "I understand. Could you tell me more about what you'd like to adjust or what questions you have?";
          }
      }

      const agentMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        type: 'agent',
        content: agentResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
      agentInstructions.addMessage(sessionId, agentMessage);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      processUserMessage(input);
      setInput('');
    }
  };

  const handleQuickResponse = (response: string) => {
    processUserMessage(response);
  };

  const AgentIcon = getAgentIcon(agentId);

  return (
    <Card className={`h-full flex flex-col ${className}`} data-testid="conversational-agent">
      <CardHeader className="border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              <AgentIcon className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{agent?.name || 'AI Assistant'}</h3>
            <p className="text-sm text-muted-foreground">{agent?.role}</p>
          </div>
          <div className="ml-auto flex space-x-1">
            {agent?.expertise.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
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
                    ) : (
                      <AgentIcon className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <AgentIcon className="w-4 h-4" />
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

        {/* Quick Response Buttons */}
        {context?.currentPhase === 'planning' && (
          <div className="p-4 border-t bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Quick responses:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickResponse('Yes, that plan sounds perfect!')}
                data-testid="quick-response-yes"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Sounds great!
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickResponse('Can we adjust the plan?')}
                data-testid="quick-response-adjust"
              >
                Adjust plan
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickResponse('I need more details about the approach')}
              >
                More details
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Message ${agent?.name || 'Assistant'}...`}
              className="flex-1"
              data-testid="message-input"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
