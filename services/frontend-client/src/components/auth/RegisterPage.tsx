import React from 'react';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up for a new account</p>
        </div>
        <div className="text-center text-gray-600">
          <p>Registration form will be implemented here</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium mt-4 inline-block">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;