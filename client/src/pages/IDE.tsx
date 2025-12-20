import { useState } from 'react';
import TopBar from '@/components/TopBar';
import FileTree from '@/components/FileTree';
import EditorTabs, { type Tab } from '@/components/EditorTabs';
import CodeEditor from '@/components/CodeEditor';
import StatusBar from '@/components/StatusBar';
import TerminalPanel from '@/components/TerminalPanel';

const sampleFiles = {
  'src/App.tsx': `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Counter: {count}
      </h1>
      <button 
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  )
}`,
  'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  'package.json': `{
  "name": "stargate-ide",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
};

export default function IDE() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', name: 'App.tsx', modified: false }]);
  const [activeTab, setActiveTab] = useState('1');
  const [currentFile, setCurrentFile] = useState('src/App.tsx');
  const [fileContent, setFileContent] = useState(sampleFiles['src/App.tsx']);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(200);

  const handleFileSelect = (path: string) => {
    const existingTab = tabs.find(tab => tab.name === path.split('/').pop());
    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      const newTab: Tab = {
        id: String(tabs.length + 1),
        name: path.split('/').pop() || path,
        modified: false,
      };
      setTabs([...tabs, newTab]);
      setActiveTab(newTab.id);
    }
    setCurrentFile(path);
    const content =
      sampleFiles[path as keyof typeof sampleFiles] || `// ${path}\n\n// File content here...`;
    setFileContent(content);
  };

  const handleTabClose = (id: string) => {
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleCodeChange = (content: string) => {
    setFileContent(content);
    setTabs(tabs.map(tab => (tab.id === activeTab ? { ...tab, modified: true } : tab)));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} currentFile={currentFile} />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="w-56 border-r bg-sidebar flex-shrink-0">
            <FileTree onFileSelect={handleFileSelect} />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={setActiveTab}
            onTabClose={handleTabClose}
          />

          <div
            className="flex-1 overflow-hidden"
            style={{
              height: terminalOpen ? `calc(100% - ${terminalHeight}px)` : '100%',
            }}
          >
            <CodeEditor content={fileContent} language="typescript" onChange={handleCodeChange} />
          </div>

          {terminalOpen && (
            <TerminalPanel
              height={terminalHeight}
              onClose={() => setTerminalOpen(false)}
              onResize={setTerminalHeight}
            />
          )}
        </div>
      </div>

      <StatusBar line={1} column={1} language="TypeScript" encoding="UTF-8" />
    </div>
  );
}
