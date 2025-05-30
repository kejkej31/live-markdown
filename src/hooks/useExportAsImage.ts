import { useCallback } from 'react';
import html2canvas from 'html2canvas-pro';

/**
 * Custom hook for exporting content as an image
 * @returns A function that exports the content of a given ref as an image
 */
export const useExportAsImage = () => {
  return useCallback((contentRef: React.RefObject<HTMLDivElement>) => {
    if (!contentRef.current) return;
    
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
    tempContainer.style.width = `${contentRef.current.offsetWidth}px`;
    tempContainer.style.backgroundColor = '#101828';
    tempContainer.style.padding = '20px';
    
    // Copy the content
    tempContainer.innerHTML = contentRef.current.innerHTML;
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
};

export default useExportAsImage;
