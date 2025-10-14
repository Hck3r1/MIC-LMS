import React, { useState } from 'react';

const MICLogo = ({ className = "w-8 h-8", showText = true, textClassName = "text-xl font-bold text-gray-900" }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <div className={`${className} rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200`}>
        {!imageError ? (
          <img 
            src="/oyo_logo.png" 
            alt="MIC Oyo State Logo" 
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        )}
      </div>
      {showText && (
        <span className={textClassName}>
          MIC Oyo State LMS
        </span>
      )}
    </div>
  );
};

export default MICLogo;
