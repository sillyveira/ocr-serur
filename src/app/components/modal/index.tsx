import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 relative min-w-[400px] max-w-4xl mx-4 border border-white/30 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
          aria-label="Fechar modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
