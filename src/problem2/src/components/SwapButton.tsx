import React from 'react';

interface SwapButtonProps {
  isLoading: boolean;
}

const SwapButton: React.FC<SwapButtonProps> = ({ isLoading }) => {
  return (
    <button
      id="swap-button"
      type="submit"
      disabled={isLoading}
      className={isLoading ? "loading" : ""}
    >
      <span className="button-text">Swap Tokens</span>
      <span className="spinner"></span>
    </button>
  );
};

export default SwapButton; 