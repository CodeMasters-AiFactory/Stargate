/**
 * Model Selector Component (USD)
 * Shows all 7 Anthropic models for users to choose
 */

import { useState } from 'react';

export type ModelType = 'haiku-3' | 'haiku-3.5' | 'haiku-4.5' | 'sonnet-4' | 'sonnet-4.5' | 'opus-4.5' | 'opus-4.1';

interface ModelInfo {
  name: string;
  icon: string;
  description: string;
  badge: string;
  credits: number;
  color: string;
  recommended?: boolean;
}

const MODELS: Record<ModelType, ModelInfo> = {
  'haiku-3': {
    name: 'Haiku 3',
    icon: '🌱',
    description: 'Fastest & cheapest',
    badge: 'Budget',
    credits: 1,
    color: '#22c55e',
  },
  'haiku-3.5': {
    name: 'Haiku 3.5',
    icon: '⚡',
    description: 'Fast & efficient',
    badge: 'Efficient',
    credits: 2,
    color: '#10b981',
  },
  'haiku-4.5': {
    name: 'Haiku 4.5',
    icon: '🚀',
    description: 'Near-frontier speed',
    badge: 'Fast',
    credits: 3,
    color: '#14b8a6',
  },
  'sonnet-4': {
    name: 'Sonnet 4',
    icon: '🧠',
    description: 'Smart & reliable',
    badge: 'Balanced',
    credits: 8,
    color: '#3b82f6',
  },
  'sonnet-4.5': {
    name: 'Sonnet 4.5',
    icon: '✨',
    description: 'Best for websites',
    badge: '⭐ Recommended',
    credits: 8,
    color: '#6366f1',
    recommended: true,
  },
  'opus-4.5': {
    name: 'Opus 4.5',
    icon: '👑',
    description: 'Most intelligent',
    badge: 'Premium',
    credits: 15,
    color: '#8b5cf6',
  },
  'opus-4.1': {
    name: 'Opus 4.1',
    icon: '🔮',
    description: 'Ultimate reasoning',
    badge: 'Ultimate',
    credits: 40,
    color: '#a855f7',
  },
};

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  userCredits?: number;
  allowedModels?: ModelType[];
  compact?: boolean;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  userCredits = 999,
  allowedModels,
  compact = false 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = MODELS[selectedModel];
  const hasEnoughCredits = (model: ModelType) => userCredits >= MODELS[model].credits;
  const isAllowed = (model: ModelType) => !allowedModels || allowedModels.includes(model);

  // Get available models
  const availableModels = (Object.keys(MODELS) as ModelType[]).filter(m => isAllowed(m));

  if (compact) {
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
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[220px]">
              {availableModels.map((modelKey) => {
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
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {model.name}
                        {model.recommended && (
                          <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                            Best
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: model.color }}>
                        {model.credits} cr
                      </div>
                      {!canAfford && (
                        <div className="text-xs text-red-500">Low</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full grid version
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {availableModels.map((modelKey) => {
        const model = MODELS[modelKey];
        const canAfford = hasEnoughCredits(modelKey);
        const isSelected = modelKey === selectedModel;

        return (
          <button
            key={modelKey}
            onClick={() => canAfford && onModelChange(modelKey)}
            disabled={!canAfford}
            className={`relative p-3 rounded-xl border-2 transition-all ${
              isSelected 
                ? 'shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ 
              borderColor: isSelected ? model.color : undefined,
              backgroundColor: isSelected ? `${model.color}10` : undefined
            }}
          >
            {model.recommended && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold text-white rounded-full bg-purple-500 whitespace-nowrap">
                Recommended
              </span>
            )}

            <div className="text-2xl mb-1">{model.icon}</div>
            <div className="font-bold text-gray-900 text-sm">{model.name}</div>
            <div className="text-xs text-gray-500 mb-1">{model.description}</div>
            <div className="text-sm font-bold" style={{ color: model.color }}>
              {model.credits} cr
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Credit display component
export function CreditDisplay({ 
  credits, 
  maxCredits = 300,
  onBuyMore 
}: { 
  credits: number; 
  maxCredits?: number;
  onBuyMore?: () => void;
}) {
  const percentage = Math.min((credits / maxCredits) * 100, 100);
  const isLow = credits < 50;
  const isCritical = credits < 20;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700 flex items-center gap-1">
            💎 Credits
          </span>
          <span className={`font-bold ${
            isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-gray-600'
          }`}>
            {credits} / {maxCredits}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              isCritical ? 'bg-red-500' : 
              isLow ? 'bg-amber-500' : 
              'bg-gradient-to-r from-purple-500 to-indigo-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {isLow && onBuyMore && (
        <button 
          onClick={onBuyMore}
          className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-lg transition-all hover:scale-105"
        >
          Buy More
        </button>
      )}
    </div>
  );
}

export default ModelSelector;
