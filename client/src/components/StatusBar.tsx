interface StatusBarProps {
  line?: number;
  column?: number;
  language?: string;
  encoding?: string;
}

export default function StatusBar({
  line = 1,
  column = 1,
  language = 'TypeScript',
  encoding = 'UTF-8',
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between h-6 px-3 bg-primary text-primary-foreground text-xs">
      <div className="flex items-center gap-4">
        <span data-testid="text-position">
          Ln {line}, Col {column}
        </span>
        <span className="text-primary-foreground/70">|</span>
        <span data-testid="text-language">{language}</span>
      </div>
      <div className="flex items-center gap-4">
        <span data-testid="text-encoding">{encoding}</span>
      </div>
    </div>
  );
}
