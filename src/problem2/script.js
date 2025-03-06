document.addEventListener('DOMContentLoaded', async function() {
  // Global variables
  let tokenPrices = {};
  let tokens = [];
  
  // Elements
  const form = document.querySelector('form');
  
  // Initialize the app
  await initializeApp();
  
  async function initializeApp() {
    showLoadingState(true);
    await fetchTokenPrices();
    renderTokenSelectors();
    setupEventListeners();
    showLoadingState(false);
  }
  
  async function fetchTokenPrices() {
    try {
      const response = await fetch('https://interview.switcheo.com/prices.json');
      const prices = await response.json();
      
      // Filter tokens that have prices and organize data
      const tokenMap = {};
      prices.forEach(item => {
        if (item.price) {
          const symbol = item.currency;
          if (!tokenMap[symbol]) {
            tokenMap[symbol] = {
              symbol,
              price: parseFloat(item.price),
              date: new Date(item.date)
            };
          } else if (new Date(item.date) > tokenMap[symbol].date) {
            // Use the most recent price
            tokenMap[symbol].price = parseFloat(item.price);
            tokenMap[symbol].date = new Date(item.date);
          }
        }
      });
      
      tokens = Object.values(tokenMap);
      tokenPrices = tokenMap;
      
      console.log('Available tokens:', tokens.length);
    } catch (error) {
      console.error('Error fetching token prices:', error);
      showError('Failed to load token prices. Please refresh the page.');
    }
  }
  
  function renderTokenSelectors() {
    if (tokens.length === 0) {
      return;
    }
    // Create the HTML structure for the form
    const inputToken = document.getElementById('input-token');
    const outputToken = document.getElementById('output-token');
    const exchangeRate = document.getElementById('exchange-rate');

    inputToken.innerHTML = tokens.map(token => `<option value="${token.symbol}">${token.symbol}</option>`).join('');
    outputToken.innerHTML = tokens.map(token => `<option value="${token.symbol}">${token.symbol}</option>`).join('');

    inputToken.value = tokens[0].symbol;
    outputToken.value = tokens[1].symbol;
    
    exchangeRate.textContent = `1 ${tokens[0].symbol} = ${calculateExchangeRate(tokens[0].symbol, tokens[1].symbol)} ${tokens[1].symbol}`;

    updateTokenIcon('input');
    updateTokenIcon('output');
    
  }
  
  function setupEventListeners() {
    const inputAmount = document.getElementById('input-amount');
    const inputToken = document.getElementById('input-token');
    const outputToken = document.getElementById('output-token');
    const swapButton = document.getElementById('swap-button');
    const swapDirectionButton = document.getElementById('swap-direction');
    
    inputAmount.addEventListener('input', () => {
      calculateOutputAmount();
      validateForm();
    });
    
    inputToken.addEventListener('change', () => {
      updateTokenIcon('input');
      updateTokenPrice('input');
      calculateOutputAmount();
      updateExchangeRate();
      validateForm();
    });
    
    outputToken.addEventListener('change', () => {
      updateTokenIcon('output');
      updateTokenPrice('output');
      calculateOutputAmount();
      updateExchangeRate();
      validateForm();
    });
    
    swapDirectionButton.addEventListener('click', () => {
      const tempToken = inputToken.value;
      inputToken.value = outputToken.value;
      outputToken.value = tempToken;
      
      updateTokenIcon('input');
      updateTokenIcon('output');
      updateTokenPrice('input');
      updateTokenPrice('output');
      calculateOutputAmount();
      updateExchangeRate();
    });
    
    swapButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        processSwap();
      }
    });
  }
  
  function updateTokenIcon(type) {
    const token = document.getElementById(`${type}-token`).value;
    const iconElement = document.getElementById(`${type}-token-icon`);
    
    // Update the icon
    iconElement.src = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`;
    iconElement.alt = token;
    
    // Fallback in case the image doesn't load
    iconElement.onerror = function() {
      this.src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg';
      this.alt = 'Token';
    };
  }
  
  function updateTokenPrice(type) {
    const token = document.getElementById(`${type}-token`).value;
    const priceElement = document.getElementById(`${type}-token-price`);
    
    if (tokenPrices[token]) {
      priceElement.textContent = `1 ${token} ≈ $${tokenPrices[token].price.toFixed(2)}`;
    } else {
      priceElement.textContent = 'Price not available';
    }
  }
  
  function calculateExchangeRate(fromToken, toToken) {
    if (!tokenPrices[fromToken] || !tokenPrices[toToken]) {
      return 'N/A';
    }
    
    const rate = tokenPrices[toToken].price / tokenPrices[fromToken].price;
    return rate.toFixed(6);
  }
  
  function updateExchangeRate() {
    const inputToken = document.getElementById('input-token').value;
    const outputToken = document.getElementById('output-token').value;
    const rateElement = document.getElementById('exchange-rate');
    
    const rate = calculateExchangeRate(inputToken, outputToken);
    rateElement.textContent = `1 ${inputToken} = ${rate} ${outputToken}`;
  }
  
  function calculateOutputAmount() {
    const inputAmount = parseFloat(document.getElementById('input-amount').value) || 0;
    const inputToken = document.getElementById('input-token').value;
    const outputToken = document.getElementById('output-token').value;
    const outputAmountElement = document.getElementById('output-amount');
    
    if (inputAmount <= 0) {
      outputAmountElement.value = '';
      return;
    }
    
    if (!tokenPrices[inputToken] || !tokenPrices[outputToken]) {
      outputAmountElement.value = 'N/A';
      return;
    }
    
    const rate = tokenPrices[outputToken].price / tokenPrices[inputToken].price;
    const outputAmount = inputAmount * rate;
    
    outputAmountElement.value = outputAmount.toFixed(6);
  }
  
  function validateForm() {
    const inputAmount = parseFloat(document.getElementById('input-amount').value) || 0;
    const inputToken = document.getElementById('input-token').value;
    const outputToken = document.getElementById('output-token').value;
    const errorElement = document.getElementById('error-message');
    
    // Clear previous errors
    errorElement.textContent = '';
    
    // Check for valid input amount
    if (inputAmount <= 0) {
      errorElement.textContent = 'Please enter a valid amount';
      return false;
    }
    
    // Check if tokens are the same
    if (inputToken === outputToken) {
      errorElement.textContent = 'Please select different tokens';
      return false;
    }
    
    // Check if prices are available
    if (!tokenPrices[inputToken] || !tokenPrices[outputToken]) {
      errorElement.textContent = 'Price information not available for selected tokens';
      return false;
    }
    
    return true;
  }
  
  function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
    } else {
      alert(message);
    }
  }
  
  function showLoadingState(isLoading) {
    const swapButton = document.getElementById('swap-button');
    if (!swapButton) return;
    
    if (isLoading) {
      swapButton.disabled = true;
      swapButton.classList.add('loading');
    } else {
      swapButton.disabled = false;
      swapButton.classList.remove('loading');
    }
  }
  
  function processSwap() {
    const inputAmount = parseFloat(document.getElementById('input-amount').value);
    const inputToken = document.getElementById('input-token').value;
    const outputAmount = parseFloat(document.getElementById('output-amount').value);
    const outputToken = document.getElementById('output-token').value;
    
    // Show loading state
    showLoadingState(true);
    
    // Simulate API call delay
    setTimeout(() => {
      showLoadingState(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = `Successfully swapped ${inputAmount} ${inputToken} for ${outputAmount} ${outputToken}`;
      
      form.appendChild(successMessage);
      
      // Reset form
      document.getElementById('input-amount').value = '';
      document.getElementById('output-amount').value = '';
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        form.removeChild(successMessage);
      }, 3000);
    }, 1500);
  }
});
