import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-[#E31E24]/25 rounded-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl shadow-[#E31E24]/10 animate-fadeIn`}
        onClick={(e) => e.stopPropagation()}
        style={{ animationDelay: '0.1s' }}
      >
        <div className="p-6 border-b border-[#E31E24]/15 flex items-center justify-between bg-gradient-to-r from-[#E31E24]/10 to-transparent">
          <h2 className="text-2xl font-ubuntu font-black text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-[#E31E24] text-3xl font-ubuntu-light transition-all duration-300 hover:rotate-90 hover:scale-110 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E31E24]/10"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
