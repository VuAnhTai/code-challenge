import React from 'react';

interface ExchangeInfoProps {
  inputToken: string;
  outputToken: string;
  exchangeRate: string;
  errorMessage: string;
  successMessage: string;
}

const ExchangeInfo: React.FC<ExchangeInfoProps> = ({
  inputToken,
  outputToken,
  exchangeRate,
  errorMessage,
  successMessage
}) => {
  return (
    <>
      <div id="exchange-rate" className="exchange-rate">
        {inputToken && outputToken && `1 ${inputToken} = ${exchangeRate} ${outputToken}`}
      </div>
      
      {errorMessage && (
        <div id="error-message" className="error-message">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </>
  );
};

export default ExchangeInfo; 