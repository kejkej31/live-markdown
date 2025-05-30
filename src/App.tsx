import React, { useState, useCallback, useRef, useEffect } from 'react';
import ResizablePanels from './components/ResizablePanels';
import MarkdownRenderer from './components/MarkdownRenderer';
import { DEFAULT_MARKDOWN_CONTENT } from './constants';

// Declare global types for window objects from CDNs
declare global {
  interface Window {
    marked: any;
    mermaid: any;
  }
}

const App: React.FC = () => {
  const [markdownInput, setMarkdownInput] = useState<string>('');

  // Load content from localStorage on initial render
  useEffect(() => {
    const savedContent = localStorage.getItem('markdownContent');
    if (savedContent) {
      setMarkdownInput(savedContent);
    } else {
      setMarkdownInput(DEFAULT_MARKDOWN_CONTENT);
    }
  }, []);

  const leftPanelRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea
  const rightPanelRef = useRef<HTMLDivElement>(null); // Ref for the scrollable div on the right

  const handleMarkdownChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setMarkdownInput(newValue);
    // Save to localStorage whenever content changes
    localStorage.setItem('markdownContent', newValue);
  }, []);

  const InputPanel: React.ReactNode = (
    <textarea
      ref={leftPanelRef} // Assign ref
      value={markdownInput}
      onChange={handleMarkdownChange}
      className="w-full h-full p-4 border-none resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed selection:bg-blue-200 dark:selection:bg-blue-700 overflow-auto" // Added overflow-auto
      placeholder="Enter Markdown here..."
      spellCheck="false"
      aria-label="Markdown Input"
    />
  );

  const OutputPanel: React.ReactNode = (
    <div
      ref={rightPanelRef} // Assign ref
      className="w-full h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 overflow-auto"
    >
      <MarkdownRenderer markdown={markdownInput} />
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-slate-700 dark:bg-slate-800 text-white p-3 shadow-md text-center">
        <h1 className="text-xl font-semibold">Markdown Live Previewer</h1>
      </header>
      <ResizablePanels
        leftPanelContent={InputPanel}
        rightPanelContent={OutputPanel}
        leftScrollRef={leftPanelRef} // Pass ref
        rightScrollRef={rightPanelRef} // Pass ref
      />
    </div>
  );
};

export default App;
