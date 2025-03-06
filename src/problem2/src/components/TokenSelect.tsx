import React from 'react';

interface TokenInfo {
  symbol: string;
  price: number;
  date: Date;
}

interface TokenSelectProps {
  tokens: TokenInfo[];
  selectedToken: string;
  onTokenChange: (token: string) => void;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ 
  tokens, 
  selectedToken, 
  onTokenChange 
}) => {
  return (
    <div className="token-selection">
      <select
        value={selectedToken}
        onChange={(e) => onTokenChange(e.target.value)}
      >
        {tokens.map((token) => (
          <option key={token.symbol} value={token.symbol} >
            {token.symbol}
          </option>
        ))}
      </select>
      <div className="token-icon">
        <img
          src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${selectedToken}.svg`}
          alt={selectedToken}
          onError={(e) => {
            e.currentTarget.src = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg";
            e.currentTarget.alt = "Token";
          }}
        />
      </div>
    </div>
  );
};

export default TokenSelect; 