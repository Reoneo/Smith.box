// script.js

document.addEventListener('DOMContentLoaded', () => {
  // (1) TYPING ANIMATION (unchanged)…
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
      setTimeout(() => typeWord(word, i + 1), typingSpeed);
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


  // (2) SAFE WALLET CONNECT + ENS AVATAR RESOLUTION
  const walletBtn = document.getElementById('wallet-connect');
  const logoImg   = document.querySelector('.image-wrapper img');
  let provider, signer;

  async function connectWallet() {
    if (typeof window.ethers === 'undefined') {
      return alert('ethers.js not loaded.');
    }
    if (!window.ethereum) {
      return alert('No Ethereum provider detected. Install MetaMask.');
    }

    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);
      signer = provider.getSigner();
      const address = await signer.getAddress();

      // 1) UI update
      walletBtn.classList.add('connected');
      walletBtn.title = address;

      // 2) Fetch ENS profile via Cloudflare Worker API
      //    GET /address/:address?texts=avatar  [oai_citation:0‡GitHub](https://github.com/gskril/ens-api?utm_source=chatgpt.com)
      const apiURL = `https://ens-api.gskril.workers.dev/address/${address}?texts=avatar`;
      const res    = await fetch(apiURL);
      if (res.ok) {
        const json = await res.json();
        if (json.avatar) {
          logoImg.src = json.avatar;
        }
      }
      // 3) Listen for account/chain changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged',  handleChainChanged);

    } catch (err) {
      if (err.code === 4001) {
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
      // restore default logo
      logoImg.src = 'https://i.imgur.com/R3tbBZn.png';
    } else {
      walletBtn.title = accounts[0];
    }
  }

  function handleChainChanged(_chainId) {
    window.location.reload();
  }

  window.addEventListener('beforeunload', () => {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged',  handleChainChanged);
    }
  });

  walletBtn.addEventListener('click', connectWallet);
});