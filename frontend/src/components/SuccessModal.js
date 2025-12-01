import { CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

const SuccessModal = ({ isOpen, onClose, title, message }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
            {title || 'Message Sent!'}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4 sm:mb-6">
            {message || 'Thank you for reaching out. We\'ll review your message and get back to you within 24-48 hours.'}
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-navy-700 to-navy-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-navy-800 hover:to-navy-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
