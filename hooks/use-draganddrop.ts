"use client";
import { useState, useCallback, DragEvent } from "react";

type DropHandler = (files: File[], paths?: string[]) => Promise<void>;

export function useDragAndDrop(onDrop: DropHandler) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      setIsLoading(true);
      try {
        await onDrop(files);
      } finally {
        setIsLoading(false);
      }
    },
    [onDrop]
  );

  return {
    isLoading,
    isDragging,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
