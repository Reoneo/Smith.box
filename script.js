// script.js

document.addEventListener('DOMContentLoaded', () => {
  // --- 1) TYPING ANIMATION (unchanged) ---
  const subdomains = [
    'Agent.Smith.box',
    'Sam.Smith.box',
    'Jessica.Smith.box',
    'Dave.Smith.box',
    'Zoe.Smith.box',
    'Wallet.Smith.box',
    'NFT.Smith.box',
    '1.Smith.box',
    'Tom.Smith.box'
  ];
  let idx = 0;
  const typingSpeed = 100, erasingSpeed = 50, delayBetween = 2000;
  const textEl = document.getElementById('changing-text');

  function typeWord(word, i = 0) {
    if (i < word.length) {
      textEl.textContent += word.charAt(i);
      setTimeout(() => typeWord(word, i+1), typingSpeed);
    } else {
      setTimeout(eraseWord, delayBetween);
    }
  }
  function eraseWord() {
    if (textEl.textContent.length > 0) {
      textEl.textContent = textEl.textContent.slice(0, -1);
      setTimeout(eraseWord, erasingSpeed);
    } else {
      idx = (idx + 1) % subdomains.length;
      setTimeout(() => typeWord(subdomains[idx]), typingSpeed);
    }
  }
  typeWord(subdomains[idx]);

  // --- 2) SAFE WALLET CONNECT ---
  const walletBtn = document.getElementById('wallet-connect');
  let provider, signer;

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert('No Ethereum provider detected. Install MetaMask.');
        return;
      }

      // 1) create ethers provider and request accounts
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);  // pop-up

      // 2) get signer and address
      signer = provider.getSigner();
      const address = await signer.getAddress();

      // 3) update UI
      walletBtn.classList.add('connected');
      walletBtn.title = address;

      // 4) listen for account or chain changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } catch (err) {
      console.error('Wallet connect failed', err);
      alert('Connection failed: ' + (err.message || err));
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // disconnected
      walletBtn.classList.remove('connected');
      walletBtn.title = 'Connect Wallet';
    } else {
      walletBtn.title = accounts[0];
    }
  }

  function handleChainChanged(_chainId) {
    // recommended by EIP-1193: reload on chain change
    window.location.reload();
  }

  // Clean up on unload
  window.addEventListener('beforeunload', () => {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  });

  // Attach click
  walletBtn.addEventListener('click', connectWallet);
});