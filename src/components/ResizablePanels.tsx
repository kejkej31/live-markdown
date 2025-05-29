import React, { useState, useCallback, useEffect, useRef } from 'react';

interface ResizablePanelsProps {
  leftPanelContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
  leftScrollRef: React.RefObject<HTMLElement>; 
  rightScrollRef: React.RefObject<HTMLElement>;
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({ 
  leftPanelContent, 
  rightPanelContent, 
  leftScrollRef,
  rightScrollRef
}) => {
  const [dividerPosition, setDividerPosition] = useState<number>(50); 
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef<boolean>(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let newLeftWidth = ((event.clientX - containerRect.left) / containerRect.width) * 100;
    newLeftWidth = Math.max(10, Math.min(90, newLeftWidth));
    setDividerPosition(newLeftWidth);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const leftElement = leftScrollRef.current;
    const rightElement = rightScrollRef.current;

    const handleScroll = (source: HTMLElement, target: HTMLElement) => () => {
      if (!source || !target || isSyncingScroll.current) return;
      isSyncingScroll.current = true;

      const sourceScrollTop = source.scrollTop;
      const sourceScrollHeight = source.scrollHeight - source.clientHeight;
      const targetScrollHeight = target.scrollHeight - target.clientHeight;

      if (sourceScrollHeight > 0 && targetScrollHeight > 0) { 
        const scrollPercentage = sourceScrollTop / sourceScrollHeight;
        target.scrollTop = scrollPercentage * targetScrollHeight;
      }
      
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    };

    let leftScrollHandler: (() => void) | null = null;
    let rightScrollHandler: (() => void) | null = null;

    if (leftElement && rightElement) {
      leftScrollHandler = handleScroll(leftElement, rightElement);
      rightScrollHandler = handleScroll(rightElement, leftElement);
      leftElement.addEventListener('scroll', leftScrollHandler);
      rightElement.addEventListener('scroll', rightScrollHandler);
    }

    return () => {
      if (leftElement && leftScrollHandler) {
        leftElement.removeEventListener('scroll', leftScrollHandler);
      }
      if (rightElement && rightScrollHandler) {
        rightElement.removeEventListener('scroll', rightScrollHandler);
      }
    };
  }, [leftScrollRef, rightScrollRef]);

  return (
    <div ref={containerRef} className="flex grow w-full h-full overflow-hidden" style={{ minHeight: 0 }}>
      <div 
        className="h-full overflow-y-hidden bg-gray-50 dark:bg-gray-800 relative" // Added relative for potential future absolute positioned elements inside
        style={{ width: `${dividerPosition}%`, flexShrink: 0 }}
        aria-label="Input Panel"
      >
        {leftPanelContent} 
      </div>
      
      <div
        className="w-3 h-full bg-slate-300 dark:bg-slate-600 hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize shrink-0 group flex items-center justify-center transition-colors duration-150 ease-in-out"
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        aria-valuenow={dividerPosition}
        aria-valuemin={10}
        aria-valuemax={90}
      >
      </div>

      <div 
        className="h-full overflow-y-auto bg-white dark:bg-gray-800 relative"
        style={{ width: `${100 - dividerPosition}%`, flexGrow: 1 }}
        aria-label="Output Panel"
      >
        {rightPanelContent}
      </div>
    </div>
  );
};

export default ResizablePanels;
