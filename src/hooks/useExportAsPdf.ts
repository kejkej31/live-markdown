import { useCallback } from 'react';

/**
 * Custom hook for exporting content as PDF
 * @returns A function that exports the content of a given ref as PDF
 */
export const useExportAsPdf = () => {
  return useCallback((contentRef: React.RefObject<HTMLDivElement>) => {
    if (!contentRef.current) return;
    
    // Get the HTML content
    const content = contentRef.current.innerHTML;
    
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
};

export default useExportAsPdf;
