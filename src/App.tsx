import React, { useState, useCallback, useRef, useEffect } from 'react';
import ResizablePanels from './components/ResizablePanels';
import MarkdownRenderer from './components/MarkdownRenderer';
import { DEFAULT_MARKDOWN_CONTENT } from './constants';
import html2canvas from 'html2canvas-pro';

// Declare global types for window objects from CDNs
declare global {
  interface Window {
    marked: any;
    mermaid: any;
  }
}

const App: React.FC = () => {
  const [markdownInput, setMarkdownInput] = useState<string>('');
  const outputRef = useRef<HTMLDivElement>(null);

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

  // Export functions
  const exportAsHTML = useCallback(() => {
    if (!rightPanelRef.current) return;
    
    // Get the HTML content
    const content = rightPanelRef.current.innerHTML;
    
    // Create a styled HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Exported Markdown</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
          code {
            font-family: 'Courier New', Courier, monospace;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
    
    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-markdown.html';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportAsPDF = useCallback(() => {
    if (!rightPanelRef.current) return;
    
    // Get the HTML content
    const content = rightPanelRef.current.innerHTML;
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    // Append iframe to the body
    document.body.appendChild(iframe);
    
    // Get the iframe's document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) {
      console.error('Could not access iframe document');
      return;
    }
    
    // Write the HTML content to the iframe
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Markdown Export</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
          code {
            font-family: 'Courier New', Courier, monospace;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);
    
    iframeDoc.close();
    
    // Wait a bit for the content to render
    setTimeout(() => {
      try {
        // Focus the iframe window and print
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
        
        // Remove the iframe after printing (or after a delay)
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error('Error printing:', error);
        document.body.removeChild(iframe);
      }
    }, 500);
  }, []);

  const exportAsImage = useCallback(() => {
    if (!rightPanelRef.current) return;
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Generating image...';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.padding = '10px 20px';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.zIndex = '9999';
    document.body.appendChild(loadingIndicator);
    
    // Create a temporary container with fixed dimensions
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = `${rightPanelRef.current.offsetWidth}px`;
    tempContainer.style.backgroundColor = '#101828';
    tempContainer.style.padding = '20px';
    
    // Copy the content
    tempContainer.innerHTML = rightPanelRef.current.innerHTML;
    document.body.appendChild(tempContainer);

    // Wait a bit for content to render
    setTimeout(() => {
      // Use html2canvas with optimized settings
      html2canvas(tempContainer, {
        backgroundColor: '#101828',
        scale: 2,
        allowTaint: true,
        useCORS: true,
        logging: false,
        width: tempContainer.offsetWidth,
        height: tempContainer.scrollHeight
      }).then(canvas => {
        // Remove loading indicator and temp container
        document.body.removeChild(loadingIndicator);
        document.body.removeChild(tempContainer);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create a download link
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'markdown-export.png';
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
      }).catch(error => {
        console.error('Error generating image:', error);
        
        // Clean up
        document.body.removeChild(loadingIndicator);
        document.body.removeChild(tempContainer);
        
        // Show error
        alert('Failed to generate image. Please try again.');
      });
    }, 100); // Short delay to ensure content renders
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
      <header className="bg-slate-700 dark:bg-slate-800 text-white p-3 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Markdown Live Previewer</h1>
          <div className="flex space-x-2">
            <button 
              onClick={exportAsHTML}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
              title="Export as HTML"
            >
              Save as HTML
            </button>
            <button 
              onClick={exportAsImage}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
              title="Export as Image"
            >
              Save as Image
            </button>
            <button 
              onClick={exportAsPDF}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
              title="Export as PDF"
            >
              Save as PDF
            </button>
          </div>
        </div>
      </header>
      <ResizablePanels
        leftPanelContent={InputPanel}
        rightPanelContent={OutputPanel}
        leftScrollRef={leftPanelRef as React.RefObject<HTMLElement>} // Type assertion to match interface
        rightScrollRef={rightPanelRef as React.RefObject<HTMLElement>} // Type assertion to match interface
      />
    </div>
  );
};

export default App;
