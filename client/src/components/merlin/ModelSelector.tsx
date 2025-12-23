/**
 * Model Selector Component
 * Allows users to choose AI model for chat (Haiku/Sonnet/Opus)
 */

import { useState } from 'react';

type ModelType = 'haiku' | 'sonnet' | 'opus';

interface ModelInfo {
  name: string;
  icon: string;
  description: string;
  badge: string;
  credits: number;
  color: string;
}

const MODELS: Record<ModelType, ModelInfo> = {
  haiku: {
    name: 'Haiku',
    icon: '⚡',
    description: 'Fast & efficient',
    badge: 'Budget Friendly',
    credits: 2,
    color: '#10b981', // green
  },
  sonnet: {
    name: 'Sonnet',
    icon: '🧠',
    description: 'Smart & balanced',
    badge: 'Recommended',
    credits: 8,
    color: '#3b82f6', // blue
  },
  opus: {
    name: 'Opus',
    icon: '👑',
    description: 'Most intelligent',
    badge: 'Premium',
    credits: 25,
    color: '#8b5cf6', // purple
  },
};

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  userCredits?: number;
  compact?: boolean;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  userCredits = 999,
  compact = false 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = MODELS[selectedModel];
  const hasEnoughCredits = (model: ModelType) => userCredits >= MODELS[model].credits;

  if (compact) {
    // Compact dropdown version
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{ 
            backgroundColor: `${currentModel.color}15`,
            color: currentModel.color,
            border: `1px solid ${currentModel.color}30`
          }}
        >
          <span>{currentModel.icon}</span>
          <span>{currentModel.name}</span>
          <span className="text-xs opacity-70">({currentModel.credits} cr)</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[200px]">
            {(Object.keys(MODELS) as ModelType[]).map((modelKey) => {
              const model = MODELS[modelKey];
              const canAfford = hasEnoughCredits(modelKey);
              const isSelected = modelKey === selectedModel;

              return (
                <button
                  key={modelKey}
                  onClick={() => {
                    if (canAfford) {
                      onModelChange(modelKey);
                      setIsOpen(false);
                    }
                  }}
                  disabled={!canAfford}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${
                    isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                  } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-xl">{model.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: model.color }}>
                      {model.credits} cr
                    </div>
                    {!canAfford && (
                      <div className="text-xs text-red-500">Low credits</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Full card version
  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.keys(MODELS) as ModelType[]).map((modelKey) => {
        const model = MODELS[modelKey];
        const canAfford = hasEnoughCredits(modelKey);
        const isSelected = modelKey === selectedModel;

        return (
          <button
            key={modelKey}
            onClick={() => canAfford && onModelChange(modelKey)}
            disabled={!canAfford}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              isSelected 
                ? 'border-current shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ 
              borderColor: isSelected ? model.color : undefined,
              backgroundColor: isSelected ? `${model.color}08` : undefined
            }}
          >
            {model.badge === 'Recommended' && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-bold text-white rounded-full bg-blue-500">
                {model.badge}
              </span>
            )}

            <div className="text-3xl mb-2">{model.icon}</div>
            <div className="font-bold text-gray-900">{model.name}</div>
            <div className="text-xs text-gray-500 mb-2">{model.description}</div>
            <div className="text-lg font-bold" style={{ color: model.color }}>
              {model.credits} credits
            </div>
            <div className="text-xs text-gray-400">per message</div>
          </button>
        );
      })}
    </div>
  );
}

export function CreditDisplay({ credits, maxCredits = 300 }: { credits: number; maxCredits?: number }) {
  const percentage = Math.min((credits / maxCredits) * 100, 100);
  const isLow = credits < 50;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Credits</span>
          <span className={isLow ? 'text-red-500 font-bold' : 'text-gray-600'}>
            {credits} / {maxCredits}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              isLow ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {isLow && (
        <button className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-lg transition-all">
          Buy More
        </button>
      )}
    </div>
  );
}

export default ModelSelector;
