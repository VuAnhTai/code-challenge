import { useState, useEffect, FormEvent } from "react";
import "./App.css";
import TokenSelect from "./components/TokenSelect";
import AmountInput from "./components/AmountInput";
import DirectionButton from "./components/DirectionButton";
import ExchangeInfo from "./components/ExchangeInfo";
import SwapButton from "./components/SwapButton";

interface TokenInfo {
  symbol: string;
  price: number;
  date: Date;
}

interface PriceItem {
  currency: string;
  price: string;
  date: string;
}

function App() {
  // State variables
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokenPrices, setTokenPrices] = useState<Record<string, TokenInfo>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form state
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [outputToken, setOutputToken] = useState("");

  // Fetch token prices on component mount
  useEffect(() => {
    const fetchTokenPrices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://interview.switcheo.com/prices.json"
        );
        const prices = await response.json();

        // Filter tokens that have prices and organize data
        const tokenMap: Record<string, TokenInfo> = {};
        prices.forEach((item: PriceItem) => {
          if (item.price) {
            const symbol = item.currency;
            if (!tokenMap[symbol]) {
              tokenMap[symbol] = {
                symbol,
                price: parseFloat(item.price),
                date: new Date(item.date),
              };
            } else if (new Date(item.date) > tokenMap[symbol].date) {
              // Use the most recent price
              tokenMap[symbol].price = parseFloat(item.price);
              tokenMap[symbol].date = new Date(item.date);
            }
          }
        });

        const tokenList = Object.values(tokenMap);
        setTokens(tokenList);
        setTokenPrices(tokenMap);

        // Set default tokens
        if (tokenList.length >= 2) {
          setInputToken(tokenList[0].symbol);
          setOutputToken(tokenList[1].symbol);
        }
      } catch (error) {
        console.error("Error fetching token prices:", error);
        setErrorMessage(
          "Failed to load token prices. Please refresh the page."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenPrices();
  }, []);

  // Calculate exchange rate between two tokens
  const calculateExchangeRate = (
    fromToken: string,
    toToken: string
  ): string => {
    if (!tokenPrices[fromToken] || !tokenPrices[toToken]) {
      return "N/A";
    }

    const rate = tokenPrices[toToken].price / tokenPrices[fromToken].price;
    return rate.toFixed(6);
  };

  // Calculate output amount based on input
  const calculateOutputAmount = (
    amount: string,
    from: string,
    to: string
  ): string => {
    const inputValue = parseFloat(amount);

    if (isNaN(inputValue) || inputValue <= 0) {
      return "";
    }

    if (!tokenPrices[from] || !tokenPrices[to]) {
      return "N/A";
    }

    const rate = tokenPrices[to].price / tokenPrices[from].price;
    const outputValue = inputValue * rate;

    return outputValue.toFixed(6);
  };

  // Update output amount when input changes
  useEffect(() => {
    if (inputToken && outputToken) {
      const newOutputAmount = calculateOutputAmount(
        inputAmount,
        inputToken,
        outputToken
      );
      setOutputAmount(newOutputAmount);
    }
  }, [inputAmount, inputToken, outputToken]);

  // Form validation
  const validateForm = (): boolean => {
    const inputValue = parseFloat(inputAmount);

    // Clear previous errors
    setErrorMessage("");

    // Check for valid input amount
    if (isNaN(inputValue) || inputValue <= 0) {
      setErrorMessage("Please enter a valid amount");
      return false;
    }

    // Check if tokens are the same
    if (inputToken === outputToken) {
      setErrorMessage("Please select different tokens");
      return false;
    }

    // Check if prices are available
    if (!tokenPrices[inputToken] || !tokenPrices[outputToken]) {
      setErrorMessage("Price information not available for selected tokens");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show loading state
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);

      // Show success message
      setSuccessMessage(
        `Successfully swapped ${inputAmount} ${inputToken} for ${outputAmount} ${outputToken}`
      );

      // Reset form
      setInputAmount("");
      setOutputAmount("");

      // Remove success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 1500);
  };

  // Handle swapping token direction
  const handleSwapDirection = () => {
    const tempToken = inputToken;
    setInputToken(outputToken);
    setOutputToken(tempToken);
  };

  return (
    <div className="app-container">
      <form onSubmit={handleSubmit}>
        <h1>Swap Tokens</h1>
        <div className="swap-container">
          <div className="swap-input-container">
            <TokenSelect
              tokens={tokens}
              selectedToken={inputToken}
              onTokenChange={setInputToken}
            />
            <AmountInput
              label="You pay"
              amount={inputAmount}
              token={inputToken}
              tokenPrice={tokenPrices[inputToken]}
              onChange={setInputAmount}
            />
          </div>

          <DirectionButton onClick={handleSwapDirection} />
          <div className="swap-input-container">
            <TokenSelect
              tokens={tokens}
              selectedToken={outputToken}
              onTokenChange={setOutputToken}
            />
            <AmountInput
              label="You receive"
              amount={outputAmount}
              token={outputToken}
              tokenPrice={tokenPrices[outputToken]}
              readOnly={true}
            />
          </div>

          <ExchangeInfo
            inputToken={inputToken}
            outputToken={outputToken}
            exchangeRate={calculateExchangeRate(inputToken, outputToken)}
            errorMessage={errorMessage}
            successMessage={successMessage}
          />

          <SwapButton isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
}

export default App;
