/**
 * Draggable Component Item
 * Wrapper for components in the palette that enables drag-and-drop
 */

import { useDrag } from 'react-dnd';
import { Card } from '@/components/ui/card';
import type { ComponentDefinition } from './componentsLibrary';

interface DraggableComponentItemProps {
  component: ComponentDefinition;
}

export function DraggableComponentItem({ component }: DraggableComponentItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { component },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      className={`p-3 cursor-move hover:border-primary transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">
          {component.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{component.name}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {component.description}
          </div>
        </div>
      </div>
    </Card>
  );
}

