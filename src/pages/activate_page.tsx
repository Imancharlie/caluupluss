import React from 'react';
import { Mail } from 'lucide-react';

const EmailVerificationPage = () => {
  return (
    <div className="min-h-screen bg--background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Check Your Email
        </h1>

        {/* Message */}
        <p className="text-gray-600">
          We've sent you an activation link. Please check your email to activate your account.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
