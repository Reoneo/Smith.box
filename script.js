// script.js

document.addEventListener('DOMContentLoaded', () => {
  // ─── 1) HEADER TYPING EFFECT ───
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
  const typingSpeed = 100;
  const erasingSpeed = 50;
  const delayBetween = 2000;
  const changingTextEl = document.getElementById('changing-text');

  function typeWord(word, charIndex = 0) {
    if (charIndex < word.length) {
      changingTextEl.textContent += word.charAt(charIndex);
      setTimeout(() => typeWord(word, charIndex + 1), typingSpeed);
    } else {
      setTimeout(eraseWord, delayBetween);
    }
  }

  function eraseWord() {
    if (changingTextEl.textContent.length > 0) {
      changingTextEl.textContent = changingTextEl.textContent.slice(0, -1);
      setTimeout(eraseWord, erasingSpeed);
    } else {
      idx = (idx + 1) % subdomains.length;
      setTimeout(() => typeWord(subdomains[idx]), typingSpeed);
    }
  }

  // Start the typing loop
  typeWord(subdomains[idx]);


  // ─── 2) WALLET CONNECT ───
  const walletBtn = document.getElementById('wallet-connect');
  let provider, signer;

  async function connectWallet() {
    if (typeof window.ethers === 'undefined' || !window.ethereum) {
      return alert('MetaMask (or another EVM-compatible wallet) not detected.');
    }

    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []); // Prompt user
      signer = provider.getSigner();
      const address = await signer.getAddress();

      walletBtn.classList.add('connected');
      walletBtn.title = address;

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } catch (err) {
      if (err.code === 4001) {
        // User rejected request
        console.log('User rejected wallet connection');
      } else {
        console.error('Wallet connect failed', err);
        alert('Connection failed: ' + (err.message || err));
      }
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      walletBtn.classList.remove('connected');
      walletBtn.title = 'Connect Wallet';
    } else {
      walletBtn.title = accounts[0];
    }
  }

  function handleChainChanged(_chainId) {
    window.location.reload();
  }

  walletBtn.addEventListener('click', connectWallet);


  // ─── 3) OPTIONAL: FEATURE-BOX ENTRANCE ANIMATION ───
  // Requires Anime.js loaded via <script> in your HTML
  if (typeof anime !== 'undefined') {
    anime({
      targets: '.feature-box',
      opacity: [0, 1],
      translateY: [20, 0],
      easing: 'easeOutQuad',
      duration: 800,
      delay: anime.stagger(200) // stagger each by 0.2s
    });
  }
});