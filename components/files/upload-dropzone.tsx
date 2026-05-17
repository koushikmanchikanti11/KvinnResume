import React, { useCallback, useState } from 'react';

export function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed 
        transition-all duration-160 cursor-pointer group
        ${isDragging 
          ? 'bg-[rgba(114,221,247,0.05)] border-kr-resume-blue' 
          : 'bg-kr-surface border-kr-border hover:border-kr-text-dim'}
      `}
    >
      <div className={`
        font-pixel text-xl mb-4 transition-colors duration-160
        ${isDragging ? 'text-kr-resume-blue animate-pulse' : 'text-kr-text-muted group-hover:text-kr-text'}
      `}>
        {isDragging ? 'RELEASE_TO_PARSE' : 'DROP_RESUME.PDF'}
      </div>
      <p className="text-kr-text-dim text-sm font-ui text-center max-w-xs">
        Drag and drop your PDF here, or click to browse. We will extract and structure the contents automatically.
      </p>
    </div>
  );
}
