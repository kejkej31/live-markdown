import React, { useEffect, useRef, useState } from 'react';
import { marked, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import mermaid from 'mermaid';

interface MarkdownRendererProps {
  markdown: string;
}

declare global {
  interface Window {
    // These are now primarily for checking initialization status or specific
    // library functionalities that might still rely on global scope.
    markedInitialized?: boolean;
    mermaidInitialized?: boolean;
    // Keep hljs on window if marked-highlight or other parts expect it globally.
    hljs?: typeof hljs;
  }
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const outputRef = useRef<HTMLDivElement>(null);
  const [parserAndHighlighterReady, setParserAndHighlighterReady] = useState<boolean>(false);
  const [processedHtml, setProcessedHtml] = useState<string>('');

  useEffect(() => {
    if (!window.markedInitialized) {
      marked.use(markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code: string, lang: string) {
          if (lang === 'mermaid') {
            return code;
          }
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          try {
            return hljs.highlight(code, { language, ignoreIllegals: true }).value;
          } catch (e) {
            console.error("Highlight.js error:", e);
            return code;
          }
        }
      }));

      marked.setOptions({
        gfm: true,
        breaks: true,
        pedantic: false,
        async: false, // Ensure parse is synchronous if possible, or handle promise
      } as MarkedOptions);
      window.markedInitialized = true;
      // Ensure hljs is available on window if any part of marked or its extensions expect it.
      window.hljs = hljs; 
    }

    if (window.markedInitialized && !parserAndHighlighterReady) {
      setParserAndHighlighterReady(true);
    }
  }, [parserAndHighlighterReady]);

  useEffect(() => {
    if (!parserAndHighlighterReady) {
      setProcessedHtml('<p class="text-center text-gray-500 dark:text-gray-400">Initializing Markdown parser and highlighter...</p>');
      return;
    }

    try {
      const rawHtml = marked.parse(markdown);
      // If marked.parse is configured to be async or could return a Promise
      if (typeof rawHtml === 'string') {
        setProcessedHtml(rawHtml);
      } else if (rawHtml instanceof Promise) {
        rawHtml.then(setProcessedHtml).catch(error => {
          console.error("Error parsing Markdown (async):", error);
          setProcessedHtml(`<p class="text-red-500">Error parsing Markdown. Check console for details.</p>`);
        });
      } else {
        // Fallback for unexpected return type
         console.error("Unexpected return type from marked.parse");
         setProcessedHtml(`<p class="text-red-500">Error processing Markdown content.</p>`);
      }
    } catch (error) {
      console.error("Error parsing Markdown:", error);
      setProcessedHtml(`<p class="text-red-500">Error parsing Markdown. Check console for details.</p>`);
    }
  }, [markdown, parserAndHighlighterReady]);

  useEffect(() => {
    if (outputRef.current && mermaid && processedHtml) { // Check processedHtml to ensure DOM is updated
      if (!window.mermaidInitialized) {
        try {
          mermaid.initialize({
            startOnLoad: false,
          });
          window.mermaidInitialized = true;
        } catch (e) {
            console.error('Mermaid initialization error:', e);
        }
      }

      const mermaidElements = Array.from(
        outputRef.current.querySelectorAll('code.hljs.language-mermaid')
      ) as HTMLElement[]; // Cast to HTMLElement[]
    
      if (mermaidElements.length > 0 && window.mermaidInitialized) {
          mermaid.run({ nodes: mermaidElements });
      }
    }
  }, [processedHtml]); // Re-run when processedHtml changes

  return (
    <div 
      ref={outputRef} 
      className="prose text-white prose-sm sm:prose-base prose-md dark:prose-invert max-w-none p-6 focus:outline-none" 
      dangerouslySetInnerHTML={{ __html: processedHtml }} 
      aria-live="polite"
    />
  );
};

export default MarkdownRenderer;
