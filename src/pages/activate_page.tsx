import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const EmailVerificationPage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/selection');
  };

  return (
    <div className="min-h-screen bg--background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome
        </h1>

        {/* Motivational Message */}
        <p className="text-gray-600 mb-6">
          You're just a step away from unlocking your academic potential. Let's continue and achieve your goals together!
        </p>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
