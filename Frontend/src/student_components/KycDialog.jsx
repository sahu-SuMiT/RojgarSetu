import React from 'react';

const KycDialog = ({
  isKycDialogOpen,
  kycStep,
  kycStatus,
  paymentProcessing,
  kycProcessing,
  profileData,
  kycIdentifierType,
  setKycIdentifierType,
  kycIdentifierValue,
  setKycIdentifierValue,
  handleKycClose,
  handleKycNext,
  handleKycBack,
  handlePayment,
  handleKycConfirm
}) => {
  if (!isKycDialogOpen) return null;

  return (
    <>
      {/* KYC Dialog with Backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={handleKycClose}
      >
        <div 
          className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-6 text-white relative">
            <button
              onClick={handleKycClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
              aria-label="Close dialog"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">KYC Verification</h1>
                <p className="text-indigo-100 text-sm mt-1">Complete your identity verification</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 0: Intro step */}
            {kycStep === 0 && (
              <>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Getting Started</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to KYC Verification</h3>
                    <p className="text-gray-600 mb-4">Complete your identity verification in 3 simple steps:</p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Complete the one-time verification fee payment</li>
                      <li>Choose your verification method (Phone/Email)</li>
                      <li>Verify your identity through DigiLocker</li>
                    </ol>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    onClick={() => handleKycNext()}
                  >
                    Start Verification
                  </button>
                  <button
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                    onClick={handleKycClose}
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {kycStep === 1 && (
              <>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Step 1 of 3</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To start your KYC verification, please pay the verification fee.
                  </p>
                  <div className={`bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200 transition-all duration-500 ${
                    paymentProcessing ? 'animate-pulse border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`transition-all duration-500 ${paymentProcessing ? 'animate-bounce' : ''}`}>
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <span className={`font-semibold transition-colors duration-500 ${
                          paymentProcessing ? 'text-blue-700' : 'text-gray-700'
                        }`}>Verification Fee</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold transition-all duration-500 ${
                          paymentProcessing ? 'text-blue-600 animate-pulse' : 'text-green-600'
                        }`}>₹85</span>
                        {paymentProcessing && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <button 
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      paymentProcessing
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-not-allowed animate-pulse'
                        : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                    }`}
                    onClick={handlePayment} 
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="relative">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-6 h-6 border-3 border-blue-200 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Processing Payment...</span>
                          <span className="text-xs text-blue-100 animate-pulse">Please wait while we connect to payment gateway</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>Pay KYC Fee</span>
                      </div>
                    )}
                  </button>
                  <button 
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300" 
                    onClick={handleKycClose} 
                    disabled={paymentProcessing}
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            { profileData?.payment?.status === 'paid' && kycStep === 2 && (
              <>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Step 3 of 3</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-green-800">
                        {profileData?.payment?.status === 'paid' ? 'Payment Already Completed!' : 'Payment Successful!'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {profileData?.payment?.status === 'paid' 
                      ? 'Your payment has already been completed. Please select an identifier and provide its value to initiate your DigiLocker KYC verification.'
                      : 'Please select an identifier and provide its value to initiate your DigiLocker KYC verification.'
                    }
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Select Identifier
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      value={kycIdentifierType}
                      onChange={e => {
                        setKycIdentifierType(e.target.value);
                        setKycIdentifierValue(e.target.value === 'phone' ? (profileData.phone || '') : (profileData.email || ''));
                      }}
                    >
                      <option value="phone">Phone Number</option>
                      <option value="email">Email Address</option>
                    </select>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      {kycIdentifierType === 'phone' ? 'Phone Number' : 'Email Address'}
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      type={kycIdentifierType === 'phone' ? 'tel' : 'email'}
                      value={kycIdentifierValue}
                      onChange={e => setKycIdentifierValue(e.target.value)}
                      placeholder={kycIdentifierType === 'phone' ? 'Enter phone number' : 'Enter email address'}
                    />
                  </div>
                </div>
                <div className="space-y-3 mt-6">
                  <button 
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      kycProcessing
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-not-allowed animate-pulse'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}
                    onClick={handleKycConfirm}
                    disabled={kycProcessing}
                  >
                    {kycProcessing ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="relative">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-6 h-6 border-3 border-blue-200 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Initiating KYC...</span>
                          <span className="text-xs text-blue-100 animate-pulse">Please wait, it will take a minute</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Initiate KYC Verification</span>
                      </div>
                    )}
                  </button>
                  <button 
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300" 
                    onClick={handleKycClose}
                    disabled={kycProcessing}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {kycStep === 3 && (
              <>
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-blue-800">KYC Verification {kycStatus === 'pending' || kycStatus === 'pending approval' ? 'In Progress' : 'Initiated'}!</span>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold text-green-800">Check Your {kycIdentifierType === 'phone' ? 'SMS' : 'Email'}!</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {kycStatus === 'pending' || kycStatus === 'pending approval' 
                      ? 'Your KYC verification is already in progress. Please check your SMS/Email for the verification link and complete the process.'
                      : 'Your KYC verification has been initiated successfully. Please check your SMS/Email for the verification link and complete the process.'
                    }
                  </p>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The verification link will be sent to your {kycIdentifierType === 'phone' ? 'phone number' : 'email address'}: <strong>{kycIdentifierValue}</strong>
                    </p>
                  </div>
                  {kycStatus === 'pending' || kycStatus === 'pending approval' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Status:</strong> Your verification is currently being processed. You can close this dialog and check back later for updates.
                      </p>
                    </div>
                  )}
                </div>
                <button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                  onClick={handleKycClose}
                >
                  Got it, I'll check my {kycIdentifierType === 'phone' ? 'SMS' : 'email'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default KycDialog; 