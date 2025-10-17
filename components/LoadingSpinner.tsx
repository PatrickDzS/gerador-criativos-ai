
import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 font-semibold text-purple-300">{message || 'Gerando...'}</p>
    </div>
  );
};

export default LoadingSpinner;
