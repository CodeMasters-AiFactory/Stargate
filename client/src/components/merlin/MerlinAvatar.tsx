/**
 * MERLIN AVATAR - Live Animated AI Assistant
 * 
 * Features:
 * - 8 expressions (default, thinking, happy, sleeping, listening, surprised, talking, winking)
 * - Idle animations (blinks, subtle movements, breathing)
 * - Voice output (text-to-speech) - HEAR Merlin speak!
 * - Voice input (speech-to-text) - TALK to Merlin with your mic!
 * - State machine for realistic behavior
 * - Auto-sleep after inactivity
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// All Merlin states/expressions
export type MerlinState = 
  | 'default' 
  | 'thinking' 
  | 'happy' 
  | 'sleeping' 
  | 'listening' 
  | 'surprised' 
  | 'talking' 
  | 'winking';

interface MerlinAvatarProps {
  state?: MerlinState;
  message?: string;
  onSpeechInput?: (text: string) => void;
  onStateChange?: (state: MerlinState) => void;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  enableVoice?: boolean;
  enableMicrophone?: boolean;
  autoIdle?: boolean;
  className?: string;
}

// All Merlin expression images
const MERLIN_IMAGES: Record<MerlinState, string> = {
  default: '/images/merlin/merlin-default.jpg',
  thinking: '/images/merlin/merlin-thinking.jpg',
  happy: '/images/merlin/merlin-happy.jpg',
  sleeping: '/images/merlin/merlin-sleeping.jpg',
  listening: '/images/merlin/merlin-listening.jpg',
  surprised: '/images/merlin/merlin-surprised.jpg',
  talking: '/images/merlin/merlin-talking.jpg',
  winking: '/images/merlin/merlin-winking.jpg',
};

// Status messages for each state
const STATE_MESSAGES: Record<MerlinState, string> = {
  default: '',
  thinking: '🤔 Hmm, let me think...',
  happy: '😊 Wonderful!',
  sleeping: '💤 Zzz...',
  listening: '👂 I\'m listening...',
  surprised: '😮 Oh, interesting!',
  talking: '🗣️ ...',
  winking: '😉',
};

// Size classes
const SIZE_CLASSES = {
  small: 'w-12 h-12',
  medium: 'w-20 h-20',
  large: 'w-28 h-28',
  xlarge: 'w-40 h-40',
};

// Voice settings for Merlin
const VOICE_SETTINGS = {
  rate: 0.9,      // Slightly slower for wisdom
  pitch: 0.85,    // Deeper voice
  volume: 1.0,
};

export function MerlinAvatar({
  state = 'default',
  message,
  onSpeechInput,
  onStateChange,
  size = 'large',
  enableVoice = true,
  enableMicrophone = true,
  autoIdle = true,
  className = '',
}: MerlinAvatarProps) {
  const [currentState, setCurrentState] = useState<MerlinState>(state);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isBreathing, setIsBreathing] = useState(true);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    setVoiceSupported('speechSynthesis' in window);
    setMicSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }, []);

  // Update state from props
  useEffect(() => {
    if (state !== currentState) {
      setCurrentState(state);
      onStateChange?.(state);
    }
  }, [state]);

  // Notify parent of state changes
  const updateState = useCallback((newState: MerlinState) => {
    setCurrentState(newState);
    onStateChange?.(newState);
    setIdleSeconds(0);
  }, [onStateChange]);

  // Blink animation (random intervals)
  useEffect(() => {
    if (currentState === 'sleeping') return;
    
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance to blink
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 2500 + Math.random() * 2000); // Random 2.5-4.5 seconds

    return () => clearInterval(blinkInterval);
  }, [currentState]);

  // Auto-idle behavior (sleep after 90 seconds of inactivity)
  useEffect(() => {
    if (!autoIdle) return;
    
    idleTimerRef.current = setInterval(() => {
      setIdleSeconds(prev => {
        const newVal = prev + 1;
        
        // After 90 seconds, go to sleep
        if (newVal > 90 && currentState === 'default') {
          updateState('sleeping');
        }
        
        // Occasional random behaviors while idle
        if (currentState === 'default' && newVal > 10) {
          const rand = Math.random();
          if (rand < 0.02) {
            // 2% chance to wink
            updateState('winking');
            setTimeout(() => updateState('default'), 1500);
          } else if (rand < 0.04) {
            // 2% chance to think
            updateState('thinking');
            setTimeout(() => updateState('default'), 2000);
          }
        }
        
        return newVal;
      });
    }, 1000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [autoIdle, currentState, updateState]);

  // Text-to-speech - HEAR Merlin speak!
  const speak = useCallback((text: string) => {
    if (!enableVoice || !voiceSupported || !text) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = VOICE_SETTINGS.rate;
    utterance.pitch = VOICE_SETTINGS.pitch;
    utterance.volume = VOICE_SETTINGS.volume;
    
    // Find a good voice (prefer British/male)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Daniel') || 
      v.name.includes('David') || 
      v.name.includes('James') ||
      v.name.includes('Google UK English Male') ||
      (v.lang === 'en-GB' && v.name.toLowerCase().includes('male'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      updateState('talking');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      updateState('happy');
      setTimeout(() => updateState('default'), 2000);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      updateState('default');
    };
    
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [enableVoice, voiceSupported, updateState]);

  // Speak message when it changes
  useEffect(() => {
    if (message && enableVoice && voiceSupported) {
      speak(message);
    }
  }, [message, speak, enableVoice, voiceSupported]);

  // Speech recognition - TALK to Merlin!
  const startListening = useCallback(() => {
    if (!enableMicrophone || !micSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      updateState('listening');
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      updateState('surprised');
      setTimeout(() => updateState('thinking'), 500);
      onSpeechInput?.(transcript);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (currentState === 'listening') {
        updateState('default');
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      updateState('default');
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }, [enableMicrophone, micSupported, currentState, updateState, onSpeechInput]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    updateState('default');
  }, [updateState]);

  // Wake up Merlin
  const wakeUp = useCallback(() => {
    if (currentState === 'sleeping') {
      updateState('surprised');
      setTimeout(() => {
        updateState('happy');
        if (enableVoice && voiceSupported) {
          speak("Oh! Hello there! I was just resting my eyes. How can I help you?");
        }
      }, 500);
    }
    setIdleSeconds(0);
  }, [currentState, updateState, enableVoice, voiceSupported, speak]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Avatar Container */}
      <div 
        className={`relative ${SIZE_CLASSES[size]} cursor-pointer group`}
        onClick={wakeUp}
      >
        {/* Outer glow effect */}
        <div 
          className={`absolute inset-[-4px] rounded-full transition-all duration-500 ${
            isSpeaking ? 'bg-blue-400/40 animate-pulse' : 
            isListening ? 'bg-green-400/40 animate-ping' : 
            'bg-purple-500/20 group-hover:bg-purple-400/30'
          }`}
          style={{ filter: 'blur(8px)' }}
        />
        
        {/* Avatar Frame */}
        <div 
          className={`relative ${SIZE_CLASSES[size]} rounded-full overflow-hidden border-3 shadow-2xl transition-all duration-300 ${
            currentState === 'sleeping' ? 'border-gray-400' :
            isSpeaking ? 'border-blue-400' :
            isListening ? 'border-green-400' :
            'border-purple-500/70'
          }`}
          style={{
            transform: isBreathing ? 'scale(1)' : 'scale(0.98)',
            animation: currentState !== 'sleeping' ? 'breathe 4s ease-in-out infinite' : 'none',
          }}
        >
          {/* Main Image */}
          <img
            src={MERLIN_IMAGES[currentState]}
            alt={`Merlin - ${currentState}`}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isBlinking ? 'brightness-90' : ''
            } ${currentState === 'sleeping' ? 'grayscale-[20%] brightness-90' : ''}`}
          />
          
          {/* Blink overlay */}
          {isBlinking && (
            <div className="absolute inset-0 bg-black/15 transition-opacity" />
          )}
          
          {/* Speaking waves */}
          {isSpeaking && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/30 to-transparent animate-pulse" />
              <div className="absolute inset-0 border-4 border-blue-400/50 rounded-full animate-ping opacity-50" />
            </>
          )}
          
          {/* Listening indicator */}
          {isListening && (
            <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-pulse" />
          )}
          
          {/* Sleep overlay */}
          {currentState === 'sleeping' && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-900/30" />
          )}
        </div>
        
        {/* Status dot */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-md ${
          currentState === 'sleeping' ? 'bg-gray-400' :
          isListening ? 'bg-green-500 animate-pulse' :
          isSpeaking ? 'bg-blue-500 animate-pulse' :
          'bg-emerald-500'
        }`} />
      </div>
      
      {/* State message */}
      {STATE_MESSAGES[currentState] && (
        <div className="text-sm text-gray-600 animate-fade-in font-medium">
          {STATE_MESSAGES[currentState]}
        </div>
      )}
      
      {/* Voice controls */}
      <div className="flex items-center gap-2 mt-1">
        {/* Microphone button */}
        {enableMicrophone && micSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            className={`p-2.5 rounded-full transition-all shadow-md ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-red-300' 
                : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-purple-600 hover:shadow-lg'
            } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? 'Stop listening' : 'Talk to Merlin'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93V7h2v1c0 2.76 2.24 5 5 5s5-2.24 5-5V7h2v1c0 4.08-3.06 7.44-7 7.93V19h3v2H9v-2h3v-3.07z"/>
            </svg>
          </button>
        )}
        
        {/* Stop speaking button */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="p-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-600 hover:text-red-500 shadow-md transition-all"
            title="Stop Merlin"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>
        )}
        
        {/* Volume indicator when speaking */}
        {isSpeaking && (
          <div className="flex items-center gap-1">
            <div className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
      
      {/* Browser support warnings */}
      {enableVoice && !voiceSupported && (
        <p className="text-xs text-amber-600">Voice not supported in this browser</p>
      )}
      {enableMicrophone && !micSupported && (
        <p className="text-xs text-amber-600">Microphone not supported</p>
      )}
      
      {/* CSS for breathing animation */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}

// Greeting messages Merlin can use
export const MERLIN_GREETINGS = [
  "Greetings, friend! I'm Merlin, your magical website wizard. What kind of website shall we create today?",
  "Ah, welcome! I've been expecting you. Tell me about your business, and together we'll craft something extraordinary!",
  "Hello there! Ready to create some digital magic? Just tell me about your vision, and I'll make it real!",
  "Welcome to Stargate Portal! I'm Merlin, and I'm here to help you build the perfect website. What's your business about?",
];

// Questions Merlin asks to understand the user
export const MERLIN_QUESTIONS = {
  business: "What's the name of your business, and what do you do?",
  style: "Do you prefer a modern, clean look, or something more traditional and elegant?",
  colors: "Any favorite colors you'd like to see? Or should I suggest something based on your industry?",
  goal: "What's the main goal of your website? Getting customers? Showcasing your work? Selling products?",
  audience: "Who are your ideal customers? Help me understand who we're creating this for.",
};

export default MerlinAvatar;
