"use client";

import React, { useCallback, useRef, useState } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadDropzoneProps {
  onUploadSuccess?: (fileData: any) => void;
}

export function UploadDropzone({ onUploadSuccess }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 15MB.");
      return;
    }

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const data = await res.json();
      toast.success("File uploaded successfully");
      if (onUploadSuccess) onUploadSuccess(data);

    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, [isUploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      onClick={() => !isUploading && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed 
        transition-all duration-160 cursor-pointer group relative overflow-hidden
        ${isDragging 
          ? 'bg-[rgba(114,221,247,0.05)] border-kr-resume-blue' 
          : 'bg-kv-surface-2 border-kv-border-soft hover:border-kv-text-muted'}
        ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}
      `}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-kv-text-primary mb-4" />
          <div className="font-pixel text-xl text-kv-text-primary">UPLOADING...</div>
        </div>
      ) : (
        <>
          <Upload className={`w-10 h-10 mb-4 transition-colors ${isDragging ? 'text-kv-cta-bg' : 'text-kv-text-muted group-hover:text-kv-text-primary'}`} />
          <div className={`
            font-pixel text-xl mb-4 transition-colors duration-160
            ${isDragging ? 'text-kv-cta-bg animate-pulse' : 'text-kv-text-primary'}
          `}>
            {isDragging ? 'RELEASE_TO_UPLOAD' : 'DROP_RESUME_HERE'}
          </div>
          <p className="text-kv-text-muted text-sm text-center max-w-xs">
            Drag and drop your PDF, DOCX, or TXT here, or click to browse. Max size 15MB.
          </p>
        </>
      )}
    </div>
  );
}
