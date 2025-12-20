/**
 * GSAP Animation Panel
 * Visual controls for adding GSAP animations to website elements
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Play, Pause, RotateCcw, Zap, Move, Scale, RotateCw,
  Eye, EyeOff, Clock, ArrowRight, ArrowDown, ArrowUp,
  Sparkles, Wand2, Copy, Trash2, Plus, ChevronDown
} from 'lucide-react';

// ==============================================
// ANIMATION TYPES
// ==============================================

export interface GSAPAnimation {
  id: string;
  name: string;
  type: AnimationType;
  trigger: AnimationTrigger;
  properties: AnimationProperties;
  timing: AnimationTiming;
  enabled: boolean;
}

export type AnimationType = 
  | 'fadeIn' | 'fadeOut' 
  | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight'
  | 'scaleIn' | 'scaleOut'
  | 'rotateIn' | 'rotateOut'
  | 'bounceIn' | 'bounceOut'
  | 'flipX' | 'flipY'
  | 'custom';

export type AnimationTrigger = 
  | 'onLoad' | 'onScroll' | 'onHover' | 'onClick' | 'onView';

export interface AnimationProperties {
  opacity?: { from: number; to: number };
  x?: { from: number; to: number };
  y?: { from: number; to: number };
  scale?: { from: number; to: number };
  rotation?: { from: number; to: number };
  skewX?: { from: number; to: number };
  skewY?: { from: number; to: number };
}

export interface AnimationTiming {
  duration: number;
  delay: number;
  ease: EasingType;
  stagger?: number;
  repeat?: number;
  yoyo?: boolean;
}

export type EasingType = 
  | 'none' | 'power1.out' | 'power1.in' | 'power1.inOut'
  | 'power2.out' | 'power2.in' | 'power2.inOut'
  | 'power3.out' | 'power3.in' | 'power3.inOut'
  | 'power4.out' | 'power4.in' | 'power4.inOut'
  | 'back.out' | 'back.in' | 'back.inOut'
  | 'elastic.out' | 'elastic.in' | 'elastic.inOut'
  | 'bounce.out' | 'bounce.in' | 'bounce.inOut'
  | 'circ.out' | 'circ.in' | 'circ.inOut'
  | 'expo.out' | 'expo.in' | 'expo.inOut';

// ==============================================
// PRESET ANIMATIONS
// ==============================================

const ANIMATION_PRESETS: Record<AnimationType, Partial<GSAPAnimation>> = {
  fadeIn: {
    name: 'Fade In',
    properties: { opacity: { from: 0, to: 1 } },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  fadeOut: {
    name: 'Fade Out',
    properties: { opacity: { from: 1, to: 0 } },
    timing: { duration: 0.4, delay: 0, ease: 'power2.in' },
  },
  slideUp: {
    name: 'Slide Up',
    properties: { 
      opacity: { from: 0, to: 1 },
      y: { from: 50, to: 0 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  slideDown: {
    name: 'Slide Down',
    properties: { 
      opacity: { from: 0, to: 1 },
      y: { from: -50, to: 0 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  slideLeft: {
    name: 'Slide Left',
    properties: { 
      opacity: { from: 0, to: 1 },
      x: { from: 50, to: 0 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  slideRight: {
    name: 'Slide Right',
    properties: { 
      opacity: { from: 0, to: 1 },
      x: { from: -50, to: 0 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  scaleIn: {
    name: 'Scale In',
    properties: { 
      opacity: { from: 0, to: 1 },
      scale: { from: 0.8, to: 1 },
    },
    timing: { duration: 0.5, delay: 0, ease: 'back.out' },
  },
  scaleOut: {
    name: 'Scale Out',
    properties: { 
      opacity: { from: 1, to: 0 },
      scale: { from: 1, to: 0.8 },
    },
    timing: { duration: 0.4, delay: 0, ease: 'power2.in' },
  },
  rotateIn: {
    name: 'Rotate In',
    properties: { 
      opacity: { from: 0, to: 1 },
      rotation: { from: -15, to: 0 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  rotateOut: {
    name: 'Rotate Out',
    properties: { 
      opacity: { from: 1, to: 0 },
      rotation: { from: 0, to: 15 },
    },
    timing: { duration: 0.4, delay: 0, ease: 'power2.in' },
  },
  bounceIn: {
    name: 'Bounce In',
    properties: { 
      opacity: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1 },
    },
    timing: { duration: 0.8, delay: 0, ease: 'bounce.out' },
  },
  bounceOut: {
    name: 'Bounce Out',
    properties: { 
      opacity: { from: 1, to: 0 },
      scale: { from: 1, to: 0.5 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'back.in' },
  },
  flipX: {
    name: 'Flip X',
    properties: { 
      opacity: { from: 0, to: 1 },
      rotation: { from: 90, to: 0 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  flipY: {
    name: 'Flip Y',
    properties: { 
      opacity: { from: 0, to: 1 },
      rotation: { from: 90, to: 0 },
    },
    timing: { duration: 0.6, delay: 0, ease: 'power2.out' },
  },
  custom: {
    name: 'Custom',
    properties: {},
    timing: { duration: 0.5, delay: 0, ease: 'power2.out' },
  },
};

const EASING_OPTIONS: { value: EasingType; label: string; category: string }[] = [
  { value: 'none', label: 'Linear', category: 'Basic' },
  { value: 'power1.out', label: 'Power1 Out', category: 'Power' },
  { value: 'power1.in', label: 'Power1 In', category: 'Power' },
  { value: 'power1.inOut', label: 'Power1 InOut', category: 'Power' },
  { value: 'power2.out', label: 'Power2 Out (Default)', category: 'Power' },
  { value: 'power2.in', label: 'Power2 In', category: 'Power' },
  { value: 'power2.inOut', label: 'Power2 InOut', category: 'Power' },
  { value: 'power3.out', label: 'Power3 Out', category: 'Power' },
  { value: 'power3.in', label: 'Power3 In', category: 'Power' },
  { value: 'power3.inOut', label: 'Power3 InOut', category: 'Power' },
  { value: 'back.out', label: 'Back Out (Overshoot)', category: 'Special' },
  { value: 'back.in', label: 'Back In', category: 'Special' },
  { value: 'back.inOut', label: 'Back InOut', category: 'Special' },
  { value: 'elastic.out', label: 'Elastic Out', category: 'Special' },
  { value: 'elastic.in', label: 'Elastic In', category: 'Special' },
  { value: 'elastic.inOut', label: 'Elastic InOut', category: 'Special' },
  { value: 'bounce.out', label: 'Bounce Out', category: 'Special' },
  { value: 'bounce.in', label: 'Bounce In', category: 'Special' },
  { value: 'bounce.inOut', label: 'Bounce InOut', category: 'Special' },
  { value: 'circ.out', label: 'Circular Out', category: 'Circular' },
  { value: 'circ.in', label: 'Circular In', category: 'Circular' },
  { value: 'circ.inOut', label: 'Circular InOut', category: 'Circular' },
  { value: 'expo.out', label: 'Expo Out', category: 'Exponential' },
  { value: 'expo.in', label: 'Expo In', category: 'Exponential' },
  { value: 'expo.inOut', label: 'Expo InOut', category: 'Exponential' },
];

// ==============================================
// COMPONENT
// ==============================================

interface GSAPAnimationPanelProps {
  selectedElementId?: string;
  animations: GSAPAnimation[];
  onAnimationsChange: (animations: GSAPAnimation[]) => void;
  onPreview?: (animation: GSAPAnimation) => void;
}

export function GSAPAnimationPanel({
  selectedElementId,
  animations,
  onAnimationsChange,
  onPreview,
}: GSAPAnimationPanelProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'timeline'>('presets');
  const [selectedAnimationId, setSelectedAnimationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedAnimation = animations.find(a => a.id === selectedAnimationId);

  const addAnimation = useCallback((type: AnimationType) => {
    const preset = ANIMATION_PRESETS[type];
    const newAnimation: GSAPAnimation = {
      id: `anim-${Date.now()}`,
      name: preset.name || 'New Animation',
      type,
      trigger: 'onView',
      properties: preset.properties || {},
      timing: preset.timing || { duration: 0.5, delay: 0, ease: 'power2.out' },
      enabled: true,
    };
    onAnimationsChange([...animations, newAnimation]);
    setSelectedAnimationId(newAnimation.id);
  }, [animations, onAnimationsChange]);

  const updateAnimation = useCallback((id: string, updates: Partial<GSAPAnimation>) => {
    onAnimationsChange(
      animations.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  }, [animations, onAnimationsChange]);

  const deleteAnimation = useCallback((id: string) => {
    onAnimationsChange(animations.filter(a => a.id !== id));
    if (selectedAnimationId === id) {
      setSelectedAnimationId(null);
    }
  }, [animations, onAnimationsChange, selectedAnimationId]);

  const duplicateAnimation = useCallback((id: string) => {
    const animation = animations.find(a => a.id === id);
    if (animation) {
      const duplicate: GSAPAnimation = {
        ...animation,
        id: `anim-${Date.now()}`,
        name: `${animation.name} (Copy)`,
      };
      onAnimationsChange([...animations, duplicate]);
    }
  }, [animations, onAnimationsChange]);

  const handlePreview = useCallback(() => {
    if (selectedAnimation && onPreview) {
      setIsPlaying(true);
      onPreview(selectedAnimation);
      setTimeout(() => setIsPlaying(false), selectedAnimation.timing.duration * 1000 + 100);
    }
  }, [selectedAnimation, onPreview]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sm">GSAP Animations</h3>
          </div>
          {selectedElementId && (
            <Badge variant="outline" className="text-xs">
              Element: {selectedElementId.slice(0, 8)}...
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-2 mb-0">
          <TabsTrigger value="presets" className="text-xs">
            <Wand2 className="w-3 h-3 mr-1" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Custom
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets" className="flex-1 overflow-auto m-0 p-2">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ANIMATION_PRESETS).map(([type, preset]) => (
                <Card 
                  key={type}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => addAnimation(type as AnimationType)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {type.includes('fade') && <Eye className="w-4 h-4 text-blue-500" />}
                      {type.includes('slide') && <Move className="w-4 h-4 text-green-500" />}
                      {type.includes('scale') && <Scale className="w-4 h-4 text-purple-500" />}
                      {type.includes('rotate') && <RotateCw className="w-4 h-4 text-orange-500" />}
                      {type.includes('bounce') && <Zap className="w-4 h-4 text-yellow-500" />}
                      {type.includes('flip') && <RotateCw className="w-4 h-4 text-pink-500" />}
                      {type === 'custom' && <Sparkles className="w-4 h-4 text-gray-500" />}
                      <span className="text-xs font-medium">{preset.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Custom Tab */}
        <TabsContent value="custom" className="flex-1 overflow-auto m-0 p-2">
          <ScrollArea className="h-full">
            {selectedAnimation ? (
              <div className="space-y-4">
                {/* Animation Name */}
                <div>
                  <Label className="text-xs">Animation Name</Label>
                  <Input
                    value={selectedAnimation.name}
                    onChange={(e) => updateAnimation(selectedAnimation.id, { name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                {/* Trigger */}
                <div>
                  <Label className="text-xs">Trigger</Label>
                  <select
                    value={selectedAnimation.trigger}
                    onChange={(e) => updateAnimation(selectedAnimation.id, { trigger: e.target.value as AnimationTrigger })}
                    className="w-full h-8 text-sm border rounded px-2"
                  >
                    <option value="onLoad">On Page Load</option>
                    <option value="onScroll">On Scroll</option>
                    <option value="onView">On View (Scroll Trigger)</option>
                    <option value="onHover">On Hover</option>
                    <option value="onClick">On Click</option>
                  </select>
                </div>

                {/* Timing */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium">Timing</h4>
                  
                  <div>
                    <div className="flex justify-between">
                      <Label className="text-xs">Duration</Label>
                      <span className="text-xs text-muted-foreground">{selectedAnimation.timing.duration}s</span>
                    </div>
                    <Slider
                      value={[selectedAnimation.timing.duration * 10]}
                      onValueChange={([v]) => updateAnimation(selectedAnimation.id, {
                        timing: { ...selectedAnimation.timing, duration: v / 10 },
                      })}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <Label className="text-xs">Delay</Label>
                      <span className="text-xs text-muted-foreground">{selectedAnimation.timing.delay}s</span>
                    </div>
                    <Slider
                      value={[selectedAnimation.timing.delay * 10]}
                      onValueChange={([v]) => updateAnimation(selectedAnimation.id, {
                        timing: { ...selectedAnimation.timing, delay: v / 10 },
                      })}
                      min={0}
                      max={20}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Easing</Label>
                    <select
                      value={selectedAnimation.timing.ease}
                      onChange={(e) => updateAnimation(selectedAnimation.id, {
                        timing: { ...selectedAnimation.timing, ease: e.target.value as EasingType },
                      })}
                      className="w-full h-8 text-sm border rounded px-2"
                    >
                      {EASING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedAnimation.timing.yoyo}
                        onCheckedChange={(checked) => updateAnimation(selectedAnimation.id, {
                          timing: { ...selectedAnimation.timing, yoyo: checked },
                        })}
                      />
                      <Label className="text-xs">Yoyo</Label>
                    </div>
                    
                    <div className="flex-1">
                      <Label className="text-xs">Repeat</Label>
                      <Input
                        type="number"
                        value={selectedAnimation.timing.repeat || 0}
                        onChange={(e) => updateAnimation(selectedAnimation.id, {
                          timing: { ...selectedAnimation.timing, repeat: parseInt(e.target.value) || 0 },
                        })}
                        className="h-7 text-xs"
                        min={0}
                        max={-1}
                      />
                    </div>
                  </div>
                </div>

                {/* Properties */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium">Properties</h4>
                  
                  {/* Opacity */}
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Opacity
                      </Label>
                      <Switch
                        checked={!!selectedAnimation.properties.opacity}
                        onCheckedChange={(checked) => {
                          const props = { ...selectedAnimation.properties };
                          if (checked) {
                            props.opacity = { from: 0, to: 1 };
                          } else {
                            delete props.opacity;
                          }
                          updateAnimation(selectedAnimation.id, { properties: props });
                        }}
                      />
                    </div>
                    {selectedAnimation.properties.opacity && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">From</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.opacity.from}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                opacity: { ...selectedAnimation.properties.opacity!, from: parseFloat(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                            min={0}
                            max={1}
                            step={0.1}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">To</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.opacity.to}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                opacity: { ...selectedAnimation.properties.opacity!, to: parseFloat(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                            min={0}
                            max={1}
                            step={0.1}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Position X */}
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> Position X
                      </Label>
                      <Switch
                        checked={!!selectedAnimation.properties.x}
                        onCheckedChange={(checked) => {
                          const props = { ...selectedAnimation.properties };
                          if (checked) {
                            props.x = { from: 50, to: 0 };
                          } else {
                            delete props.x;
                          }
                          updateAnimation(selectedAnimation.id, { properties: props });
                        }}
                      />
                    </div>
                    {selectedAnimation.properties.x && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">From (px)</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.x.from}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                x: { ...selectedAnimation.properties.x!, from: parseInt(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">To (px)</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.x.to}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                x: { ...selectedAnimation.properties.x!, to: parseInt(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Position Y */}
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" /> Position Y
                      </Label>
                      <Switch
                        checked={!!selectedAnimation.properties.y}
                        onCheckedChange={(checked) => {
                          const props = { ...selectedAnimation.properties };
                          if (checked) {
                            props.y = { from: 50, to: 0 };
                          } else {
                            delete props.y;
                          }
                          updateAnimation(selectedAnimation.id, { properties: props });
                        }}
                      />
                    </div>
                    {selectedAnimation.properties.y && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">From (px)</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.y.from}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                y: { ...selectedAnimation.properties.y!, from: parseInt(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">To (px)</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.y.to}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                y: { ...selectedAnimation.properties.y!, to: parseInt(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scale */}
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Scale
                      </Label>
                      <Switch
                        checked={!!selectedAnimation.properties.scale}
                        onCheckedChange={(checked) => {
                          const props = { ...selectedAnimation.properties };
                          if (checked) {
                            props.scale = { from: 0.8, to: 1 };
                          } else {
                            delete props.scale;
                          }
                          updateAnimation(selectedAnimation.id, { properties: props });
                        }}
                      />
                    </div>
                    {selectedAnimation.properties.scale && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">From</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.scale.from}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                scale: { ...selectedAnimation.properties.scale!, from: parseFloat(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                            step={0.1}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">To</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.scale.to}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                scale: { ...selectedAnimation.properties.scale!, to: parseFloat(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                            step={0.1}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rotation */}
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Rotation
                      </Label>
                      <Switch
                        checked={!!selectedAnimation.properties.rotation}
                        onCheckedChange={(checked) => {
                          const props = { ...selectedAnimation.properties };
                          if (checked) {
                            props.rotation = { from: -15, to: 0 };
                          } else {
                            delete props.rotation;
                          }
                          updateAnimation(selectedAnimation.id, { properties: props });
                        }}
                      />
                    </div>
                    {selectedAnimation.properties.rotation && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">From (deg)</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.rotation.from}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                rotation: { ...selectedAnimation.properties.rotation!, from: parseInt(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">To (deg)</Label>
                          <Input
                            type="number"
                            value={selectedAnimation.properties.rotation.to}
                            onChange={(e) => updateAnimation(selectedAnimation.id, {
                              properties: {
                                ...selectedAnimation.properties,
                                rotation: { ...selectedAnimation.properties.rotation!, to: parseInt(e.target.value) },
                              },
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePreview} className="flex-1">
                    {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicateAnimation(selectedAnimation.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteAnimation(selectedAnimation.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an animation to edit</p>
                <p className="text-xs">or add one from presets</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="flex-1 overflow-auto m-0 p-2">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {animations.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No animations yet</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setActiveTab('presets')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Animation
                  </Button>
                </div>
              ) : (
                animations.map((animation, index) => (
                  <Card
                    key={animation.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAnimationId === animation.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : ''
                    }`}
                    onClick={() => {
                      setSelectedAnimationId(animation.id);
                      setActiveTab('custom');
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{animation.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {animation.timing.duration}s, {animation.trigger}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={animation.enabled}
                            onCheckedChange={(checked) => updateAnimation(animation.id, { enabled: checked })}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {/* Visual timeline bar */}
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            marginLeft: `${(animation.timing.delay / 3) * 100}%`,
                            width: `${(animation.timing.duration / 3) * 100}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GSAPAnimationPanel;

