import { useEffect } from 'react';

export default function Toast({ message, type, onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg text-white ${bgColor} transition-all duration-300 transform translate-y-0 opacity-100 animate-[slideIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]`}>
      <div className="flex-shrink-0 mr-3">
        {icon}
      </div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button onClick={onClose} className="ml-3 hover:bg-white/20 rounded-lg p-1.5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
