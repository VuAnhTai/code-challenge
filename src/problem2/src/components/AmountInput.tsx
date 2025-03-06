import React from 'react';

interface TokenInfo {
  symbol: string;
  price: number;
  date: Date;
}

interface AmountInputProps {
  label: string;
  amount: string;
  token: string;
  tokenPrice: TokenInfo | undefined;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

const AmountInput: React.FC<AmountInputProps> = ({
  label,
  amount,
  token,
  tokenPrice,
  readOnly = false,
  onChange = () => {}
}) => {
  return (
    <div className="amount-input">
      <label>{label}</label>
      <input
        type="number"
        min="0"
        step="any"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
      />
      {tokenPrice && <div className="token-price">
        {`1 ${token} ≈ $${tokenPrice.price.toFixed(2)}`}
      </div>}
    </div>
  );
};

export default AmountInput; 