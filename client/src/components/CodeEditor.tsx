import { useState, useRef, useEffect } from 'react';

interface CodeEditorProps {
  content?: string;
  language?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  content = '',
  language: _language = 'typescript',
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  useEffect(() => {
    setCode(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onChange?.(newCode);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <div
        ref={lineNumbersRef}
        className="flex flex-col py-4 px-2 bg-muted/20 border-r text-right text-xs text-muted-foreground font-mono overflow-hidden select-none"
        style={{ width: '50px' }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          className="w-full h-full p-4 bg-transparent text-sm font-mono leading-6 resize-none outline-none"
          data-testid="code-editor-textarea"
          style={{
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
