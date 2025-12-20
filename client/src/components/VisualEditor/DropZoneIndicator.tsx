/**
 * Drop Zone Indicator
 * Visual feedback showing where a component will be inserted during drag
 */

interface DropZoneIndicatorProps {
  position: {
    top: number;
    left: number;
    width: number;
  };
  isActive: boolean;
}

export function DropZoneIndicator({ position, isActive }: DropZoneIndicatorProps) {
  if (!isActive) return null;

  return (
    <div
      className="drop-zone-indicator pointer-events-none fixed z-[9999] transition-all duration-150"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: '4px',
        backgroundColor: 'rgb(59, 130, 246)',
        borderRadius: '2px',
        boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)',
      }}
    >
      {/* Left circle indicator */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: 'rgb(59, 130, 246)',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      />

      {/* Right circle indicator */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: 'rgb(59, 130, 246)',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      />

      {/* Pulsing animation */}
      <style>{`
        @keyframes dropzone-pulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.7; transform: scaleY(1.2); }
        }
        .drop-zone-indicator {
          animation: dropzone-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
