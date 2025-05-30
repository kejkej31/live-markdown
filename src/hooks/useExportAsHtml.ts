import { useCallback } from 'react';

/**
 * Custom hook for exporting content as HTML
 * @returns A function that exports the content of a given ref as HTML
 */
export const useExportAsHtml = () => {
  return useCallback((contentRef: React.RefObject<HTMLDivElement>) => {
    if (!contentRef.current) return;
    
    // Get the HTML content
    const content = contentRef.current.innerHTML;
    
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
};

export default useExportAsHtml;
